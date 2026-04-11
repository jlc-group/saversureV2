package v1sync

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func (s *Service) syncUsers(ctx context.Context, v1 *pgxpool.Pool, limit int) (int64, error) {
	watermark, err := s.getWatermark(ctx, "user")
	if err != nil {
		return 0, fmt.Errorf("get user watermark: %w", err)
	}
	if watermark == 0 {
		watermark, err = s.bootstrapUserWatermark(ctx)
		if err != nil {
			return 0, fmt.Errorf("bootstrap user watermark: %w", err)
		}
		if watermark > 0 {
			if err := s.setWatermark(ctx, "user", watermark); err != nil {
				return 0, fmt.Errorf("store bootstrap user watermark: %w", err)
			}
		}
	}

	var totalSynced int64
	for {
		synced, newWatermark, err := s.syncUserBatch(ctx, v1, watermark, limit)
		if err != nil {
			return totalSynced, err
		}
		totalSynced += synced
		if synced == 0 || newWatermark <= watermark {
			break
		}
		watermark = newWatermark
		if err := s.setWatermark(ctx, "user", watermark); err != nil {
			return totalSynced, fmt.Errorf("update user watermark: %w", err)
		}
		slog.Info("v1sync users batch", "synced", synced, "watermark", watermark, "total", totalSynced)
	}
	return totalSynced, nil
}

func (s *Service) syncUserBatch(ctx context.Context, v1 *pgxpool.Pool, afterID int64, limit int) (int64, int64, error) {
	rows, err := v1.Query(ctx,
		`SELECT id, textsend(name), textsend(surname), textsend(email), textsend(telephone),
		        textsend(line_user_id), birth_date, textsend(gender), textsend(profile_image),
		        textsend(province), textsend(occupation), flag, status, point, created_at, updated_at
		 FROM users
		 WHERE id > $1 AND deleted_at IS NULL
		 ORDER BY id
		 LIMIT $2`,
		afterID, limit,
	)
	if err != nil {
		return 0, afterID, fmt.Errorf("query v1 users: %w", err)
	}
	defer rows.Close()

	var synced, maxID int64
	for rows.Next() {
		var (
			v1ID                                    int64
			nameR, surnameR, emailR                 []byte
			phoneR, lineR                           []byte
			genderR, avatarR                        []byte
			provinceR, occupationR                  []byte
			flag, status                            *int32
			points                                  *int32
			birthDate, createdAt, updatedAt          *time.Time
		)
		if err := rows.Scan(&v1ID, &nameR, &surnameR, &emailR, &phoneR, &lineR,
			&birthDate, &genderR, &avatarR, &provinceR, &occupationR,
			&flag, &status, &points, &createdAt, &updatedAt); err != nil {
			return synced, maxID, fmt.Errorf("scan v1 user row after %d: %w", maxID, err)
		}

		if err := s.upsertUser(ctx, v1ID,
			legacyBytes(nameR), legacyBytes(surnameR), legacyBytes(emailR),
			legacyBytes(phoneR), legacyBytes(lineR),
			birthDate, legacyBytes(genderR), legacyBytes(avatarR),
			legacyBytes(provinceR), legacyBytes(occupationR),
			flag, status, points, createdAt, updatedAt,
		); err != nil {
			return synced, maxID, fmt.Errorf("upsert v1 user %d: %w", v1ID, err)
		}
		synced++
		maxID = v1ID
	}
	return synced, maxID, rows.Err()
}

