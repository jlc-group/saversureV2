package engine

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationEngine struct {
	db *pgxpool.Pool
}

func NewNotificationEngine(db *pgxpool.Pool) *NotificationEngine {
	return &NotificationEngine{db: db}
}

// OnScan creates a notification when user earns points from scanning
func (n *NotificationEngine) OnScan(ctx context.Context, tenantID, userID string, points int, campaignID string) {
	n.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type, ref_id)
		 VALUES ($1, $2, 'points', 'ได้รับคะแนน!', $3, 'scan', $4)`,
		tenantID, userID, fmt.Sprintf("คุณได้รับ %d คะแนนจากการสแกน QR", points), campaignID,
	)
}

// OnRedeem creates a notification when user redeems a reward
func (n *NotificationEngine) OnRedeem(ctx context.Context, tenantID, userID, rewardName string, points int, reservationID string) {
	n.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type, ref_id)
		 VALUES ($1, $2, 'reward', 'แลกของรางวัลสำเร็จ!', $3, 'redemption', $4)`,
		tenantID, userID, fmt.Sprintf("คุณแลก %s ด้วย %d คะแนน", rewardName, points), reservationID,
	)
}

// OnDonation creates a notification
func (n *NotificationEngine) OnDonation(ctx context.Context, tenantID, userID string, points int, donationID string) {
	n.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type, ref_id)
		 VALUES ($1, $2, 'campaign', 'บริจาคคะแนนสำเร็จ', $3, 'donation', $4)`,
		tenantID, userID, fmt.Sprintf("คุณบริจาค %d คะแนนเรียบร้อยแล้ว", points), donationID,
	)
}

// OnTierUp creates a notification when user reaches a new tier
func (n *NotificationEngine) OnTierUp(ctx context.Context, tenantID, userID, tierName string) {
	n.db.Exec(ctx,
		`INSERT INTO notifications (tenant_id, user_id, type, title, body, ref_type)
		 VALUES ($1, $2, 'system', 'อัพเลเวล!', $3, 'tier')`,
		tenantID, userID, fmt.Sprintf("ยินดีด้วย! คุณเลื่อนขั้นเป็น %s", tierName),
	)
}
