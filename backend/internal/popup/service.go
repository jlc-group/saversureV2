package popup

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

type Popup struct {
	ID          string   `json:"id"`
	TenantID    string   `json:"tenant_id"`
	Title       string   `json:"title"`
	Content     *string  `json:"content"`
	ImageURL    *string  `json:"image_url"`
	LinkURL     *string  `json:"link_url"`
	TriggerType string   `json:"trigger_type"`
	TargetPages []string `json:"target_pages"`
	Frequency   string   `json:"frequency"`
	Priority    int      `json:"priority"`
	Status      string   `json:"status"`
	StartsAt    *string  `json:"starts_at"`
	EndsAt      *string  `json:"ends_at"`
	CreatedAt   string   `json:"created_at"`
	UpdatedAt   string   `json:"updated_at"`
}

type CreateInput struct {
	TenantID    string   `json:"-"`
	Title       string   `json:"title" binding:"required"`
	Content     string   `json:"content"`
	ImageURL    string   `json:"image_url"`
	LinkURL     string   `json:"link_url"`
	TriggerType string   `json:"trigger_type"`
	TargetPages []string `json:"target_pages"`
	Frequency   string   `json:"frequency"`
	Priority    int      `json:"priority"`
	StartsAt    string   `json:"starts_at"`
	EndsAt      string   `json:"ends_at"`
}

type UpdateInput struct {
	Title       *string  `json:"title"`
	Content     *string  `json:"content"`
	ImageURL    *string  `json:"image_url"`
	LinkURL     *string  `json:"link_url"`
	TriggerType *string  `json:"trigger_type"`
	TargetPages []string `json:"target_pages,omitempty"`
	Frequency   *string  `json:"frequency"`
	Priority    *int     `json:"priority"`
	Status      *string  `json:"status"`
	StartsAt    *string  `json:"starts_at"`
	EndsAt      *string  `json:"ends_at"`
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Popup, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, title, content, image_url, link_url,
		        trigger_type, target_pages, frequency, priority, status,
		        starts_at::text, ends_at::text, created_at::text, updated_at::text
		 FROM popups
		 WHERE tenant_id = $1
		 ORDER BY priority DESC, created_at DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list popups: %w", err)
	}
	defer rows.Close()

	var items []Popup
	for rows.Next() {
		var p Popup
		if err := rows.Scan(&p.ID, &p.TenantID, &p.Title, &p.Content,
			&p.ImageURL, &p.LinkURL, &p.TriggerType, &p.TargetPages,
			&p.Frequency, &p.Priority, &p.Status,
			&p.StartsAt, &p.EndsAt, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan popup: %w", err)
		}
		if p.TargetPages == nil {
			p.TargetPages = []string{}
		}
		items = append(items, p)
	}
	return items, nil
}