func (s *Service) upsertUser(
	ctx context.Context,
	v1ID int64,
	name, surname, email, phone, lineUserID *string,
	birthDate *time.Time,
	gender, avatar, province, occupation *string,
	flag, status *int32,
	points *int32,
	createdAt, updatedAt *time.Time,
) error {
	var existingUserID string
	err := s.db.QueryRow(ctx,
		`SELECT id FROM users WHERE tenant_id = $1 AND v1_user_id = $2`,
		s.tenantID, v1ID,
	).Scan(&existingUserID)
	if err == nil {
		return s.upsertUserPointSnapshot(ctx, existingUserID, v1ID, points, updatedAt)
	}

	firstName := truncStr(strings.TrimSpace(strVal(name)), 100)
	lastName := truncStr(strings.TrimSpace(strVal(surname)), 100)
	displayName := truncStr(strings.TrimSpace(firstName+" "+lastName), 255)
	if displayName == "" {
		displayName = fmt.Sprintf("User %d", v1ID)
	}

	finalEmail := strings.ToLower(strings.TrimSpace(strVal(email)))
	if finalEmail == "" || len(finalEmail) > 250 {
		finalEmail = fmt.Sprintf("v1_%d@migrated.saversure.local", v1ID)
	}

	genderVal := mapGender(gender)
	statusVal := mapStatus(status)
	flagVal := mapFlag(flag)
	profileCompleted := firstName != "" && strVal(phone) != ""

	insert := func(emailAddr string) (string, error) {
		tx, err := s.db.Begin(ctx)
		if err != nil {
			return "", err
		}
		defer tx.Rollback(ctx)

		userID := newUUID()
		_, err = tx.Exec(ctx,
			`INSERT INTO users (
				id, tenant_id, email, phone, password_hash, display_name, status,
				created_at, updated_at, first_name, last_name, birth_date, gender,
				avatar_url, line_user_id, province, occupation, customer_flag, v1_user_id, profile_completed
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				COALESCE($8, NOW()), $9, NULLIF($10, ''), NULLIF($11, ''), $12::date, $13,
				$14, $15, $16, $17, $18, $19, $20
			)
			ON CONFLICT (v1_user_id) WHERE v1_user_id IS NOT NULL DO NOTHING`,
			userID, s.tenantID, emailAddr, nullStr(phone), placeholderHash, displayName, statusVal,
			createdAt, updatedAt, firstName, lastName, birthDate, genderVal,
			nullStr(avatar), nullStr(lineUserID), nullStr(province), nullStr(occupation),
			flagVal, v1ID, profileCompleted,
		)
		if err != nil {
			return "", err
		}
		_, err = tx.Exec(ctx,
			`INSERT INTO user_roles (id, user_id, tenant_id, role, created_at)
			 VALUES ($1, $2, $3, 'api_client', NOW())
			 ON CONFLICT (user_id, tenant_id) DO NOTHING`,
			newUUID(), userID, s.tenantID,
		)
		if err != nil {
			return "", err
		}
		if err := tx.Commit(ctx); err != nil {
			return "", err
		}
		return userID, nil
	}

	userID, err := insert(finalEmail)
	if err != nil {
		placeholder := fmt.Sprintf("v1_%d@migrated.saversure.local", v1ID)
		if placeholder != finalEmail {
			userID, err = insert(placeholder)
			if err != nil {
				return err
			}
			return s.upsertUserPointSnapshot(ctx, userID, v1ID, points, updatedAt)
		}
		return err
	}
	return s.upsertUserPointSnapshot(ctx, userID, v1ID, points, updatedAt)
}

