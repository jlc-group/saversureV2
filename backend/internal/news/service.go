package news

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

type News struct {
	ID          string  `json:"id"`
	TenantID    string  `json:"tenant_id"`
	Title       string  `json:"title"`
	Content     *string `json:"content"`
	ImageURL    *string `json:"image_url"`
	LinkURL     *string `json:"link_url"`
	Position    int     `json:"position"`
	Type        string  `json:"type"`
	Status      string  `json:"status"`
	PublishedAt *string `json:"published_at"`
	CreatedAt   string  `json:"created_at"`
}

type ListFilter struct {
	Status string
	Type   string
	Limit  int
	Offset int
}

type CreateInput struct {
	TenantID string `json:"-"`
	Title    string `json:"title" binding:"required"`
	Content  string `json:"content"`
	ImageURL string `json:"image_url"`
	LinkURL  string `json:"link_url"`
	Position int    `json:"position"`
	Type     string `json:"type"`
}

type UpdateInput struct {
	Title    *string `json:"title"`
	Content  *string `json:"content"`
	ImageURL *string `json:"image_url"`
	LinkURL  *string `json:"link_url"`
	Position *int    `json:"position"`
	Type     *string `json:"type"`
	Status   *string `json:"status"`
}

func (s *Service) List(ctx context.Context, tenantID string, f ListFilter) ([]News, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where := "tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if f.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argN)
		args = append(args, f.Status)
		argN++
	}
	if f.Type != "" {
		where += fmt.Sprintf(" AND type = $%d", argN)
		args = append(args, f.Type)
		argN++
	}

	var total int64
	_ = s.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM news WHERE %s", where), args...).Scan(&total)

	query := fmt.Sprintf(
		`SELECT id, tenant_id, title, content, image_url, link_url, position, type, status, published_at::text, created_at::text
		 FROM news WHERE %s ORDER BY position ASC, created_at DESC LIMIT $%d OFFSET $%d`,
		where, argN, argN+1,
	)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list news: %w", err)
	}
	defer rows.Close()

	var items []News
	for rows.Next() {
		var n News
		if err := rows.Scan(&n.ID, &n.TenantID, &n.Title, &n.Content, &n.ImageURL,
			&n.LinkURL, &n.Position, &n.Type, &n.Status, &n.PublishedAt, &n.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan news: %w", err)
		}
		items = append(items, n)
	}
	return items, total, nil
}

func (s *Service) ListPublished(ctx context.Context, tenantID string, newsType string, limit int) ([]News, error) {
	if limit <= 0 {
		limit = 20
	}

	where := "tenant_id = $1 AND status = 'published'"
	args := []any{tenantID}
	argN := 2

	if newsType != "" {
		where += fmt.Sprintf(" AND type = $%d", argN)
		args = append(args, newsType)
		argN++
	}

	query := fmt.Sprintf(
		`SELECT id, tenant_id, title, content, image_url, link_url, position, type, status, published_at::text, created_at::text
		 FROM news WHERE %s ORDER BY position ASC, created_at DESC LIMIT $%d`,
		where, argN,
	)
	args = append(args, limit)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list published news: %w", err)
	}
	defer rows.Close()

	var items []News
	for rows.Next() {
		var n News
		if err := rows.Scan(&n.ID, &n.TenantID, &n.Title, &n.Content, &n.ImageURL,
			&n.LinkURL, &n.Position, &n.Type, &n.Status, &n.PublishedAt, &n.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan news: %w", err)
		}
		items = append(items, n)
	}
	return items, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*News, error) {
	var n News
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, title, content, image_url, link_url, position, type, status, published_at::text, created_at::text
		 FROM news WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&n.ID, &n.TenantID, &n.Title, &n.Content, &n.ImageURL,
		&n.LinkURL, &n.Position, &n.Type, &n.Status, &n.PublishedAt, &n.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("news not found: %w", err)
	}
	return &n, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*News, error) {
	if input.Type == "" {
		input.Type = "news"
	}
	valid := map[string]bool{"news": true, "banner": true}
	if !valid[input.Type] {
		return nil, fmt.Errorf("invalid type: %s", input.Type)
	}

	var n News
	err := s.db.QueryRow(ctx,
		`INSERT INTO news (tenant_id, title, content, image_url, link_url, position, type)
		 VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''), $6, $7)
		 RETURNING id, tenant_id, title, content, image_url, link_url, position, type, status, published_at::text, created_at::text`,
		input.TenantID, input.Title, input.Content, input.ImageURL, input.LinkURL, input.Position, input.Type,
	).Scan(&n.ID, &n.TenantID, &n.Title, &n.Content, &n.ImageURL,
		&n.LinkURL, &n.Position, &n.Type, &n.Status, &n.PublishedAt, &n.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create news: %w", err)
	}
	return &n, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*News, error) {
	if input.Title != nil {
		s.db.Exec(ctx, `UPDATE news SET title = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Title)
	}
	if input.Content != nil {
		s.db.Exec(ctx, `UPDATE news SET content = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Content)
	}
	if input.ImageURL != nil {
		s.db.Exec(ctx, `UPDATE news SET image_url = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.ImageURL)
	}
	if input.LinkURL != nil {
		s.db.Exec(ctx, `UPDATE news SET link_url = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.LinkURL)
	}
	if input.Position != nil {
		s.db.Exec(ctx, `UPDATE news SET position = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Position)
	}
	if input.Type != nil {
		valid := map[string]bool{"news": true, "banner": true}
		if !valid[*input.Type] {
			return nil, fmt.Errorf("invalid type: %s", *input.Type)
		}
		s.db.Exec(ctx, `UPDATE news SET type = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Type)
	}
	if input.Status != nil {
		valid := map[string]bool{"draft": true, "published": true, "archived": true}
		if !valid[*input.Status] {
			return nil, fmt.Errorf("invalid status: %s", *input.Status)
		}
		if *input.Status == "published" {
			s.db.Exec(ctx, `UPDATE news SET status = $3, published_at = NOW(), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Status)
		} else {
			s.db.Exec(ctx, `UPDATE news SET status = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Status)
		}
	}

	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	result, err := s.db.Exec(ctx, `DELETE FROM news WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	if err != nil {
		return fmt.Errorf("delete news: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("news not found")
	}
	return nil
}
