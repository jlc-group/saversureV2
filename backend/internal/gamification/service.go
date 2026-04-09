package gamification

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Mission struct {
	ID             string  `json:"id"`
	TenantID       string  `json:"tenant_id"`
	Title          string  `json:"title"`
	Description    *string `json:"description"`
	ImageURL       *string `json:"image_url"`
	Type           string  `json:"type"`
	Condition      string  `json:"condition"`
	RewardType     string  `json:"reward_type"`
	RewardPoints   int     `json:"reward_points"`
	RewardBadgeID  *string `json:"reward_badge_id"`
	RewardCurrency string  `json:"reward_currency"`
	StartDate      *string `json:"start_date"`
	EndDate        *string `json:"end_date"`
	Active         bool    `json:"active"`
	SortOrder      int     `json:"sort_order"`
	CreatedAt      string  `json:"created_at"`
}

type UserMission struct {
	ID          string  `json:"id"`
	UserID      string  `json:"user_id"`
	MissionID   string  `json:"mission_id"`
	Progress    int     `json:"progress"`
	Target      int     `json:"target"`
	Completed   bool    `json:"completed"`
	CompletedAt *string `json:"completed_at"`
	Rewarded    bool    `json:"rewarded"`
	Mission     *Mission `json:"mission,omitempty"`
}

type Badge struct {
	ID          string  `json:"id"`
	TenantID    string  `json:"tenant_id"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	IconURL     *string `json:"icon_url"`
	Rarity      string  `json:"rarity"`
	SortOrder   int     `json:"sort_order"`
	Active      bool    `json:"active"`
	CreatedAt   string  `json:"created_at"`
}

type UserBadge struct {
	ID       string `json:"id"`
	UserID   string `json:"user_id"`
	BadgeID  string `json:"badge_id"`
	EarnedAt string `json:"earned_at"`
	Badge    *Badge `json:"badge,omitempty"`
}

type LeaderboardEntry struct {
	UserID    string `json:"user_id"`
	Score     int    `json:"score"`
	Rank      int    `json:"rank"`
	Period    string `json:"period"`
	PeriodKey string `json:"period_key"`
	Category  string `json:"category"`
}

type CreateMissionInput struct {
	TenantID       string `json:"-"`
	Title          string `json:"title" binding:"required"`
	Description    string `json:"description"`
	ImageURL       string `json:"image_url"`
	Type           string `json:"type"`
	Condition      string `json:"condition"`
	RewardType     string `json:"reward_type"`
	RewardPoints   int    `json:"reward_points"`
	RewardBadgeID  string `json:"reward_badge_id"`
	RewardCurrency string `json:"reward_currency"`
	StartDate      string `json:"start_date"`
	EndDate        string `json:"end_date"`
}

type CreateBadgeInput struct {
	TenantID    string `json:"-"`
	Code        string `json:"code" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
	Rarity      string `json:"rarity"`
}

type UpdateMissionInput struct {
	Title          *string `json:"title"`
	Description    *string `json:"description"`
	ImageURL       *string `json:"image_url"`
	Type           *string `json:"type"`
	Condition      *string `json:"condition"`
	RewardType     *string `json:"reward_type"`
	RewardPoints   *int    `json:"reward_points"`
	RewardBadgeID  *string `json:"reward_badge_id"`
	RewardCurrency *string `json:"reward_currency"`
	StartDate      *string `json:"start_date"`
	EndDate        *string `json:"end_date"`
	Active         *bool   `json:"active"`
}