// resolveV1User ensures a V1 user exists in V2, creating on-demand if needed.
// Returns the V2 user UUID.
func (s *Service) resolveV1User(ctx context.Context, v1 *pgxpool.Pool, v1UserID int64) (string, error) {
	var v2ID string
	err := s.db.QueryRow(ctx,
		`SELECT id FROM users WHERE tenant_id = $1 AND v1_user_id = $2`,
		s.tenantID, v1UserID,
	).Scan(&v2ID)
	if err == nil {
		return v2ID, nil
	}

	var (
		nameR, surnameR, emailR []byte
		phoneR, lineR           []byte
		genderR, avatarR        []byte
		provinceR, occupationR  []byte
		flag, status            *int32
		points                  *int32
		birthDate, createdAt, updatedAt *time.Time
	)
	qErr := v1.QueryRow(ctx,
		`SELECT textsend(name), textsend(surname), textsend(email), textsend(telephone),
		        textsend(line_user_id), birth_date, textsend(gender), textsend(profile_image),
		        textsend(province), textsend(occupation), flag, status, point, created_at, updated_at
		 FROM users WHERE id = $1`, v1UserID,
	).Scan(&nameR, &surnameR, &emailR, &phoneR, &lineR,
		&birthDate, &genderR, &avatarR, &provinceR, &occupationR,
		&flag, &status, &points, &createdAt, &updatedAt)
	if qErr != nil {
		return "", fmt.Errorf("fetch v1 user %d: %w", v1UserID, qErr)
	}

	if err := s.upsertUser(ctx, v1UserID,
		legacyBytes(nameR), legacyBytes(surnameR), legacyBytes(emailR),
		legacyBytes(phoneR), legacyBytes(lineR),
		birthDate, legacyBytes(genderR), legacyBytes(avatarR),
		legacyBytes(provinceR), legacyBytes(occupationR),
		flag, status, points, createdAt, updatedAt,
	); err != nil {
		return "", fmt.Errorf("upsert v1 user %d: %w", v1UserID, err)
	}

	err = s.db.QueryRow(ctx,
		`SELECT id FROM users WHERE tenant_id = $1 AND v1_user_id = $2`,
		s.tenantID, v1UserID,
	).Scan(&v2ID)
	return v2ID, err
}

func (s *Service) upsertUserPointSnapshot(ctx context.Context, userID string, v1ID int64, points *int32, asOf *time.Time) error {
	if userID == "" || points == nil {
		return nil
	}

	desiredBalance := int(*points)
	if desiredBalance < 0 {
		desiredBalance = 0
	}

	refID := fmt.Sprintf("%d", v1ID)
	var currentBalance int
	err := s.db.QueryRow(ctx,
		`SELECT COALESCE((
			SELECT balance_after
			FROM point_ledger
			WHERE tenant_id = $1
			  AND user_id = $2
			  AND currency = 'point'
			ORDER BY created_at DESC
			LIMIT 1
		), 0)`,
		s.tenantID, userID,
	).Scan(&currentBalance)
	if err != nil {
		return fmt.Errorf("load current balance for user %d: %w", v1ID, err)
	}

	delta := desiredBalance - currentBalance
	if delta == 0 {
		return nil
	}

	entryType := "credit"
	amount := delta
	referenceType := "v1_live_sync_balance"
	description := fmt.Sprintf("V1 live point snapshot (%d pts)", desiredBalance)
	if delta < 0 {
		entryType = "debit"
		amount = -delta
		referenceType = "v1_live_sync_reconcile"
		description = fmt.Sprintf("V1 live point reconcile to %d pts", desiredBalance)
	} else if currentBalance > 0 {
		referenceType = "v1_live_sync_reconcile"
		description = fmt.Sprintf("V1 live point reconcile +%d to %d pts", amount, desiredBalance)
	}

	_, err = s.db.Exec(ctx,
		`INSERT INTO point_ledger (
			id, tenant_id, user_id, entry_type, amount, balance_after, reference_type, reference_id, description, currency, created_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, 'point', COALESCE($10, NOW())
		)`,
		newUUID(), s.tenantID, userID, entryType, amount, desiredBalance, referenceType, refID, description, asOf,
	)
	if err != nil {
		return fmt.Errorf("insert v1 live point snapshot for user %d: %w", v1ID, err)
	}
	return nil
}

func mapGender(g *string) *string {
	switch strings.TrimSpace(strVal(g)) {
	case "หญิง":
		v := "female"
		return &v
	case "ชาย":
		v := "male"
		return &v
	case "LGBTQ":
		v := "other"
		return &v
	default:
		return nil
	}
}

func mapStatus(s *int32) string {
	if s != nil && *s == 3 {
		return "deleted"
	}
	return "active"
}

func mapFlag(f *int32) string {
	if f == nil {
		return "green"
	}
	switch *f {
	case 0:
		return "white"
	case 91:
		return "yellow"
	case 92:
		return "orange"
	case 93:
		return "black"
	case 201:
		return "gray"
	default:
		return "green"
	}
}
