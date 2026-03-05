package redemption

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/inventory"
	"saversure/internal/ledger"
)

var (
	ErrReservationNotFound = errors.New("reservation not found")
	ErrReservationExpired  = errors.New("reservation has expired")
	ErrAlreadyConfirmed    = errors.New("reservation already confirmed")
)

type Service struct {
	db           *pgxpool.Pool
	inventorySvc *inventory.Service
	ledgerSvc    *ledger.Service
}

func NewService(db *pgxpool.Pool, inventorySvc *inventory.Service, ledgerSvc *ledger.Service) *Service {
	return &Service{
		db:           db,
		inventorySvc: inventorySvc,
		ledgerSvc:    ledgerSvc,
	}
}

type Reservation struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	RewardID  string    `json:"reward_id"`
	TenantID  string    `json:"tenant_id"`
	Status    string    `json:"status"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt string    `json:"created_at"`
}

type RedeemInput struct {
	RewardID string `json:"reward_id" binding:"required"`
}

// Reserve performs Phase 1 of the 2-phase redemption.
// Uses atomic DB transaction with row-level locking to prevent oversell.
// RULE #1: Oversell must NEVER happen. If uncertain, REJECT safely.
func (s *Service) Reserve(ctx context.Context, tenantID, userID string, input RedeemInput, idempotencyKey string) (*Reservation, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Check user has enough points
	var pointCost int
	err = tx.QueryRow(ctx,
		`SELECT point_cost FROM rewards WHERE id = $1 AND tenant_id = $2`,
		input.RewardID, tenantID,
	).Scan(&pointCost)
	if err != nil {
		return nil, fmt.Errorf("reward not found: %w", err)
	}

	// Atomic reserve: SELECT FOR UPDATE + check availability + reserve
	if err := s.inventorySvc.AtomicReserve(ctx, tx, input.RewardID); err != nil {
		if errors.Is(err, inventory.ErrOutOfStock) {
			return nil, err
		}
		return nil, fmt.Errorf("reserve inventory: %w", err)
	}

	// Debit points from user
	if err := s.ledgerSvc.Debit(ctx, tx, tenantID, userID, pointCost, "redemption", input.RewardID,
		fmt.Sprintf("Redeemed reward (reserved)"), "point"); err != nil {
		return nil, fmt.Errorf("debit points: %w", err)
	}

	// Create reservation record
	expiresAt := time.Now().Add(10 * time.Minute)
	var r Reservation
	err = tx.QueryRow(ctx,
		`INSERT INTO reward_reservations (user_id, reward_id, tenant_id, status, idempotency_key, expires_at)
		 VALUES ($1, $2, $3, 'PENDING', $4, $5)
		 RETURNING id, user_id, reward_id, tenant_id, status, expires_at, created_at`,
		userID, input.RewardID, tenantID, idempotencyKey, expiresAt,
	).Scan(&r.ID, &r.UserID, &r.RewardID, &r.TenantID, &r.Status, &r.ExpiresAt, &r.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create reservation: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return &r, nil
}

// Confirm performs Phase 2 of the 2-phase redemption.
// Moves the reservation from PENDING to CONFIRMED and inventory from reserved to sold.
func (s *Service) Confirm(ctx context.Context, tenantID, userID, reservationID string) (*Reservation, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var r Reservation
	err = tx.QueryRow(ctx,
		`SELECT id, user_id, reward_id, tenant_id, status, expires_at, created_at
		 FROM reward_reservations
		 WHERE id = $1 AND tenant_id = $2 AND user_id = $3
		 FOR UPDATE`,
		reservationID, tenantID, userID,
	).Scan(&r.ID, &r.UserID, &r.RewardID, &r.TenantID, &r.Status, &r.ExpiresAt, &r.CreatedAt)
	if err != nil {
		return nil, ErrReservationNotFound
	}

	if r.Status == "CONFIRMED" {
		return nil, ErrAlreadyConfirmed
	}

	if r.Status != "PENDING" {
		return nil, fmt.Errorf("reservation status is %s, expected PENDING", r.Status)
	}

	if time.Now().After(r.ExpiresAt) {
		// Expired: release the reservation
		s.inventorySvc.ReleaseReservation(ctx, tx, r.RewardID)
		tx.Exec(ctx, `UPDATE reward_reservations SET status = 'EXPIRED' WHERE id = $1`, r.ID)
		tx.Commit(ctx)
		return nil, ErrReservationExpired
	}

	// Move from reserved to sold
	if err := s.inventorySvc.ConfirmReservation(ctx, tx, r.RewardID); err != nil {
		return nil, fmt.Errorf("confirm inventory: %w", err)
	}

	err = tx.QueryRow(ctx,
		`UPDATE reward_reservations SET status = 'CONFIRMED', confirmed_at = NOW()
		 WHERE id = $1
		 RETURNING id, user_id, reward_id, tenant_id, status, expires_at, created_at`,
		reservationID,
	).Scan(&r.ID, &r.UserID, &r.RewardID, &r.TenantID, &r.Status, &r.ExpiresAt, &r.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("confirm reservation: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return &r, nil
}
