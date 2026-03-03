package inventory

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrOutOfStock = errors.New("reward out of stock")

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Reward struct {
	ID          string `json:"id"`
	TenantID    string `json:"tenant_id"`
	CampaignID  string `json:"campaign_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"`
	PointCost   int    `json:"point_cost"`
	TotalQty    int    `json:"total_qty"`
	ReservedQty int    `json:"reserved_qty"`
	SoldQty     int    `json:"sold_qty"`
	AvailableQty int   `json:"available_qty"`
	CreatedAt   string `json:"created_at"`
}

type CreateRewardInput struct {
	CampaignID  string `json:"campaign_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Type        string `json:"type" binding:"required"`
	PointCost   int    `json:"point_cost" binding:"required,min=1"`
	TotalQty    int    `json:"total_qty" binding:"required,min=1"`
}

type UpdateInventoryInput struct {
	TotalQty *int `json:"total_qty"`
}

func (s *Service) CreateReward(ctx context.Context, tenantID string, input CreateRewardInput) (*Reward, error) {
	var r Reward
	err := s.db.QueryRow(ctx,
		`WITH ins AS (
			INSERT INTO rewards (tenant_id, campaign_id, name, description, type, point_cost)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id, tenant_id, campaign_id, name, description, type, point_cost, created_at
		), inv AS (
			INSERT INTO reward_inventory (reward_id, total_qty, reserved_qty, sold_qty)
			SELECT id, $7, 0, 0 FROM ins
			RETURNING reward_id, total_qty, reserved_qty, sold_qty
		)
		SELECT ins.id, ins.tenant_id, ins.campaign_id, ins.name, ins.description, ins.type, ins.point_cost,
			inv.total_qty, inv.reserved_qty, inv.sold_qty, (inv.total_qty - inv.reserved_qty - inv.sold_qty) as available_qty,
			ins.created_at
		FROM ins JOIN inv ON inv.reward_id = ins.id`,
		tenantID, input.CampaignID, input.Name, input.Description, input.Type, input.PointCost, input.TotalQty,
	).Scan(&r.ID, &r.TenantID, &r.CampaignID, &r.Name, &r.Description, &r.Type, &r.PointCost,
		&r.TotalQty, &r.ReservedQty, &r.SoldQty, &r.AvailableQty, &r.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create reward: %w", err)
	}
	return &r, nil
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Reward, error) {
	rows, err := s.db.Query(ctx,
		`SELECT r.id, r.tenant_id, r.campaign_id, r.name, r.description, r.type, r.point_cost,
			ri.total_qty, ri.reserved_qty, ri.sold_qty, (ri.total_qty - ri.reserved_qty - ri.sold_qty) as available_qty,
			r.created_at
		 FROM rewards r
		 JOIN reward_inventory ri ON ri.reward_id = r.id
		 WHERE r.tenant_id = $1
		 ORDER BY r.created_at DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list rewards: %w", err)
	}
	defer rows.Close()

	var rewards []Reward
	for rows.Next() {
		var r Reward
		if err := rows.Scan(&r.ID, &r.TenantID, &r.CampaignID, &r.Name, &r.Description, &r.Type, &r.PointCost,
			&r.TotalQty, &r.ReservedQty, &r.SoldQty, &r.AvailableQty, &r.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan reward: %w", err)
		}
		rewards = append(rewards, r)
	}
	return rewards, nil
}

func (s *Service) UpdateInventory(ctx context.Context, tenantID, rewardID string, input UpdateInventoryInput) (*Reward, error) {
	var r Reward
	err := s.db.QueryRow(ctx,
		`UPDATE reward_inventory ri SET
			total_qty = COALESCE($3, ri.total_qty),
			version = ri.version + 1
		 FROM rewards rw
		 WHERE ri.reward_id = $2 AND rw.id = ri.reward_id AND rw.tenant_id = $1
		 RETURNING rw.id, rw.tenant_id, rw.campaign_id, rw.name, rw.description, rw.type, rw.point_cost,
			ri.total_qty, ri.reserved_qty, ri.sold_qty, (ri.total_qty - ri.reserved_qty - ri.sold_qty), rw.created_at`,
		tenantID, rewardID, input.TotalQty,
	).Scan(&r.ID, &r.TenantID, &r.CampaignID, &r.Name, &r.Description, &r.Type, &r.PointCost,
		&r.TotalQty, &r.ReservedQty, &r.SoldQty, &r.AvailableQty, &r.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("update inventory: %w", err)
	}
	return &r, nil
}

// AtomicReserve performs the 2-phase reservation step 1 (reserve) with row-level locking.
// CRITICAL: This is the anti-oversell mechanism. Uses SELECT FOR UPDATE.
func (s *Service) AtomicReserve(ctx context.Context, tx pgx.Tx, rewardID string) error {
	var available int
	err := tx.QueryRow(ctx,
		`SELECT (total_qty - reserved_qty - sold_qty)
		 FROM reward_inventory
		 WHERE reward_id = $1
		 FOR UPDATE`, rewardID,
	).Scan(&available)
	if err != nil {
		return fmt.Errorf("lock inventory: %w", err)
	}

	if available <= 0 {
		return ErrOutOfStock
	}

	_, err = tx.Exec(ctx,
		`UPDATE reward_inventory
		 SET reserved_qty = reserved_qty + 1, version = version + 1
		 WHERE reward_id = $1`, rewardID)
	if err != nil {
		return fmt.Errorf("reserve: %w", err)
	}

	return nil
}

// ConfirmReservation moves a reservation from reserved to sold.
func (s *Service) ConfirmReservation(ctx context.Context, tx pgx.Tx, rewardID string) error {
	_, err := tx.Exec(ctx,
		`UPDATE reward_inventory
		 SET reserved_qty = reserved_qty - 1, sold_qty = sold_qty + 1, version = version + 1
		 WHERE reward_id = $1`, rewardID)
	return err
}

// ReleaseReservation releases a reserved unit back to available.
func (s *Service) ReleaseReservation(ctx context.Context, tx pgx.Tx, rewardID string) error {
	_, err := tx.Exec(ctx,
		`UPDATE reward_inventory
		 SET reserved_qty = reserved_qty - 1, version = version + 1
		 WHERE reward_id = $1`, rewardID)
	return err
}
