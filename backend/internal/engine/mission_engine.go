package engine

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

type MissionEngine struct {
	db *pgxpool.Pool
}

func NewMissionEngine(db *pgxpool.Pool) *MissionEngine {
	return &MissionEngine{db: db}
}

type MissionCondition struct {
	Action    string `json:"action"`    // "scan", "redeem", "donate", "login"
	Count     int    `json:"count"`      // target count
	ProductID string `json:"product_id,omitempty"`
}

// OnEvent is called after user actions (scan, redeem, donate, etc.)
// It checks all active missions for the tenant, and updates user progress.
func (e *MissionEngine) OnEvent(ctx context.Context, tenantID, userID, action string, metadata map[string]string) {
	// 1. Get all active missions for this tenant
	rows, err := e.db.Query(ctx,
		`SELECT id, condition::text, reward_type, reward_points, reward_badge_id, reward_currency
		 FROM missions WHERE tenant_id = $1 AND active = TRUE
		 AND (start_date IS NULL OR start_date <= NOW())
		 AND (end_date IS NULL OR end_date >= NOW())`,
		tenantID,
	)
	if err != nil {
		slog.Error("mission engine: list missions", "error", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var missionID, conditionJSON, rewardType, rewardCurrency string
		var rewardPoints int
		var rewardBadgeID *string

		if err := rows.Scan(&missionID, &conditionJSON, &rewardType, &rewardPoints, &rewardBadgeID, &rewardCurrency); err != nil {
			continue
		}

		var cond MissionCondition
		if err := json.Unmarshal([]byte(conditionJSON), &cond); err != nil {
			continue
		}

		// Check if this mission matches the event
		if cond.Action != action {
			continue
		}

		// Check product filter
		if cond.ProductID != "" {
			if pid, ok := metadata["product_id"]; !ok || pid != cond.ProductID {
				continue
			}
		}

		// Ensure user_mission record exists
		e.db.Exec(ctx,
			`INSERT INTO user_missions (user_id, mission_id, tenant_id, progress, target, completed, rewarded)
			 VALUES ($1, $2, $3, 0, $4, FALSE, FALSE)
			 ON CONFLICT (user_id, mission_id) DO NOTHING`,
			userID, missionID, tenantID, cond.Count,
		)

		// Increment progress
		var progress, target int
		var completed, rewarded bool
		err := e.db.QueryRow(ctx,
			`UPDATE user_missions SET progress = LEAST(progress + 1, target)
			 WHERE user_id = $1 AND mission_id = $2
			 RETURNING progress, target, completed, rewarded`,
			userID, missionID,
		).Scan(&progress, &target, &completed, &rewarded)
		if err != nil {
			continue
		}

		// Check if mission just completed
		if progress >= target && !completed {
			e.db.Exec(ctx,
				`UPDATE user_missions SET completed = TRUE, completed_at = NOW()
				 WHERE user_id = $1 AND mission_id = $2`,
				userID, missionID,
			)

			// Award reward if not already rewarded
			if !rewarded {
				e.awardMissionReward(ctx, tenantID, userID, missionID, rewardType, rewardPoints, rewardBadgeID, rewardCurrency)
				e.db.Exec(ctx,
					`UPDATE user_missions SET rewarded = TRUE WHERE user_id = $1 AND mission_id = $2`,
					userID, missionID,
				)
			}
		}
	}
}

func (e *MissionEngine) awardMissionReward(ctx context.Context, tenantID, userID, missionID, rewardType string, rewardPoints int, rewardBadgeID *string, rewardCurrency string) {
	switch rewardType {
	case "points":
		if rewardPoints > 0 {
			// Credit points via ledger
			e.db.Exec(ctx,
				`INSERT INTO point_ledger (tenant_id, user_id, entry_type, amount, balance_after, reference_type, reference_id, description)
				 VALUES ($1, $2, 'credit', $3,
					COALESCE((SELECT balance_after FROM point_ledger WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1), 0) + $3,
					'mission', $4, $5)`,
				tenantID, userID, rewardPoints, missionID, fmt.Sprintf("Mission reward: %d points", rewardPoints),
			)
			slog.Info("mission reward: points", "user", userID, "mission", missionID, "points", rewardPoints)
		}
	case "badge":
		if rewardBadgeID != nil && *rewardBadgeID != "" {
			e.db.Exec(ctx,
				`INSERT INTO user_badges (user_id, badge_id, tenant_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, badge_id) DO NOTHING`,
				userID, *rewardBadgeID, tenantID,
			)
			slog.Info("mission reward: badge", "user", userID, "mission", missionID, "badge", *rewardBadgeID)
		}
	}

	// Create notification
	e.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type, ref_id)
		 VALUES ($1, $2, 'campaign', 'ภารกิจสำเร็จ!', 'คุณทำภารกิจสำเร็จและได้รับรางวัลแล้ว', 'mission', $3)`,
		tenantID, userID, missionID,
	)
}
