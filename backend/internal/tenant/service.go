package tenant

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Tenant struct {
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	Slug      string         `json:"slug"`
	Settings  map[string]any `json:"settings"`
	Status    string         `json:"status"`
	CreatedAt string         `json:"created_at"`
}

type CreateInput struct {
	Name     string         `json:"name" binding:"required"`
	Slug     string         `json:"slug" binding:"required"`
	Settings map[string]any `json:"settings"`
}

type UpdateInput struct {
	Name     *string         `json:"name"`
	Settings *map[string]any `json:"settings"`
	Status   *string         `json:"status"`
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Tenant, error) {
	var t Tenant
	err := s.db.QueryRow(ctx,
		`INSERT INTO tenants (name, slug, settings, status)
		 VALUES ($1, $2, COALESCE($3::jsonb, '{}'::jsonb), 'active')
		 RETURNING id, name, slug, settings, status, created_at`,
		input.Name, input.Slug, input.Settings,
	).Scan(&t.ID, &t.Name, &t.Slug, &t.Settings, &t.Status, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create tenant: %w", err)
	}
	return &t, nil
}

func (s *Service) List(ctx context.Context) ([]Tenant, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, name, slug, settings, status, created_at FROM tenants ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("list tenants: %w", err)
	}
	defer rows.Close()

	var tenants []Tenant
	for rows.Next() {
		var t Tenant
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Settings, &t.Status, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan tenant: %w", err)
		}
		tenants = append(tenants, t)
	}
	return tenants, nil
}

func (s *Service) Update(ctx context.Context, id string, input UpdateInput) (*Tenant, error) {
	var t Tenant
	err := s.db.QueryRow(ctx,
		`UPDATE tenants SET
			name = COALESCE($2, name),
			settings = COALESCE($3::jsonb, settings),
			status = COALESCE($4, status),
			updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, name, slug, settings, status, created_at`,
		id, input.Name, input.Settings, input.Status,
	).Scan(&t.ID, &t.Name, &t.Slug, &t.Settings, &t.Status, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("update tenant: %w", err)
	}
	return &t, nil
}

func (s *Service) GetByID(ctx context.Context, id string) (*Tenant, error) {
	var t Tenant
	err := s.db.QueryRow(ctx,
		`SELECT id, name, slug, settings, status, created_at FROM tenants WHERE id = $1`,
		id,
	).Scan(&t.ID, &t.Name, &t.Slug, &t.Settings, &t.Status, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get tenant: %w", err)
	}
	return &t, nil
}