type UpdateBadgeInput struct {
	Code        *string `json:"code"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	IconURL     *string `json:"icon_url"`
	Rarity      *string `json:"rarity"`
	Active      *bool   `json:"active"`
}

func (s *Service) ListMissions(ctx context.Context, tenantID string, activeOnly bool) ([]Mission, error) {
	query := `SELECT id, tenant_id, title, description, image_url, type,
	                 condition::text, reward_type, reward_points, reward_badge_id,
	                 reward_currency, start_date::text, end_date::text, active,
	                 sort_order, created_at::text
	          FROM missions WHERE tenant_id = $1`
	if activeOnly {
		query += " AND active = TRUE"
	}
	query += " ORDER BY sort_order, created_at DESC"

	rows, err := s.db.Query(ctx, query, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list missions: %w", err)
	}
	defer rows.Close()

	var items []Mission
	for rows.Next() {
		var m Mission
		if err := rows.Scan(&m.ID, &m.TenantID, &m.Title, &m.Description, &m.ImageURL,
			&m.Type, &m.Condition, &m.RewardType, &m.RewardPoints, &m.RewardBadgeID,
			&m.RewardCurrency, &m.StartDate, &m.EndDate, &m.Active,
			&m.SortOrder, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan mission: %w", err)
		}
		items = append(items, m)
	}
	return items, nil
}

func (s *Service) GetMissionByID(ctx context.Context, tenantID, id string) (*Mission, error) {
	var m Mission
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, title, description, image_url, type,
		        condition::text, reward_type, reward_points, reward_badge_id,
		        reward_currency, start_date::text, end_date::text, active,
		        sort_order, created_at::text
		 FROM missions WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&m.ID, &m.TenantID, &m.Title, &m.Description, &m.ImageURL,
		&m.Type, &m.Condition, &m.RewardType, &m.RewardPoints, &m.RewardBadgeID,
		&m.RewardCurrency, &m.StartDate, &m.EndDate, &m.Active,
		&m.SortOrder, &m.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("mission not found")
		}
		return nil, fmt.Errorf("get mission: %w", err)
	}
	return &m, nil
}

func (s *Service) CreateMission(ctx context.Context, input CreateMissionInput) (*Mission, error) {
	if input.Type == "" {
		input.Type = "count"
	}
	if input.RewardType == "" {
		input.RewardType = "points"
	}
	if input.RewardCurrency == "" {
		input.RewardCurrency = "point"
	}
	if input.Condition == "" {
		input.Condition = "{}"
	}

	var m Mission
	err := s.db.QueryRow(ctx,
		`INSERT INTO missions (tenant_id, title, description, image_url, type, condition,
		        reward_type, reward_points, reward_badge_id, reward_currency, start_date, end_date)
		 VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), $5, $6::jsonb,
		        $7, $8, CASE WHEN $9 = '' THEN NULL ELSE $9::uuid END, $10,
		        CASE WHEN $11 = '' THEN NULL ELSE $11::timestamptz END,
		        CASE WHEN $12 = '' THEN NULL ELSE $12::timestamptz END)
		 RETURNING id, tenant_id, title, description, image_url, type,
		           condition::text, reward_type, reward_points, reward_badge_id,
		           reward_currency, start_date::text, end_date::text, active,
		           sort_order, created_at::text`,
		input.TenantID, input.Title, input.Description, input.ImageURL,
		input.Type, input.Condition, input.RewardType, input.RewardPoints,
		input.RewardBadgeID, input.RewardCurrency, input.StartDate, input.EndDate,
	).Scan(&m.ID, &m.TenantID, &m.Title, &m.Description, &m.ImageURL,
		&m.Type, &m.Condition, &m.RewardType, &m.RewardPoints, &m.RewardBadgeID,
		&m.RewardCurrency, &m.StartDate, &m.EndDate, &m.Active,
		&m.SortOrder, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create mission: %w", err)
	}
	return &m, nil
}

func (s *Service) UpdateMission(ctx context.Context, tenantID, id string, input UpdateMissionInput) error {
	q := "UPDATE missions SET updated_at = NOW()"
	args := []interface{}{id, tenantID}
	i := 3

	if input.Title != nil {
		q += fmt.Sprintf(", title = $%d", i)
		args = append(args, *input.Title)
		i++
	}
	if input.Description != nil {
		q += fmt.Sprintf(", description = NULLIF($%d,'')", i)
		args = append(args, *input.Description)
		i++
	}
	if input.ImageURL != nil {
		q += fmt.Sprintf(", image_url = NULLIF($%d,'')", i)
		args = append(args, *input.ImageURL)
		i++
	}
	if input.Type != nil {
		q += fmt.Sprintf(", type = $%d", i)
		args = append(args, *input.Type)
		i++
	}
	if input.Condition != nil {
		q += fmt.Sprintf(", condition = $%d::jsonb", i)
		args = append(args, *input.Condition)
		i++
	}
	if input.RewardType != nil {
		q += fmt.Sprintf(", reward_type = $%d", i)
		args = append(args, *input.RewardType)
		i++
	}
	if input.RewardPoints != nil {
		q += fmt.Sprintf(", reward_points = $%d", i)
		args = append(args, *input.RewardPoints)
		i++
	}
	if input.RewardBadgeID != nil {
		q += fmt.Sprintf(", reward_badge_id = CASE WHEN $%d = '' THEN NULL ELSE $%d::uuid END", i, i)
		args = append(args, *input.RewardBadgeID)
		i++
	}
	if input.RewardCurrency != nil {
		q += fmt.Sprintf(", reward_currency = $%d", i)
		args = append(args, *input.RewardCurrency)
		i++
	}
	if input.StartDate != nil {
		q += fmt.Sprintf(", start_date = CASE WHEN $%d = '' THEN NULL ELSE $%d::timestamptz END", i, i)
		args = append(args, *input.StartDate)
		i++
	}
	if input.EndDate != nil {
		q += fmt.Sprintf(", end_date = CASE WHEN $%d = '' THEN NULL ELSE $%d::timestamptz END", i, i)
		args = append(args, *input.EndDate)
		i++
	}
	if input.Active != nil {
		q += fmt.Sprintf(", active = $%d", i)
		args = append(args, *input.Active)
		i++
	}

	q += " WHERE id = $1 AND tenant_id = $2"
	_, err := s.db.Exec(ctx, q, args...)
	return err
}

func (s *Service) DeleteMission(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM missions WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

func (s *Service) GetUserMissions(ctx context.Context, tenantID, userID string) ([]UserMission, error) {
	rows, err := s.db.Query(ctx,
		`SELECT um.id, um.user_id, um.mission_id, um.progress, um.target, um.completed,
		        um.completed_at::text, um.rewarded,
		        m.id, m.tenant_id, m.title, m.description, m.image_url, m.type,
		        m.condition::text, m.reward_type, m.reward_points, m.reward_badge_id,
		        m.reward_currency, m.start_date::text, m.end_date::text, m.active,
		        m.sort_order, m.created_at::text
		 FROM user_missions um
		 JOIN missions m ON m.id = um.mission_id
		 WHERE um.tenant_id = $1 AND um.user_id = $2
		 ORDER BY um.completed, m.sort_order`,
		tenantID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("list user missions: %w", err)
	}
	defer rows.Close()

	var items []UserMission
	for rows.Next() {
		var um UserMission
		var m Mission
		if err := rows.Scan(&um.ID, &um.UserID, &um.MissionID, &um.Progress, &um.Target,
			&um.Completed, &um.CompletedAt, &um.Rewarded,
			&m.ID, &m.TenantID, &m.Title, &m.Description, &m.ImageURL, &m.Type,
			&m.Condition, &m.RewardType, &m.RewardPoints, &m.RewardBadgeID,
			&m.RewardCurrency, &m.StartDate, &m.EndDate, &m.Active,
			&m.SortOrder, &m.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan user mission: %w", err)
		}
		um.Mission = &m
		items = append(items, um)
	}
	return items, nil
}

func (s *Service) ListBadges(ctx context.Context, tenantID string) ([]Badge, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, code, name, description, icon_url, rarity, sort_order, active, created_at::text
		 FROM badges WHERE tenant_id = $1 ORDER BY sort_order, rarity`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list badges: %w", err)
	}
	defer rows.Close()

	var items []Badge
	for rows.Next() {
		var b Badge
		if err := rows.Scan(&b.ID, &b.TenantID, &b.Code, &b.Name, &b.Description,
			&b.IconURL, &b.Rarity, &b.SortOrder, &b.Active, &b.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan badge: %w", err)
		}
		items = append(items, b)
	}
	return items, nil
}

