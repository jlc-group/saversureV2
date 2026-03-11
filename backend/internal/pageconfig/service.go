package pageconfig

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Section struct {
	ID      string         `json:"id"`
	Type    string         `json:"type"`
	Order   int            `json:"order"`
	Visible bool           `json:"visible"`
	Props   map[string]any `json:"props"`
}

type PageConfig struct {
	ID        string    `json:"id"`
	TenantID  string    `json:"tenant_id"`
	PageSlug  string    `json:"page_slug"`
	Sections  []Section `json:"sections"`
	Status    string    `json:"status"`
	Version   int       `json:"version"`
	UpdatedBy *string   `json:"updated_by"`
	CreatedAt string    `json:"created_at"`
	UpdatedAt string    `json:"updated_at"`
}

type UpsertInput struct {
	TenantID  string    `json:"-"`
	UserID    string    `json:"-"`
	PageSlug  string    `json:"page_slug" binding:"required"`
	Sections  []Section `json:"sections" binding:"required"`
	Status    string    `json:"status"`
}

func (s *Service) List(ctx context.Context, tenantID string) ([]PageConfig, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, page_slug, sections, status, version,
		        updated_by, created_at::text, updated_at::text
		 FROM page_configs
		 WHERE tenant_id = $1
		 ORDER BY page_slug`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list page_configs: %w", err)
	}
	defer rows.Close()

	var items []PageConfig
	for rows.Next() {
		var pc PageConfig
		var sectionsJSON []byte
		if err := rows.Scan(&pc.ID, &pc.TenantID, &pc.PageSlug, &sectionsJSON,
			&pc.Status, &pc.Version, &pc.UpdatedBy, &pc.CreatedAt, &pc.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan page_config: %w", err)
		}
		if err := json.Unmarshal(sectionsJSON, &pc.Sections); err != nil {
			pc.Sections = []Section{}
		}
		items = append(items, pc)
	}
	return items, nil
}

func (s *Service) GetBySlug(ctx context.Context, tenantID, slug string) (*PageConfig, error) {
	var pc PageConfig
	var sectionsJSON []byte
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, page_slug, sections, status, version,
		        updated_by, created_at::text, updated_at::text
		 FROM page_configs
		 WHERE tenant_id = $1 AND page_slug = $2`,
		tenantID, slug,
	).Scan(&pc.ID, &pc.TenantID, &pc.PageSlug, &sectionsJSON,
		&pc.Status, &pc.Version, &pc.UpdatedBy, &pc.CreatedAt, &pc.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("page_config not found: %w", err)
	}
	if err := json.Unmarshal(sectionsJSON, &pc.Sections); err != nil {
		pc.Sections = []Section{}
	}
	return &pc, nil
}

func (s *Service) GetPublished(ctx context.Context, tenantID, slug string) (*PageConfig, error) {
	var pc PageConfig
	var sectionsJSON []byte
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, page_slug, sections, status, version,
		        updated_by, created_at::text, updated_at::text
		 FROM page_configs
		 WHERE tenant_id = $1 AND page_slug = $2 AND status = 'published'`,
		tenantID, slug,
	).Scan(&pc.ID, &pc.TenantID, &pc.PageSlug, &sectionsJSON,
		&pc.Status, &pc.Version, &pc.UpdatedBy, &pc.CreatedAt, &pc.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("page_config not found: %w", err)
	}
	if err := json.Unmarshal(sectionsJSON, &pc.Sections); err != nil {
		pc.Sections = []Section{}
	}
	return &pc, nil
}

func (s *Service) Upsert(ctx context.Context, input UpsertInput) (*PageConfig, error) {
	if input.Status == "" {
		input.Status = "published"
	}
	validStatus := map[string]bool{"draft": true, "published": true}
	if !validStatus[input.Status] {
		return nil, fmt.Errorf("invalid status: %s", input.Status)
	}

	sectionsJSON, err := json.Marshal(input.Sections)
	if err != nil {
		return nil, fmt.Errorf("marshal sections: %w", err)
	}

	var pc PageConfig
	var outJSON []byte
	err = s.db.QueryRow(ctx,
		`INSERT INTO page_configs (tenant_id, page_slug, sections, status, updated_by)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (tenant_id, page_slug)
		 DO UPDATE SET sections = $3, status = $4, updated_by = $5,
		              version = page_configs.version + 1, updated_at = NOW()
		 RETURNING id, tenant_id, page_slug, sections, status, version,
		           updated_by, created_at::text, updated_at::text`,
		input.TenantID, input.PageSlug, sectionsJSON, input.Status, input.UserID,
	).Scan(&pc.ID, &pc.TenantID, &pc.PageSlug, &outJSON,
		&pc.Status, &pc.Version, &pc.UpdatedBy, &pc.CreatedAt, &pc.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("upsert page_config: %w", err)
	}
	if err := json.Unmarshal(outJSON, &pc.Sections); err != nil {
		pc.Sections = []Section{}
	}
	return &pc, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, slug string) error {
	result, err := s.db.Exec(ctx,
		`DELETE FROM page_configs WHERE tenant_id = $1 AND page_slug = $2`,
		tenantID, slug)
	if err != nil {
		return fmt.Errorf("delete page_config: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("page_config not found")
	}
	return nil
}
