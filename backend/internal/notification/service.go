package notification

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

type Notification struct {
	ID        string  `json:"id"`
	TenantID  string  `json:"tenant_id"`
	UserID    string  `json:"user_id"`
	Type      string  `json:"type"`
	Title     string  `json:"title"`
	Body      *string `json:"body"`
	RefType   *string `json:"ref_type"`
	RefID     *string `json:"ref_id"`
	ReadAt    *string `json:"read_at"`
	CreatedAt string  `json:"created_at"`
}

func (s *Service) Create(ctx context.Context, tenantID, userID, nType, title, body, refType, refID string) error {
	_, err := s.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type, ref_id)
		 VALUES ($1, $2, $3, $4, NULLIF($5,''), NULLIF($6,''), CASE WHEN $7 = '' THEN NULL ELSE $7::uuid END)`,
		tenantID, userID, nType, title, body, refType, refID,
	)
	return err
}

func (s *Service) ListForUser(ctx context.Context, userID string, limit, offset int) ([]Notification, int64, int64, error) {
	if limit <= 0 {
		limit = 30
	}

	var total, unread int64
	_ = s.db.QueryRow(ctx, "SELECT COUNT(*) FROM notifications WHERE user_id = $1", userID).Scan(&total)
	_ = s.db.QueryRow(ctx, "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL", userID).Scan(&unread)

	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, user_id, type, title, body, ref_type, ref_id::text, read_at::text, created_at::text
		 FROM notifications WHERE user_id = $1
		 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		userID, limit, offset,
	)
	if err != nil {
		return nil, 0, 0, fmt.Errorf("list notifications: %w", err)
	}
	defer rows.Close()

	var items []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.TenantID, &n.UserID, &n.Type, &n.Title, &n.Body,
			&n.RefType, &n.RefID, &n.ReadAt, &n.CreatedAt); err != nil {
			return nil, 0, 0, fmt.Errorf("scan notification: %w", err)
		}
		items = append(items, n)
	}
	return items, total, unread, nil
}

func (s *Service) UnreadCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := s.db.QueryRow(ctx,
		"SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL",
		userID,
	).Scan(&count)
	return count, err
}

func (s *Service) MarkRead(ctx context.Context, userID, notifID string) error {
	_, err := s.db.Exec(ctx,
		"UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 AND read_at IS NULL",
		notifID, userID,
	)
	return err
}

func (s *Service) MarkAllRead(ctx context.Context, userID string) error {
	_, err := s.db.Exec(ctx,
		"UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL",
		userID,
	)
	return err
}
