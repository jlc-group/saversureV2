package v1sync

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type redeemRow struct {
	v1ID         int64
	rewardID     int64
	userID       int64
	addressID    *int64
	statusText   *string
	couponCode   *string
	trackingCode *string
	createdAt    *time.Time
	updatedAt    *time.Time
}

func (s *Service) syncRedeemHistory(ctx context.Context, v1 *pgxpool.Pool, limit int) (int64, error) {
	watermark, err := s.getWatermark(ctx, "redeem_history")
	if err != nil {
		return 0, fmt.Errorf("get redeem_history watermark: %w", err)
	}
	if watermark == 0 {
		watermark, err = s.bootstrapRedeemWatermark(ctx)
		if err != nil {
			return 0, fmt.Errorf("bootstrap redeem_history watermark: %w", err)
		}
		if watermark > 0 {
			if err := s.setWatermark(ctx, "redeem_history", watermark); err != nil {
				return 0, fmt.Errorf("store bootstrap redeem_history watermark: %w", err)
			}
		}
	}

	var totalSynced int64
	for {
		synced, newWatermark, err := s.syncRedeemBatch(ctx, v1, watermark, limit)
		if err != nil {
			return totalSynced, err
		}
		totalSynced += synced
		if synced == 0 || newWatermark <= watermark {
			break
		}
		watermark = newWatermark
		if err := s.setWatermark(ctx, "redeem_history", watermark); err != nil {
			return totalSynced, fmt.Errorf("update redeem_history watermark: %w", err)
		}
		slog.Info("v1sync redeem_history batch", "synced", synced, "watermark", watermark, "total", totalSynced)
	}
	return totalSynced, nil
}