func (s *Service) ListActive(ctx context.Context, tenantID, page string) ([]Popup, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, title, content, image_url, link_url,
		        trigger_type, target_pages, frequency, priority, status,
		        starts_at::text, ends_at::text, created_at::text, updated_at::text
		 FROM popups
		 WHERE tenant_id = $1 AND status = 'published'
		   AND (starts_at IS NULL OR starts_at <= $2)
		   AND (ends_at IS NULL OR ends_at >= $2)
		   AND (target_pages = '{}' OR $3 = ANY(target_pages))
		 ORDER BY priority DESC`, tenantID, now, page)
	if err != nil {
		return nil, fmt.Errorf("list active popups: %w", err)
	}
	defer rows.Close()

	var items []Popup
	for rows.Next() {
		var p Popup
		if err := rows.Scan(&p.ID, &p.TenantID, &p.Title, &p.Content,
			&p.ImageURL, &p.LinkURL, &p.TriggerType, &p.TargetPages,
			&p.Frequency, &p.Priority, &p.Status,
			&p.StartsAt, &p.EndsAt, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan popup: %w", err)
		}
		if p.TargetPages == nil {
			p.TargetPages = []string{}
		}
		items = append(items, p)
	}
	return items, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*Popup, error) {
	var p Popup
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, title, content, image_url, link_url,
		        trigger_type, target_pages, frequency, priority, status,
		        starts_at::text, ends_at::text, created_at::text, updated_at::text
		 FROM popups WHERE id = $1 AND tenant_id = $2`, id, tenantID,
	).Scan(&p.ID, &p.TenantID, &p.Title, &p.Content,
		&p.ImageURL, &p.LinkURL, &p.TriggerType, &p.TargetPages,
		&p.Frequency, &p.Priority, &p.Status,
		&p.StartsAt, &p.EndsAt, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("popup not found: %w", err)
	}
	if p.TargetPages == nil {
		p.TargetPages = []string{}
	}
	return &p, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Popup, error) {
	if input.TriggerType == "" {
		input.TriggerType = "on_load"
	}
	if input.Frequency == "" {
		input.Frequency = "every_visit"
	}
	if input.TargetPages == nil {
		input.TargetPages = []string{}
	}

	var p Popup
	err := s.db.QueryRow(ctx,
		`INSERT INTO popups (tenant_id, title, content, image_url, link_url,
		                     trigger_type, target_pages, frequency, priority,
		                     starts_at, ends_at)
		 VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''),
		         $6, $7, $8, $9,
		         NULLIF($10,'')::timestamptz, NULLIF($11,'')::timestamptz)
		 RETURNING id, tenant_id, title, content, image_url, link_url,
		           trigger_type, target_pages, frequency, priority, status,
		           starts_at::text, ends_at::text, created_at::text, updated_at::text`,
		input.TenantID, input.Title, input.Content, input.ImageURL, input.LinkURL,
		input.TriggerType, input.TargetPages, input.Frequency, input.Priority,
		input.StartsAt, input.EndsAt,
	).Scan(&p.ID, &p.TenantID, &p.Title, &p.Content,
		&p.ImageURL, &p.LinkURL, &p.TriggerType, &p.TargetPages,
		&p.Frequency, &p.Priority, &p.Status,
		&p.StartsAt, &p.EndsAt, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("create popup: %w", err)
	}
	if p.TargetPages == nil {
		p.TargetPages = []string{}
	}
	return &p, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Popup, error) {
	if input.Title != nil {
		s.db.Exec(ctx, `UPDATE popups SET title=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.Title)
	}
	if input.Content != nil {
		s.db.Exec(ctx, `UPDATE popups SET content=NULLIF($3,''), updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.Content)
	}
	if input.ImageURL != nil {
		s.db.Exec(ctx, `UPDATE popups SET image_url=NULLIF($3,''), updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.ImageURL)
	}
	if input.LinkURL != nil {
		s.db.Exec(ctx, `UPDATE popups SET link_url=NULLIF($3,''), updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.LinkURL)
	}
	if input.TriggerType != nil {
		s.db.Exec(ctx, `UPDATE popups SET trigger_type=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.TriggerType)
	}
	if input.TargetPages != nil {
		s.db.Exec(ctx, `UPDATE popups SET target_pages=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, input.TargetPages)
	}
	if input.Frequency != nil {
		s.db.Exec(ctx, `UPDATE popups SET frequency=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.Frequency)
	}
	if input.Priority != nil {
		s.db.Exec(ctx, `UPDATE popups SET priority=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.Priority)
	}
	if input.Status != nil {
		valid := map[string]bool{"draft": true, "published": true, "archived": true}
		if !valid[*input.Status] {
			return nil, fmt.Errorf("invalid status: %s", *input.Status)
		}
		s.db.Exec(ctx, `UPDATE popups SET status=$3, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.Status)
	}
	if input.StartsAt != nil {
		s.db.Exec(ctx, `UPDATE popups SET starts_at=NULLIF($3,'')::timestamptz, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.StartsAt)
	}
	if input.EndsAt != nil {
		s.db.Exec(ctx, `UPDATE popups SET ends_at=NULLIF($3,'')::timestamptz, updated_at=NOW() WHERE id=$1 AND tenant_id=$2`, id, tenantID, *input.EndsAt)
	}
	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM popups WHERE id=$1 AND tenant_id=$2`, id, tenantID)
	if err != nil {
		return fmt.Errorf("delete popup: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("popup not found")
	}
	return nil
}
