package tier

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

type Tier struct {
	ID        string `json:"id"`
	TenantID  string `json:"tenant_id"`
	Name      string `json:"name"`
	MinPoints int    `json:"min_points"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	SortOrder int    `json:"sort_order"`
	Active    bool   `json:"active"`
	CreatedAt string `json:"created_at"`
}

type CreateInput struct {
	TenantID  string `json:"-"`
	Name      string `json:"name" binding:"required"`
	MinPoints int    `json:"min_points"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	SortOrder int    `json:"sort_order"`
}

type UpdateInput struct {
	Name      *string `json:"name"`
	MinPoints *int    `json:"min_points"`
	Icon      *string `json:"icon"`
	Color     *string `json:"color"`
	SortOrder *int    `json:"sort_order"`
	Active    *bool   `json:"active"`
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Tier, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, name, min_points, icon, color, sort_order, active, created_at::text
		 FROM reward_tiers WHERE tenant_id = $1 ORDER BY sort_order, min_points`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list tiers: %w", err)
	}
	defer rows.Close()

	var items []Tier
	for rows.Next() {
		var t Tier
		if err := rows.Scan(&t.ID, &t.TenantID, &t.Name, &t.MinPoints, &t.Icon,
			&t.Color, &t.SortOrder, &t.Active, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan tier: %w", err)
		}
		items = append(items, t)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Tier, error) {
	if input.Icon == "" {
		input.Icon = "🥉"
	}
	if input.Color == "" {
		input.Color = "#CD7F32"
	}

	var t Tier
	err := s.db.QueryRow(ctx,
		`INSERT INTO reward_tiers (tenant_id, name, min_points, icon, color, sort_order)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, tenant_id, name, min_points, icon, color, sort_order, active, created_at::text`,
		input.TenantID, input.Name, input.MinPoints, input.Icon, input.Color, input.SortOrder,
	).Scan(&t.ID, &t.TenantID, &t.Name, &t.MinPoints, &t.Icon,
		&t.Color, &t.SortOrder, &t.Active, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create tier: %w", err)
	}
	return &t, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Tier, error) {
	if input.Name != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET name = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.Name)
	}
	if input.MinPoints != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET min_points = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.MinPoints)
	}
	if input.Icon != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET icon = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.Icon)
	}
	if input.Color != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET color = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.Color)
	}
	if input.SortOrder != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET sort_order = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.SortOrder)
	}
	if input.Active != nil {
		s.db.Exec(ctx, "UPDATE reward_tiers SET active = $3 WHERE id = $1 AND tenant_id = $2", id, tenantID, *input.Active)
	}

	var t Tier
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, name, min_points, icon, color, sort_order, active, created_at::text
		 FROM reward_tiers WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&t.ID, &t.TenantID, &t.Name, &t.MinPoints, &t.Icon,
		&t.Color, &t.SortOrder, &t.Active, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("tier not found: %w", err)
	}
	return &t, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM reward_tiers WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

func (s *Service) GetUserTier(ctx context.Context, tenantID, userID string) (*Tier, error) {
	var totalEarned int
	_ = s.db.QueryRow(ctx,
		`SELECT COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END), 0)
		 FROM point_ledger WHERE tenant_id = $1 AND user_id = $2`,
		tenantID, userID,
	).Scan(&totalEarned)

	var t Tier
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, name, min_points, icon, color, sort_order, active, created_at::text
		 FROM reward_tiers WHERE tenant_id = $1 AND active = TRUE AND min_points <= $2
		 ORDER BY min_points DESC LIMIT 1`,
		tenantID, totalEarned,
	).Scan(&t.ID, &t.TenantID, &t.Name, &t.MinPoints, &t.Icon,
		&t.Color, &t.SortOrder, &t.Active, &t.CreatedAt)
	if err != nil {
		return nil, nil
	}
	return &t, nil
}