func (s *Service) syncRedeemBatch(ctx context.Context, v1 *pgxpool.Pool, afterID int64, limit int) (int64, int64, error) {
	rows, err := v1.Query(ctx,
		`SELECT id, reward_id, user_id, recipient_address_id, status, coupon_code, goods_tracking_code, created_at, updated_at
		 FROM reward_redeem_histories
		 WHERE deleted_at IS NULL
		   AND id > $1
		 ORDER BY id
		 LIMIT $2`,
		afterID, limit,
	)
	if err != nil {
		return 0, afterID, fmt.Errorf("query v1 redeem_history: %w", err)
	}
	defer rows.Close()

	var synced, maxID int64
	for rows.Next() {
		var r redeemRow
		if err := rows.Scan(
			&r.v1ID, &r.rewardID, &r.userID, &r.addressID, &r.statusText, &r.couponCode, &r.trackingCode, &r.createdAt, &r.updatedAt,
		); err != nil {
			return synced, maxID, fmt.Errorf("scan v1 redeem_history row after %d: %w", maxID, err)
		}

		exists, err := s.entitySourceExists(ctx, "redeem_history", r.v1ID)
		if err != nil {
			return synced, maxID, fmt.Errorf("check redeem source map %d: %w", r.v1ID, err)
		}
		if exists {
			patched, err := s.patchExistingRedeemHistory(ctx, r)
			if err != nil {
				return synced, maxID, fmt.Errorf("patch existing redeem %d: %w", r.v1ID, err)
			}
			if patched {
				synced++
			}
			maxID = r.v1ID
			continue
		}

		v2UserID, err := s.resolveV1User(ctx, v1, r.userID)
		if err != nil {
			return synced, maxID, fmt.Errorf("resolve v1 user %d for redeem %d: %w", r.userID, r.v1ID, err)
		}
		rewardID, ok, err := s.loadMappedEntityID(ctx, "reward", r.rewardID)
		if err != nil {
			return synced, maxID, fmt.Errorf("load mapped reward %d for redeem %d: %w", r.rewardID, r.v1ID, err)
		}
		if !ok {
			slog.Warn("v1sync redeem skipped: reward mapping missing", "redeem_id", r.v1ID, "v1_reward_id", r.rewardID)
			maxID = r.v1ID
			continue
		}

		var addressID *string
		if r.addressID != nil {
			if mappedAddressID, ok, err := s.loadMappedEntityID(ctx, "address", *r.addressID); err != nil {
				return synced, maxID, fmt.Errorf("load mapped address %d for redeem %d: %w", *r.addressID, r.v1ID, err)
			} else if ok {
				addressID = &mappedAddressID
			}
		}

		redeemID := newUUID()
		status := mapRedeemStatusV1(r.statusText)
		deliveryType, fulfillmentStatus, confirmedAt, shippedAt, deliveredAt := deriveRedeemLifecycleV1(status, strVal(r.trackingCode), r.createdAt)
		expiresAt := time.Now().Add(10 * time.Minute)
		if r.createdAt != nil {
			expiresAt = r.createdAt.Add(10 * time.Minute)
		}

		tx, err := s.db.Begin(ctx)
		if err != nil {
			return synced, maxID, fmt.Errorf("begin redeem_history tx for %d: %w", r.v1ID, err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO reward_reservations (
				id, user_id, reward_id, tenant_id, status, idempotency_key, expires_at, confirmed_at,
				address_id, tracking_number, shipping_note, coupon_code, created_at, updated_at,
				delivery_type, recipient_name, recipient_phone, shipping_address_line1, shipping_address_line2,
				shipping_district, shipping_sub_district, shipping_province, shipping_postal_code,
				fulfillment_status, shipped_at, delivered_at
			) VALUES (
				$1, $2, $3, $4, $5, NULL, $6, $7,
				$8, $9, NULL, $10, COALESCE($11, NOW()), $12,
				$13, NULL, NULL, NULL, NULL,
				NULL, NULL, NULL, NULL,
				$14, $15, $16
			)`,
			redeemID, v2UserID, rewardID, s.tenantID, status, expiresAt, confirmedAt,
			addressID, nullStr(r.trackingCode), nullStr(r.couponCode), r.createdAt, r.updatedAt,
			deliveryType, fulfillmentStatus, shippedAt, deliveredAt,
		)
		if err != nil {
			_ = tx.Rollback(ctx)
			return synced, maxID, fmt.Errorf("insert redeem_history %d: %w", r.v1ID, err)
		}
		_, err = tx.Exec(ctx,
			`INSERT INTO migration_entity_maps (
				tenant_id, entity_type, source_system, source_id, target_id, metadata, created_at, updated_at
			)
			 VALUES ($1, 'redeem_history', 'v1', $2, $3, '{}'::jsonb, NOW(), NOW())
			 ON CONFLICT (tenant_id, entity_type, source_system, source_id)
			 DO UPDATE SET target_id = EXCLUDED.target_id, updated_at = NOW()`,
			s.tenantID, fmt.Sprintf("%d", r.v1ID), redeemID,
		)
		if err != nil {
			_ = tx.Rollback(ctx)
			return synced, maxID, fmt.Errorf("upsert redeem map %d: %w", r.v1ID, err)
		}
		if err := tx.Commit(ctx); err != nil {
			return synced, maxID, fmt.Errorf("commit redeem_history %d: %w", r.v1ID, err)
		}
		synced++
		maxID = r.v1ID
	}

	return synced, maxID, rows.Err()
}

func (s *Service) patchExistingRedeemHistory(ctx context.Context, r redeemRow) (bool, error) {
	status := mapRedeemStatusV1(r.statusText)
	deliveryType, fulfillmentStatus, confirmedAt, shippedAt, deliveredAt := deriveRedeemLifecycleV1(status, strVal(r.trackingCode), r.createdAt)

	ct, err := s.db.Exec(ctx,
		`UPDATE reward_reservations rr
		 SET status = $1::text,
		     confirmed_at = COALESCE($2::timestamptz, rr.confirmed_at),
		     tracking_number = COALESCE(NULLIF($3::text, ''), rr.tracking_number),
		     coupon_code = COALESCE(NULLIF($4::text, ''), rr.coupon_code),
		     updated_at = COALESCE($5::timestamptz, rr.updated_at),
		     delivery_type = COALESCE(NULLIF($6::text, ''), rr.delivery_type),
		     fulfillment_status = COALESCE(NULLIF($7::text, ''), rr.fulfillment_status),
		     shipped_at = COALESCE($8::timestamptz, rr.shipped_at),
		     delivered_at = COALESCE($9::timestamptz, rr.delivered_at)
		FROM migration_entity_maps m
		WHERE m.tenant_id = $10
		  AND m.entity_type = 'redeem_history'
		  AND m.source_system = 'v1'
		  AND m.source_id = $11
		  AND rr.id::text = m.target_id
		  AND (
			rr.status IS DISTINCT FROM $1::text OR
			rr.confirmed_at IS DISTINCT FROM $2::timestamptz OR
			COALESCE(rr.tracking_number, '') IS DISTINCT FROM COALESCE($3::text, '') OR
			COALESCE(rr.coupon_code, '') IS DISTINCT FROM COALESCE($4::text, '') OR
			rr.updated_at IS DISTINCT FROM $5::timestamptz OR
			COALESCE(rr.delivery_type, '') IS DISTINCT FROM COALESCE($6::text, '') OR
			COALESCE(rr.fulfillment_status, '') IS DISTINCT FROM COALESCE($7::text, '') OR
			rr.shipped_at IS DISTINCT FROM $8::timestamptz OR
			rr.delivered_at IS DISTINCT FROM $9::timestamptz
		  )`,
		status, confirmedAt, nullStr(r.trackingCode), nullStr(r.couponCode), r.updatedAt,
		deliveryType, fulfillmentStatus, shippedAt, deliveredAt,
		s.tenantID, fmt.Sprintf("%d", r.v1ID),
	)
	if err != nil {
		return false, err
	}
	return ct.RowsAffected() > 0, nil
}

func mapRedeemStatusV1(statusText *string) string {
	value := strings.ToLower(strings.TrimSpace(strVal(statusText)))
	switch value {
	case "pending", "wait", "waiting":
		return "PENDING"
	case "shipping":
		return "SHIPPING"
	case "shipped", "sent":
		return "SHIPPED"
	case "completed", "success", "done", "used":
		return "COMPLETED"
	case "expired":
		return "EXPIRED"
	case "cancelled", "canceled", "rejected":
		return "CANCELLED"
	default:
		return "CONFIRMED"
	}
}

func deriveRedeemLifecycleV1(status, trackingCode string, createdAt *time.Time) (string, string, *time.Time, *time.Time, *time.Time) {
	deliveryType := "none"
	if strings.TrimSpace(trackingCode) != "" {
		deliveryType = "shipping"
	}
	confirmedAt := createdAt
	var shippedAt, deliveredAt *time.Time
	fulfillmentStatus := "pending"
	switch status {
	case "SHIPPING":
		fulfillmentStatus = "shipping"
	case "SHIPPED":
		fulfillmentStatus = "shipped"
		shippedAt = createdAt
	case "COMPLETED":
		fulfillmentStatus = "delivered"
		shippedAt = createdAt
		deliveredAt = createdAt
	case "CANCELLED", "EXPIRED":
		fulfillmentStatus = "cancelled"
	default:
		fulfillmentStatus = "pending"
	}
	return deliveryType, fulfillmentStatus, confirmedAt, shippedAt, deliveredAt
}
