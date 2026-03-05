package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db     *pgxpool.Pool
	client *http.Client
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db: db,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type Webhook struct {
	ID              string   `json:"id"`
	TenantID        string   `json:"tenant_id"`
	URL             string   `json:"url"`
	Events          []string `json:"events"`
	Secret          string   `json:"secret,omitempty"`
	Active          bool     `json:"active"`
	LastTriggeredAt *string  `json:"last_triggered_at"`
	LastStatus      *int     `json:"last_status"`
	FailureCount    int      `json:"failure_count"`
	CreatedAt       string   `json:"created_at"`
}

type WebhookLog struct {
	ID           string  `json:"id"`
	WebhookID    string  `json:"webhook_id"`
	Event        string  `json:"event"`
	Payload      string  `json:"payload"`
	StatusCode   *int    `json:"status_code"`
	ResponseBody *string `json:"response_body"`
	DurationMs   *int    `json:"duration_ms"`
	CreatedAt    string  `json:"created_at"`
}

type CreateInput struct {
	TenantID string   `json:"-"`
	URL      string   `json:"url" binding:"required"`
	Events   []string `json:"events" binding:"required"`
}

type UpdateInput struct {
	URL    *string  `json:"url"`
	Events []string `json:"events"`
	Active *bool    `json:"active"`
}

func generateSecret() string {
	b := make([]byte, 24)
	rand.Read(b)
	return "whsec_" + hex.EncodeToString(b)
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Webhook, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, url, events, active, last_triggered_at::text, last_status,
		        failure_count, created_at::text
		 FROM webhooks WHERE tenant_id = $1 ORDER BY created_at DESC`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list webhooks: %w", err)
	}
	defer rows.Close()

	var items []Webhook
	for rows.Next() {
		var w Webhook
		if err := rows.Scan(&w.ID, &w.TenantID, &w.URL, &w.Events, &w.Active,
			&w.LastTriggeredAt, &w.LastStatus, &w.FailureCount, &w.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan webhook: %w", err)
		}
		items = append(items, w)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Webhook, error) {
	secret := generateSecret()

	var w Webhook
	err := s.db.QueryRow(ctx,
		`INSERT INTO webhooks (tenant_id, url, events, secret)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, tenant_id, url, events, active, last_triggered_at::text, last_status,
		           failure_count, created_at::text`,
		input.TenantID, input.URL, input.Events, secret,
	).Scan(&w.ID, &w.TenantID, &w.URL, &w.Events, &w.Active,
		&w.LastTriggeredAt, &w.LastStatus, &w.FailureCount, &w.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create webhook: %w", err)
	}
	w.Secret = secret
	return &w, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Webhook, error) {
	if input.URL != nil {
		s.db.Exec(ctx, "UPDATE webhooks SET url = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.URL)
	}
	if input.Events != nil {
		s.db.Exec(ctx, "UPDATE webhooks SET events = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2", id, tenantID, input.Events)
	}
	if input.Active != nil {
		s.db.Exec(ctx, "UPDATE webhooks SET active = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.Active)
	}

	var w Webhook
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, url, events, active, last_triggered_at::text, last_status,
		        failure_count, created_at::text
		 FROM webhooks WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&w.ID, &w.TenantID, &w.URL, &w.Events, &w.Active,
		&w.LastTriggeredAt, &w.LastStatus, &w.FailureCount, &w.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("webhook not found: %w", err)
	}
	return &w, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM webhooks WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

func (s *Service) GetSecret(ctx context.Context, tenantID, id string) (string, error) {
	var secret string
	err := s.db.QueryRow(ctx,
		"SELECT secret FROM webhooks WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	).Scan(&secret)
	return secret, err
}

func (s *Service) GetLogs(ctx context.Context, webhookID string, limit int) ([]WebhookLog, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := s.db.Query(ctx,
		`SELECT id, webhook_id, event, payload::text, status_code, response_body, duration_ms, created_at::text
		 FROM webhook_logs WHERE webhook_id = $1 ORDER BY created_at DESC LIMIT $2`,
		webhookID, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("list logs: %w", err)
	}
	defer rows.Close()

	var items []WebhookLog
	for rows.Next() {
		var l WebhookLog
		if err := rows.Scan(&l.ID, &l.WebhookID, &l.Event, &l.Payload, &l.StatusCode,
			&l.ResponseBody, &l.DurationMs, &l.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan log: %w", err)
		}
		items = append(items, l)
	}
	return items, nil
}

func signPayload(secret string, payload []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	return hex.EncodeToString(mac.Sum(nil))
}

func (s *Service) Dispatch(ctx context.Context, tenantID, event string, data interface{}) {
	rows, _ := s.db.Query(ctx,
		"SELECT id, url, secret FROM webhooks WHERE tenant_id = $1 AND active = TRUE AND $2 = ANY(events)",
		tenantID, event,
	)
	if rows == nil {
		return
	}
	defer rows.Close()

	payload, _ := json.Marshal(map[string]interface{}{
		"event":     event,
		"tenant_id": tenantID,
		"data":      data,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})

	for rows.Next() {
		var id, url, secret string
		if rows.Scan(&id, &url, &secret) != nil {
			continue
		}
		go s.deliver(id, url, secret, event, payload)
	}
}

func (s *Service) deliver(webhookID, url, secret, event string, payload []byte) {
	sig := signPayload(secret, payload)

	req, _ := http.NewRequest("POST", url, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Signature", sig)
	req.Header.Set("X-Webhook-Event", event)

	start := time.Now()
	resp, err := s.client.Do(req)
	durationMs := int(time.Since(start).Milliseconds())

	var statusCode *int
	var responseBody *string

	if err == nil {
		sc := resp.StatusCode
		statusCode = &sc
		bodyBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		resp.Body.Close()
		rb := string(bodyBytes)
		responseBody = &rb
	}

	ctx := context.Background()
	s.db.Exec(ctx,
		`INSERT INTO webhook_logs (webhook_id, event, payload, status_code, response_body, duration_ms)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		webhookID, event, payload, statusCode, responseBody, durationMs,
	)

	if statusCode != nil && *statusCode >= 200 && *statusCode < 300 {
		s.db.Exec(ctx,
			"UPDATE webhooks SET last_triggered_at = NOW(), last_status = $2, failure_count = 0 WHERE id = $1",
			webhookID, *statusCode,
		)
	} else {
		s.db.Exec(ctx,
			"UPDATE webhooks SET last_triggered_at = NOW(), last_status = $2, failure_count = failure_count + 1 WHERE id = $1",
			webhookID, statusCode,
		)
	}
}

