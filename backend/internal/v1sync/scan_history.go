package v1sync

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func (s *Service) syncScanHistory(ctx context.Context, v1 *pgxpool.Pool, limit int) (int64, error) {
	watermark, err := s.getWatermark(ctx, "scan_history")
	if err != nil {
		return 0, fmt.Errorf("get scan_history watermark: %w", err)
	}
	if watermark == 0 {
		watermark, err = s.bootstrapScanWatermark(ctx)
		if err != nil {
			return 0, fmt.Errorf("bootstrap scan_history watermark: %w", err)
		}
		if watermark > 0 {
			if err := s.setWatermark(ctx, "scan_history", watermark); err != nil {
				return 0, fmt.Errorf("store bootstrap scan_history watermark: %w", err)
			}
		}
	}

	var totalSynced int64
	for {
		synced, newWatermark, err := s.syncScanBatch(ctx, v1, watermark, limit)
		if err != nil {
			return totalSynced, err
		}
		totalSynced += synced
		if synced == 0 || newWatermark <= watermark {
			break
		}
		watermark = newWatermark
		if err := s.setWatermark(ctx, "scan_history", watermark); err != nil {
			return totalSynced, fmt.Errorf("update scan_history watermark: %w", err)
		}
		slog.Info("v1sync scan_history batch", "synced", synced, "watermark", watermark, "total", totalSynced)
	}
	return totalSynced, nil
}

type scanRow struct {
	v1ID        int64
	qrCodeID    *int64
	userID      int64
	productID   *int64
	points      *int64
	userPoints  *int32
	status      *int32
	verifyMethod *int32
	qrSerial    *string
	productName *string
	productSKU  *string
	productImg  *string
	lat         *float64
	lng         *float64
	district    *string
	subDistrict *string
	province    *string
	postCode    *string
	createdAt   *time.Time
	userUpdatedAt *time.Time
}

