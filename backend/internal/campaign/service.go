package campaign

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Campaign struct {
	ID              string         `json:"id"`
	TenantID        string         `json:"tenant_id"`
	Name            string         `json:"name"`
	Description     *string        `json:"description"`
	Type            string         `json:"type"`
	StartDate       *time.Time     `json:"start_date"`
	EndDate         *time.Time     `json:"end_date"`
	TermsConditions *string        `json:"terms_conditions"`
	Status          string         `json:"status"`
	Settings        map[string]any `json:"settings"`
	CreatedBy       *string        `json:"created_by"`
	CreatedAt       string         `json:"created_at"`
}

type CreateInput struct {
	Name            string         `json:"name" binding:"required"`
	Description     string         `json:"description"`
	Type            string         `json:"type" binding:"required"`
	StartDate       *time.Time     `json:"start_date"`
	EndDate         *time.Time     `json:"end_date"`
	TermsConditions string         `json:"terms_conditions"`
	Settings        map[string]any `json:"settings"`
}

type UpdateInput struct {
	Name            *string         `json:"name"`
	Description     *string         `json:"description"`
	StartDate       *time.Time      `json:"start_date"`
	EndDate         *time.Time      `json:"end_date"`
	TermsConditions *string         `json:"terms_conditions"`
	Settings        *map[string]any `json:"settings"`
}

func (s *Service) Create(ctx context.Context, tenantID, userID string, input CreateInput) (*Campaign, error) {
	var c Campaign
	err := s.db.QueryRow(ctx,
		`INSERT INTO campaigns (tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', COALESCE($8::jsonb, '{}'::jsonb), $9)
		 RETURNING id, tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by, created_at`,
		tenantID, input.Name, input.Description, input.Type, input.StartDate, input.EndDate,
		input.TermsConditions, input.Settings, userID,
	).Scan(&c.ID, &c.TenantID, &c.Name, &c.Description, &c.Type, &c.StartDate, &c.EndDate,
		&c.TermsConditions, &c.Status, &c.Settings, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create campaign: %w", err)
	}
	return &c, nil
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Campaign, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by, created_at
		 FROM campaigns WHERE tenant_id = $1 ORDER BY created_at DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list campaigns: %w", err)
	}
	defer rows.Close()

	var campaigns []Campaign
	for rows.Next() {
		var c Campaign
		if err := rows.Scan(&c.ID, &c.TenantID, &c.Name, &c.Description, &c.Type, &c.StartDate, &c.EndDate,
			&c.TermsConditions, &c.Status, &c.Settings, &c.CreatedBy, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan campaign: %w", err)
		}
		campaigns = append(campaigns, c)
	}
	return campaigns, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*Campaign, error) {
	var c Campaign
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by, created_at
		 FROM campaigns WHERE id = $1 AND tenant_id = $2`, id, tenantID,
	).Scan(&c.ID, &c.TenantID, &c.Name, &c.Description, &c.Type, &c.StartDate, &c.EndDate,
		&c.TermsConditions, &c.Status, &c.Settings, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get campaign: %w", err)
	}
	return &c, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Campaign, error) {
	var c Campaign
	err := s.db.QueryRow(ctx,
		`UPDATE campaigns SET
			name = COALESCE($3, name),
			description = COALESCE($4, description),
			start_date = COALESCE($5, start_date),
			end_date = COALESCE($6, end_date),
			terms_conditions = COALESCE($7, terms_conditions),
			settings = COALESCE($8::jsonb, settings),
			updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by, created_at`,
		id, tenantID, input.Name, input.Description, input.StartDate, input.EndDate,
		input.TermsConditions, input.Settings,
	).Scan(&c.ID, &c.TenantID, &c.Name, &c.Description, &c.Type, &c.StartDate, &c.EndDate,
		&c.TermsConditions, &c.Status, &c.Settings, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("update campaign: %w", err)
	}
	return &c, nil
}

func (s *Service) Publish(ctx context.Context, tenantID, id string) (*Campaign, error) {
	var c Campaign
	err := s.db.QueryRow(ctx,
		`UPDATE campaigns SET status = 'active', updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status = 'draft'
		 RETURNING id, tenant_id, name, description, type, start_date, end_date, terms_conditions, status, settings, created_by, created_at`,
		id, tenantID,
	).Scan(&c.ID, &c.TenantID, &c.Name, &c.Description, &c.Type, &c.StartDate, &c.EndDate,
		&c.TermsConditions, &c.Status, &c.Settings, &c.CreatedBy, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("publish campaign: %w", err)
	}
	return &c, nil
}
