package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LINEConfig struct {
	ChannelID     string
	ChannelSecret string
	CallbackURL   string
}

type LINEService struct {
	db     *pgxpool.Pool
	auth   *Service
	config LINEConfig
}

func NewLINEService(db *pgxpool.Pool, authSvc *Service, cfg LINEConfig) *LINEService {
	return &LINEService{db: db, auth: authSvc, config: cfg}
}

func (s *LINEService) IsConfigured() bool {
	return s.config.ChannelID != "" && s.config.ChannelSecret != ""
}

func (s *LINEService) AuthorizationURL(state string) string {
	params := url.Values{
		"response_type": {"code"},
		"client_id":     {s.config.ChannelID},
		"redirect_uri":  {s.config.CallbackURL},
		"state":         {state},
		"scope":         {"profile openid email"},
	}
	return "https://access.line.me/oauth2/v2.1/authorize?" + params.Encode()
}

type lineTokenResponse struct {
	AccessToken  string `json:"access_token"`
	IDToken      string `json:"id_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	Scope        string `json:"scope"`
}

type lineProfile struct {
	UserID        string `json:"userId"`
	DisplayName   string `json:"displayName"`
	PictureURL    string `json:"pictureUrl"`
	StatusMessage string `json:"statusMessage"`
}

func (s *LINEService) ExchangeCode(ctx context.Context, code string) (*lineTokenResponse, error) {
	data := url.Values{
		"grant_type":    {"authorization_code"},
		"code":          {code},
		"redirect_uri":  {s.config.CallbackURL},
		"client_id":     {s.config.ChannelID},
		"client_secret": {s.config.ChannelSecret},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.line.me/oauth2/v2.1/token", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("token request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LINE token error (%d): %s", resp.StatusCode, string(body))
	}

	var tok lineTokenResponse
	if err := json.Unmarshal(body, &tok); err != nil {
		return nil, fmt.Errorf("decode token: %w", err)
	}
	return &tok, nil
}

func (s *LINEService) GetProfile(ctx context.Context, accessToken string) (*lineProfile, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://api.line.me/v2/profile", nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("profile request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("LINE profile error (%d): %s", resp.StatusCode, string(body))
	}

	var profile lineProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return nil, fmt.Errorf("decode profile: %w", err)
	}
	return &profile, nil
}

func (s *LINEService) LoginOrRegister(ctx context.Context, tenantID, code, ipAddr string) (*TokenPair, error) {
	tok, err := s.ExchangeCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("exchange code: %w", err)
	}

	profile, err := s.GetProfile(ctx, tok.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("get profile: %w", err)
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var userID string
	err = tx.QueryRow(ctx,
		`SELECT id FROM users WHERE tenant_id = $1 AND line_user_id = $2 AND status = 'active'`,
		tenantID, profile.UserID,
	).Scan(&userID)

	if err != nil {
		err = tx.QueryRow(ctx,
			`INSERT INTO users (tenant_id, line_user_id, line_display_name, line_picture_url, display_name, status)
			 VALUES ($1, $2, $3, $4, $5, 'active')
			 RETURNING id`,
			tenantID, profile.UserID, profile.DisplayName, profile.PictureURL, profile.DisplayName,
		).Scan(&userID)
		if err != nil {
			return nil, fmt.Errorf("create user: %w", err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO user_roles (user_id, tenant_id, role) VALUES ($1, $2, 'api_client')`,
			userID, tenantID,
		)
		if err != nil {
			return nil, fmt.Errorf("assign role: %w", err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO pdpa_consents (user_id, consent_type, ip_address) VALUES ($1, 'line_login', $2)`,
			userID, ipAddr,
		)
		if err != nil {
			return nil, fmt.Errorf("record consent: %w", err)
		}
	} else {
		_, _ = tx.Exec(ctx,
			`UPDATE users SET line_display_name = $1, line_picture_url = $2, last_login_at = NOW(), updated_at = NOW()
			 WHERE id = $3`,
			profile.DisplayName, profile.PictureURL, userID,
		)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return s.auth.generateTokenPair(userID, tenantID, "api_client", nil)
}