func (s *Service) syncScanBatch(ctx context.Context, v1 *pgxpool.Pool, afterID int64, limit int) (int64, int64, error) {
	rows, err := v1.Query(ctx,
		`SELECT
			h.id,
			h.qr_code_id,
			h.user_id,
			h.product_id::bigint,
			h.points::bigint,
			u.point,
			h.status,
			COALESCE(hj.verify_method, NULL),
			COALESCE(NULLIF(h.qr_code_serial_number, ''), NULLIF(hj.qr_code_serial_number, ''), NULLIF(qn.qrcode, '')),
			NULLIF(p.name_th, ''),
			NULLIF(p.sku, ''),
			NULLIF(p.images::text, ''),
			NULLIF(h.location->>'latitude', '')::float8,
			NULLIF(h.location->>'longitude', '')::float8,
			COALESCE(NULLIF(h.district, ''), NULLIF(hj.district, ''), NULL),
			COALESCE(NULLIF(h.sub_district, ''), NULLIF(hj.sub_district, ''), NULL),
			COALESCE(NULLIF(h.province, ''), NULLIF(hj.province, ''), NULL),
			CASE WHEN h.post_code IS NOT NULL THEN h.post_code::text WHEN hj.post_code IS NOT NULL THEN hj.post_code::text ELSE NULL END,
			h.created_at,
			u.updated_at
		 FROM qrcode_scan_history h
		 LEFT JOIN users u ON u.id = h.user_id
		 LEFT JOIN LATERAL (
			SELECT qr_code_serial_number, verify_method, district, sub_district, province, post_code, product_id
			FROM qrcode_history_jdent
			WHERE qr_code_id = h.qr_code_id AND user_id = h.user_id
			ORDER BY id DESC LIMIT 1
		 ) hj ON true
		 LEFT JOIN qrcodes_new_qrcodes qn ON qn.id = h.qr_code_id
		 LEFT JOIN products p ON p.id = COALESCE(hj.product_id, h.product_id)
		 WHERE h.id > $1
		 ORDER BY h.id
		 LIMIT $2`,
		afterID, limit,
	)
	if err != nil {
		return 0, afterID, fmt.Errorf("query v1 scan_history: %w", err)
	}
	defer rows.Close()

	var synced, maxID int64
	for rows.Next() {
		var r scanRow
		if err := rows.Scan(
			&r.v1ID, &r.qrCodeID, &r.userID, &r.productID, &r.points, &r.userPoints, &r.status,
			&r.verifyMethod, &r.qrSerial, &r.productName, &r.productSKU, &r.productImg,
			&r.lat, &r.lng, &r.district, &r.subDistrict, &r.province, &r.postCode,
			&r.createdAt, &r.userUpdatedAt,
		); err != nil {
			return synced, maxID, fmt.Errorf("scan v1 scan_history row after %d: %w", maxID, err)
		}

		exists, err := s.scanSourceExists(ctx, r.v1ID)
		if err != nil {
			return synced, maxID, fmt.Errorf("check scan source map %d: %w", r.v1ID, err)
		}
		if exists {
			patched, err := s.patchExistingScanHistory(ctx, r)
			if err != nil {
				return synced, maxID, fmt.Errorf("patch existing scan %d: %w", r.v1ID, err)
			}
			if patched {
				synced++
			}
			maxID = r.v1ID
			continue
		}

		v2UserID, err := s.resolveV1User(ctx, v1, r.userID)
		if err != nil {
			return synced, maxID, fmt.Errorf("resolve v1 user %d for scan %d: %w", r.userID, r.v1ID, err)
		}
		if err := s.upsertUserPointSnapshot(ctx, v2UserID, r.userID, r.userPoints, r.userUpdatedAt); err != nil {
			return synced, maxID, fmt.Errorf("refresh v1 point snapshot for user %d on scan %d: %w", r.userID, r.v1ID, err)
		}

		scanType := deriveScanType(r.status)
		pointsAwarded := int64(0)
		if r.points != nil {
			pointsAwarded = *r.points
		}

		scanID := newUUID()
		tx, err := s.db.Begin(ctx)
		if err != nil {
			return synced, maxID, fmt.Errorf("begin scan_history tx for %d: %w", r.v1ID, err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO scan_history (
				id, tenant_id, user_id, scan_type, points_earned, scanned_at,
				latitude, longitude, province, district, sub_district, postal_code,
				legacy_qr_code_id, legacy_qr_code_serial, legacy_product_v1_id,
				legacy_product_name, legacy_product_sku, legacy_product_image_url,
				legacy_status, legacy_verify_method
			) VALUES (
				$1, $2, $3, $4, $5, COALESCE($6, NOW()),
				$7, $8, $9, $10, $11, $12,
				$13, $14, $15, $16, $17, $18, $19, $20
			)
			ON CONFLICT (id) DO NOTHING`,
			scanID, s.tenantID, v2UserID, scanType, pointsAwarded, r.createdAt,
			r.lat, r.lng, nullStr(r.province), nullStr(r.district), nullStr(r.subDistrict), nullStr(r.postCode),
			r.qrCodeID, nullStr(r.qrSerial), r.productID,
			nullStr(r.productName), nullStr(r.productSKU), nullStr(r.productImg),
			r.status, r.verifyMethod,
		)
		if err != nil {
			_ = tx.Rollback(ctx)
			return synced, maxID, fmt.Errorf("insert scan_history %d: %w", r.v1ID, err)
		}
		_, err = tx.Exec(ctx,
			`INSERT INTO migration_entity_maps (
				tenant_id, entity_type, source_system, source_id, target_id, metadata, created_at, updated_at
			)
			 VALUES ($1, 'scan_history', 'v1', $2, $3, '{}'::jsonb, NOW(), NOW())
			 ON CONFLICT (tenant_id, entity_type, source_system, source_id)
			 DO UPDATE SET target_id = EXCLUDED.target_id, updated_at = NOW()`,
			s.tenantID, fmt.Sprintf("%d", r.v1ID), scanID,
		)
		if err != nil {
			_ = tx.Rollback(ctx)
			return synced, maxID, fmt.Errorf("upsert scan map %d: %w", r.v1ID, err)
		}
		if err := tx.Commit(ctx); err != nil {
			return synced, maxID, fmt.Errorf("commit scan_history %d: %w", r.v1ID, err)
		}
		synced++
		maxID = r.v1ID
	}
	return synced, maxID, rows.Err()
}

func (s *Service) patchExistingScanHistory(ctx context.Context, r scanRow) (bool, error) {
	ct, err := s.db.Exec(ctx,
		`UPDATE scan_history sh
		 SET legacy_qr_code_id = COALESCE(sh.legacy_qr_code_id, $1::bigint),
		     legacy_qr_code_serial = CASE
		         WHEN sh.legacy_qr_code_serial IS NULL OR sh.legacy_qr_code_serial = '' THEN COALESCE($2::text, sh.legacy_qr_code_serial)
		         ELSE sh.legacy_qr_code_serial
		     END,
		     legacy_product_v1_id = COALESCE(sh.legacy_product_v1_id, $3::bigint),
		     legacy_product_name = CASE
		         WHEN sh.legacy_product_name IS NULL OR sh.legacy_product_name = '' THEN COALESCE($4::text, sh.legacy_product_name)
		         ELSE sh.legacy_product_name
		     END,
		     legacy_product_sku = CASE
		         WHEN sh.legacy_product_sku IS NULL OR sh.legacy_product_sku = '' THEN COALESCE($5::text, sh.legacy_product_sku)
		         ELSE sh.legacy_product_sku
		     END,
		     legacy_product_image_url = CASE
		         WHEN sh.legacy_product_image_url IS NULL OR sh.legacy_product_image_url = '' THEN COALESCE($6::text, sh.legacy_product_image_url)
		         ELSE sh.legacy_product_image_url
		     END,
		     latitude = COALESCE(sh.latitude, $7::double precision),
		     longitude = COALESCE(sh.longitude, $8::double precision),
		     province = COALESCE(sh.province, $9::text),
		     district = COALESCE(sh.district, $10::text),
		     sub_district = COALESCE(sh.sub_district, $11::text),
		     postal_code = COALESCE(sh.postal_code, $12::text),
		     legacy_status = COALESCE(sh.legacy_status, $13::integer),
		     legacy_verify_method = COALESCE(sh.legacy_verify_method, $14::integer)
		FROM migration_entity_maps m
		WHERE m.tenant_id = $15
		  AND m.entity_type = 'scan_history'
		  AND m.source_system = 'v1'
		  AND m.source_id = $16
		  AND sh.id::text = m.target_id
		  AND (
			(($1::bigint IS NOT NULL) AND sh.legacy_qr_code_id IS NULL) OR
			(($2::text IS NOT NULL AND $2::text <> '') AND (sh.legacy_qr_code_serial IS NULL OR sh.legacy_qr_code_serial = '')) OR
			(($3::bigint IS NOT NULL) AND sh.legacy_product_v1_id IS NULL) OR
			(($4::text IS NOT NULL AND $4::text <> '') AND (sh.legacy_product_name IS NULL OR sh.legacy_product_name = '')) OR
			(($5::text IS NOT NULL AND $5::text <> '') AND (sh.legacy_product_sku IS NULL OR sh.legacy_product_sku = '')) OR
			(($6::text IS NOT NULL AND $6::text <> '') AND (sh.legacy_product_image_url IS NULL OR sh.legacy_product_image_url = '')) OR
			(($7::double precision IS NOT NULL) AND sh.latitude IS NULL) OR
			(($8::double precision IS NOT NULL) AND sh.longitude IS NULL) OR
			(($9::text IS NOT NULL AND $9::text <> '') AND sh.province IS NULL) OR
			(($10::text IS NOT NULL AND $10::text <> '') AND sh.district IS NULL) OR
			(($11::text IS NOT NULL AND $11::text <> '') AND sh.sub_district IS NULL) OR
			(($12::text IS NOT NULL AND $12::text <> '') AND sh.postal_code IS NULL) OR
			(($13::integer IS NOT NULL) AND sh.legacy_status IS NULL) OR
			(($14::integer IS NOT NULL) AND sh.legacy_verify_method IS NULL)
		  )`,
		r.qrCodeID, nullStr(r.qrSerial), r.productID,
		nullStr(r.productName), nullStr(r.productSKU), nullStr(r.productImg),
		r.lat, r.lng, nullStr(r.province), nullStr(r.district), nullStr(r.subDistrict), nullStr(r.postCode),
		r.status, r.verifyMethod,
		s.tenantID, fmt.Sprintf("%d", r.v1ID),
	)
	if err != nil {
		return false, err
	}
	return ct.RowsAffected() > 0, nil
}

func deriveScanType(status *int32) string {
	if status == nil {
		return "success"
	}
	switch *status {
	case 4:
		return "duplicate_self"
	case -100, 5, 6:
		return "duplicate_other"
	default:
		return "success"
	}
}
