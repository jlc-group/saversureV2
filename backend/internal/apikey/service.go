package apikey

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type APIKey struct {
	ID         string   `json:"id"`
	TenantID   string   `json:"tenant_id"`
	Name       string   `json:"name"`
	KeyPrefix  string   `json:"key_prefix"`
	Scopes     []string `json:"scopes"`
	LastUsedAt *string  `json:"last_used_at"`
	ExpiresAt  *string  `json:"expires_at"`
	Active     bool     `json:"active"`
	CreatedBy  string   `json:"created_by"`
	CreatedAt  string   `json:"created_at"`
}

type CreateInput struct {
	TenantID  string   `json:"-"`
	CreatedBy string   `json:"-"`
	Name      string   `json:"name" binding:"required"`
	Scopes    []string `json:"scopes"`
	ExpiresAt string   `json:"expires_at"`
}

type CreateResult struct {
	APIKey
	RawKey string `json:"raw_key"`
}

func generateKey() (raw, prefix, hash string) {
	b := make([]byte, 32)
	rand.Read(b)
	raw = "sv2_" + hex.EncodeToString(b)
	prefix = raw[:12]
	h := sha256.Sum256([]byte(raw))
	hash = hex.EncodeToString(h[:])
	return
}

func (s *Service) List(ctx context.Context, tenantID string) ([]APIKey, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, name, key_prefix, scopes, last_used_at::text, expires_at::text, active, created_by, created_at::text
		 FROM api_keys WHERE tenant_id = $1 ORDER BY created_at DESC`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list keys: %w", err)
	}
	defer rows.Close()

	var items []APIKey
	for rows.Next() {
		var k APIKey
		if err := rows.Scan(&k.ID, &k.TenantID, &k.Name, &k.KeyPrefix, &k.Scopes,
			&k.LastUsedAt, &k.ExpiresAt, &k.Active, &k.CreatedBy, &k.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan key: %w", err)
		}
		items = append(items, k)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*CreateResult, error) {
	rawKey, prefix, hash := generateKey()

	if input.Scopes == nil {
		input.Scopes = []string{}
	}

	var k APIKey
	err := s.db.QueryRow(ctx,
		`INSERT INTO api_keys (tenant_id, name, key_hash, key_prefix, scopes, expires_at, created_by)
		 VALUES ($1, $2, $3, $4, $5,
		        CASE WHEN $6 = '' THEN NULL ELSE $6::timestamptz END, $7)
		 RETURNING id, tenant_id, name, key_prefix, scopes, last_used_at::text, expires_at::text, active, created_by, created_at::text`,
		input.TenantID, input.Name, hash, prefix, input.Scopes, input.ExpiresAt, input.CreatedBy,
	).Scan(&k.ID, &k.TenantID, &k.Name, &k.KeyPrefix, &k.Scopes,
		&k.LastUsedAt, &k.ExpiresAt, &k.Active, &k.CreatedBy, &k.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create key: %w", err)
	}

	return &CreateResult{APIKey: k, RawKey: rawKey}, nil
}

func (s *Service) Revoke(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx,
		"UPDATE api_keys SET active = FALSE WHERE id = $1 AND tenant_id = $2",
		id, tenantID,
	)
	return err
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM api_keys WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}
