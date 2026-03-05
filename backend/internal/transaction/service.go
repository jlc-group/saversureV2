package transaction

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

type Transaction struct {
	ID         string  `json:"id"`
	TenantID   string  `json:"tenant_id"`
	UserID     string  `json:"user_id"`
	RewardID   string  `json:"reward_id"`
	RewardName *string `json:"reward_name"`
	Status     string  `json:"status"`
	Tracking   *string `json:"tracking"`
	ExpiresAt  string  `json:"expires_at"`
	CreatedAt  string  `json:"created_at"`
}

type ListFilter struct {
	Status string
	Limit  int
	Offset int
}

func (s *Service) List(ctx context.Context, tenantID string, f ListFilter) ([]Transaction, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where := "rr.tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if f.Status != "" {
		where += fmt.Sprintf(" AND rr.status = $%d", argN)
		args = append(args, f.Status)
		argN++
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		fmt.Sprintf("SELECT COUNT(*) FROM reward_reservations rr WHERE %s", where),
		args...,
	).Scan(&total)

	query := fmt.Sprintf(
		`SELECT rr.id, rr.tenant_id, rr.user_id, rr.reward_id, r.name,
		        rr.status, rr.tracking_number, rr.expires_at::text, rr.created_at::text
		 FROM reward_reservations rr
		 LEFT JOIN rewards r ON r.id = rr.reward_id
		 WHERE %s
		 ORDER BY rr.created_at DESC
		 LIMIT $%d OFFSET $%d`,
		where, argN, argN+1,
	)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list transactions: %w", err)
	}
	defer rows.Close()

	var txns []Transaction
	for rows.Next() {
		var t Transaction
		if err := rows.Scan(&t.ID, &t.TenantID, &t.UserID, &t.RewardID, &t.RewardName,
			&t.Status, &t.Tracking, &t.ExpiresAt, &t.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan txn: %w", err)
		}
		txns = append(txns, t)
	}
	return txns, total, nil
}

func (s *Service) UpdateStatus(ctx context.Context, tenantID, id, status, tracking string) (*Transaction, error) {
	validStatuses := map[string]bool{
		"PENDING": true, "CONFIRMED": true, "SHIPPING": true,
		"SHIPPED": true, "COMPLETED": true, "CANCELLED": true,
	}
	if !validStatuses[status] {
		return nil, fmt.Errorf("invalid status: %s", status)
	}

	var t Transaction
	err := s.db.QueryRow(ctx,
		`UPDATE reward_reservations
		 SET status = $3, tracking_number = COALESCE(NULLIF($4, ''), tracking_number), updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, user_id, reward_id, status, tracking_number, expires_at::text, created_at::text`,
		id, tenantID, status, tracking,
	).Scan(&t.ID, &t.TenantID, &t.UserID, &t.RewardID, &t.Status, &t.Tracking, &t.ExpiresAt, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("update transaction: %w", err)
	}
	return &t, nil
}