func (s *Service) Test(ctx context.Context, tenantID, id string) (*WebhookLog, error) {
	var url, secret string
	err := s.db.QueryRow(ctx,
		"SELECT url, secret FROM webhooks WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	).Scan(&url, &secret)
	if err != nil {
		return nil, fmt.Errorf("webhook not found: %w", err)
	}

	payload, _ := json.Marshal(map[string]interface{}{
		"event":     "test",
		"tenant_id": tenantID,
		"data":      map[string]string{"message": "This is a test webhook delivery"},
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})

	sig := signPayload(secret, payload)
	req, _ := http.NewRequest("POST", url, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Webhook-Signature", sig)
	req.Header.Set("X-Webhook-Event", "test")

	start := time.Now()
	resp, reqErr := s.client.Do(req)
	durationMs := int(time.Since(start).Milliseconds())

	var statusCode *int
	var responseBody *string
	if reqErr == nil {
		sc := resp.StatusCode
		statusCode = &sc
		bodyBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		resp.Body.Close()
		rb := string(bodyBytes)
		responseBody = &rb
	}

	var log WebhookLog
	err = s.db.QueryRow(ctx,
		`INSERT INTO webhook_logs (webhook_id, event, payload, status_code, response_body, duration_ms)
		 VALUES ($1, 'test', $2, $3, $4, $5)
		 RETURNING id, webhook_id, event, payload::text, status_code, response_body, duration_ms, created_at::text`,
		id, payload, statusCode, responseBody, durationMs,
	).Scan(&log.ID, &log.WebhookID, &log.Event, &log.Payload, &log.StatusCode,
		&log.ResponseBody, &log.DurationMs, &log.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("save log: %w", err)
	}
	return &log, nil
}