func (s *Service) CreateBadge(ctx context.Context, input CreateBadgeInput) (*Badge, error) {
	if input.Rarity == "" {
		input.Rarity = "common"
	}

	var b Badge
	err := s.db.QueryRow(ctx,
		`INSERT INTO badges (tenant_id, code, name, description, icon_url, rarity)
		 VALUES ($1, $2, $3, NULLIF($4,''), NULLIF($5,''), $6)
		 RETURNING id, tenant_id, code, name, description, icon_url, rarity, sort_order, active, created_at::text`,
		input.TenantID, input.Code, input.Name, input.Description, input.IconURL, input.Rarity,
	).Scan(&b.ID, &b.TenantID, &b.Code, &b.Name, &b.Description,
		&b.IconURL, &b.Rarity, &b.SortOrder, &b.Active, &b.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create badge: %w", err)
	}
	return &b, nil
}

func (s *Service) DeleteBadge(ctx context.Context, tenantID, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM badges WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

func (s *Service) UpdateBadge(ctx context.Context, tenantID, id string, input UpdateBadgeInput) error {
	q := "UPDATE badges SET updated_at = NOW()"
	args := []interface{}{id, tenantID}
	i := 3

	if input.Code != nil {
		q += fmt.Sprintf(", code = $%d", i)
		args = append(args, *input.Code)
		i++
	}
	if input.Name != nil {
		q += fmt.Sprintf(", name = $%d", i)
		args = append(args, *input.Name)
		i++
	}
	if input.Description != nil {
		q += fmt.Sprintf(", description = NULLIF($%d,'')", i)
		args = append(args, *input.Description)
		i++
	}
	if input.IconURL != nil {
		q += fmt.Sprintf(", icon_url = NULLIF($%d,'')", i)
		args = append(args, *input.IconURL)
		i++
	}
	if input.Rarity != nil {
		q += fmt.Sprintf(", rarity = $%d", i)
		args = append(args, *input.Rarity)
		i++
	}
	if input.Active != nil {
		q += fmt.Sprintf(", active = $%d", i)
		args = append(args, *input.Active)
		i++
	}

	q += " WHERE id = $1 AND tenant_id = $2"
	_, err := s.db.Exec(ctx, q, args...)
	return err
}

func (s *Service) GetUserBadges(ctx context.Context, tenantID, userID string) ([]UserBadge, error) {
	rows, err := s.db.Query(ctx,
		`SELECT ub.id, ub.user_id, ub.badge_id, ub.earned_at::text,
		        b.id, b.tenant_id, b.code, b.name, b.description, b.icon_url, b.rarity,
		        b.sort_order, b.active, b.created_at::text
		 FROM user_badges ub
		 JOIN badges b ON b.id = ub.badge_id
		 WHERE ub.tenant_id = $1 AND ub.user_id = $2
		 ORDER BY ub.earned_at DESC`,
		tenantID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("list user badges: %w", err)
	}
	defer rows.Close()

	var items []UserBadge
	for rows.Next() {
		var ub UserBadge
		var b Badge
		if err := rows.Scan(&ub.ID, &ub.UserID, &ub.BadgeID, &ub.EarnedAt,
			&b.ID, &b.TenantID, &b.Code, &b.Name, &b.Description, &b.IconURL,
			&b.Rarity, &b.SortOrder, &b.Active, &b.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan user badge: %w", err)
		}
		ub.Badge = &b
		items = append(items, ub)
	}
	return items, nil
}

func (s *Service) GetLeaderboard(ctx context.Context, tenantID, period, periodKey, category string, limit int) ([]LeaderboardEntry, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := s.db.Query(ctx,
		`SELECT user_id, score, rank, period, period_key, category
		 FROM leaderboard
		 WHERE tenant_id = $1 AND period = $2 AND period_key = $3 AND category = $4
		 ORDER BY rank LIMIT $5`,
		tenantID, period, periodKey, category, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("leaderboard: %w", err)
	}
	defer rows.Close()

	var items []LeaderboardEntry
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.UserID, &e.Score, &e.Rank, &e.Period, &e.PeriodKey, &e.Category); err != nil {
			return nil, fmt.Errorf("scan entry: %w", err)
		}
		items = append(items, e)
	}
	return items, nil
}
