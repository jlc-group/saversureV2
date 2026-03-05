package coupon

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNoCouponAvailable = errors.New("no coupon code available")

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Coupon struct {
	ID        string  `json:"id"`
	RewardID  string  `json:"reward_id"`
	TenantID  string  `json:"tenant_id"`
	Code      string  `json:"code"`
	ClaimedBy *string `json:"claimed_by"`
	ClaimedAt *string `json:"claimed_at"`
	CreatedAt string  `json:"created_at"`
}

// BulkImport bulk inserts coupon codes for a reward. Skips duplicates (ON CONFLICT DO NOTHING).
func (s *Service) BulkImport(ctx context.Context, tenantID, rewardID string, codes []string) (imported int, err error) {
	if len(codes) == 0 {
		return 0, nil
	}

	// Verify reward belongs to tenant
	var exists bool
	err = s.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM rewards WHERE id = $1 AND tenant_id = $2)`,
		rewardID, tenantID,
	).Scan(&exists)
	if err != nil {
		return 0, fmt.Errorf("verify reward: %w", err)
	}
	if !exists {
		return 0, fmt.Errorf("reward not found or access denied")
	}

	batch := &pgx.Batch{}
	for _, code := range codes {
		if code == "" {
			continue
		}
		batch.Queue(
			`INSERT INTO coupon_codes (reward_id, tenant_id, code)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (reward_id, code) DO NOTHING`,
			rewardID, tenantID, code,
		)
	}

	br := s.db.SendBatch(ctx, batch)
	defer br.Close()

	for i := 0; i < batch.Len(); i++ {
		ct, err := br.Exec()
		if err != nil {
			return imported, fmt.Errorf("bulk import: %w", err)
		}
		imported += int(ct.RowsAffected())
	}

	return imported, nil
}

// ClaimNext atomically claims the next unclaimed coupon code for a user.
// Uses SELECT ... FOR UPDATE SKIP LOCKED to prevent race conditions.
func (s *Service) ClaimNext(ctx context.Context, tenantID, rewardID, userID string) (code string, err error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var id, c string
	err = tx.QueryRow(ctx,
		`SELECT id, code FROM coupon_codes
		 WHERE reward_id = $1 AND tenant_id = $2 AND claimed_by IS NULL
		 ORDER BY created_at ASC
		 FOR UPDATE SKIP LOCKED
		 LIMIT 1`,
		rewardID, tenantID,
	).Scan(&id, &c)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNoCouponAvailable
		}
		return "", fmt.Errorf("select coupon: %w", err)
	}

	_, err = tx.Exec(ctx,
		`UPDATE coupon_codes SET claimed_by = $1, claimed_at = NOW() WHERE id = $2`,
		userID, id,
	)
	if err != nil {
		return "", fmt.Errorf("update coupon: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("commit: %w", err)
	}

	return c, nil
}

// ListByReward lists coupon codes for a reward (admin view), showing claimed status.
func (s *Service) ListByReward(ctx context.Context, tenantID, rewardID string, limit, offset int) ([]Coupon, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}

	rows, err := s.db.Query(ctx,
		`SELECT id, reward_id, tenant_id, code, claimed_by, claimed_at::text, created_at::text
		 FROM coupon_codes
		 WHERE reward_id = $1 AND tenant_id = $2
		 ORDER BY created_at ASC
		 LIMIT $3 OFFSET $4`,
		rewardID, tenantID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("list coupons: %w", err)
	}
	defer rows.Close()

	var coupons []Coupon
	for rows.Next() {
		var c Coupon
		var claimedBy *string
		var claimedAt *string
		if err := rows.Scan(&c.ID, &c.RewardID, &c.TenantID, &c.Code, &claimedBy, &claimedAt, &c.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan coupon: %w", err)
		}
		c.ClaimedBy = claimedBy
		c.ClaimedAt = claimedAt
		coupons = append(coupons, c)
	}

	return coupons, nil
}

// CountAvailable returns the count of unclaimed codes for a reward.
func (s *Service) CountAvailable(ctx context.Context, tenantID, rewardID string) (int, error) {
	var count int
	err := s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM coupon_codes
		 WHERE reward_id = $1 AND tenant_id = $2 AND claimed_by IS NULL`,
		rewardID, tenantID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count available: %w", err)
	}
	return count, nil
}

// DeleteUnclaimed deletes all unclaimed codes for a reward. Returns the number deleted.
func (s *Service) DeleteUnclaimed(ctx context.Context, tenantID, rewardID string) (int, error) {
	cmd, err := s.db.Exec(ctx,
		`DELETE FROM coupon_codes
		 WHERE reward_id = $1 AND tenant_id = $2 AND claimed_by IS NULL`,
		rewardID, tenantID,
	)
	if err != nil {
		return 0, fmt.Errorf("delete unclaimed: %w", err)
	}
	return int(cmd.RowsAffected()), nil
}
