package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"saversure/internal/middleware"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserExists         = errors.New("user already exists")
	ErrUserNotFound       = errors.New("user not found")
)

type Service struct {
	db         *pgxpool.Pool
	jwtSecret  string
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewService(db *pgxpool.Pool, jwtSecret string, accessTTL, refreshTTL time.Duration) *Service {
	return &Service{
		db:         db,
		jwtSecret:  jwtSecret,
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

type RegisterInput struct {
	Email       string `json:"email" binding:"required,email"`
	Phone       string `json:"phone"`
	Password    string `json:"password" binding:"required,min=8"`
	DisplayName string `json:"display_name" binding:"required"`
	TenantID    string `json:"tenant_id" binding:"required"`
	PDPAConsent bool   `json:"pdpa_consent" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

func (s *Service) Register(ctx context.Context, input RegisterInput, ipAddr string) (*TokenPair, error) {
	if !input.PDPAConsent {
		return nil, errors.New("PDPA consent is required")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var userID string
	err = tx.QueryRow(ctx,
		`INSERT INTO users (tenant_id, email, phone, password_hash, display_name, status)
		 VALUES ($1, $2, $3, $4, $5, 'active')
		 ON CONFLICT (tenant_id, email) DO NOTHING
		 RETURNING id`,
		input.TenantID, input.Email, input.Phone, string(hash), input.DisplayName,
	).Scan(&userID)

	if err != nil {
		return nil, ErrUserExists
	}

	// Assign default role
	_, err = tx.Exec(ctx,
		`INSERT INTO user_roles (user_id, tenant_id, role) VALUES ($1, $2, 'api_client')`,
		userID, input.TenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("assign role: %w", err)
	}

	// Record PDPA consent
	_, err = tx.Exec(ctx,
		`INSERT INTO pdpa_consents (user_id, consent_type, ip_address) VALUES ($1, 'registration', $2)`,
		userID, ipAddr,
	)
	if err != nil {
		return nil, fmt.Errorf("record consent: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return s.generateTokenPair(userID, input.TenantID, "api_client")
}

func (s *Service) Login(ctx context.Context, input LoginInput) (*TokenPair, error) {
	var userID, passwordHash, tenantID, role string

	err := s.db.QueryRow(ctx,
		`SELECT u.id, u.password_hash, u.tenant_id, ur.role
		 FROM users u
		 JOIN user_roles ur ON ur.user_id = u.id
		 WHERE u.email = $1 AND u.status = 'active'
		 LIMIT 1`,
		input.Email,
	).Scan(&userID, &passwordHash, &tenantID, &role)

	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	return s.generateTokenPair(userID, tenantID, role)
}

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	claims := &middleware.Claims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidCredentials
	}

	return s.generateTokenPair(claims.UserID, claims.TenantID, claims.Role)
}

func (s *Service) generateTokenPair(userID, tenantID, role string) (*TokenPair, error) {
	now := time.Now()

	accessClaims := middleware.Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
		UserID:   userID,
		TenantID: tenantID,
		Role:     role,
	}

	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}

	refreshClaims := middleware.Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.refreshTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
		UserID:   userID,
		TenantID: tenantID,
		Role:     role,
	}

	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(s.accessTTL.Seconds()),
	}, nil
}
