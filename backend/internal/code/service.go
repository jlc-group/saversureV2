package code

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/ledger"
	"saversure/internal/promotion"
	"saversure/pkg/codegen"
	qrhmac "saversure/pkg/hmac"
)

var (
	ErrInvalidCode        = errors.New("invalid QR code")
	ErrCodeUsed           = errors.New("code already used")
	ErrBatchRecalled      = errors.New("batch has been recalled")
	ErrBatchNotFound      = errors.New("batch not found for this code")
	ErrDailyQuotaExceeded = errors.New("daily scan quota exceeded")
	ErrRollNotReady       = errors.New("roll has not passed QC approval yet")
)

type Service struct {
	db        *pgxpool.Pool
	signer    *qrhmac.Signer
	ledgerSvc *ledger.Service
	promoSvc  *promotion.Service
}

func NewService(db *pgxpool.Pool, signer *qrhmac.Signer, ledgerSvc *ledger.Service, promoSvc *promotion.Service) *Service {
	return &Service{db: db, signer: signer, ledgerSvc: ledgerSvc, promoSvc: promoSvc}
}

type ScanInput struct {
	Code      string   `json:"code"`  // full HMAC code (from QR scan)
	Ref1      string   `json:"ref1"`  // manual entry code (customer-facing)
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
}

type ScanResult struct {
	Status              string `json:"status"`
	Points              int    `json:"points_earned,omitempty"`
	BonusPoints         int    `json:"bonus_points,omitempty"`
	TotalPoints         int    `json:"total_points,omitempty"`
	BonusCurrency       string `json:"bonus_currency,omitempty"`
	BonusCurrencyAmount int    `json:"bonus_currency_amount,omitempty"`
	CampaignID          string `json:"campaign_id,omitempty"`
	Message             string `json:"message"`
}

// Scan validates a QR code (or ref1 manual entry) and awards points if valid.
// Codes are NOT pre-stored in the DB; a record is created only on first scan.
func (s *Service) Scan(ctx context.Context, tenantID, userID string, input ScanInput) (*ScanResult, error) {
	var prefix string
	var serial int64

	if input.Code != "" {
		var valid bool
		if strings.Contains(input.Code, "-") {
			prefix, serial, valid = s.signer.ValidateCode(input.Code)
		} else {
			knownPrefixes, pfxErr := s.loadKnownPrefixes(ctx, tenantID)
			if pfxErr != nil {
				return nil, fmt.Errorf("load prefixes: %w", pfxErr)
			}
			prefix, serial, valid = s.signer.ValidateCompactCode(input.Code, knownPrefixes, 0)
		}
		if !valid {
			return nil, ErrInvalidCode
		}
	} else {
		// Resolve ref1 -> batch, serial
		runningNumber, ok := codegen.RunningNumberFromRef1(input.Ref1)
		if !ok {
			return nil, ErrInvalidCode
		}
		p, ser, err := s.resolveRef1ToBatch(ctx, tenantID, runningNumber)
		if err != nil {
			return nil, err
		}
		prefix, serial = p, ser
	}

	// Check daily scan quota
	var scanCount int
	err := s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM scan_history
		 WHERE user_id = $1 AND tenant_id = $2
		 AND scanned_at >= CURRENT_DATE`,
		userID, tenantID,
	).Scan(&scanCount)
	if err != nil {
		return nil, fmt.Errorf("check scan quota: %w", err)
	}

	var dailyQuota int
	err = s.db.QueryRow(ctx,
		`SELECT scan_quota_per_day FROM tenants WHERE id = $1`,
		tenantID,
	).Scan(&dailyQuota)
	if err != nil {
		return nil, fmt.Errorf("get tenant quota: %w", err)
	}

	if dailyQuota > 0 && scanCount >= dailyQuota {
		return nil, ErrDailyQuotaExceeded
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Find the batch
	var batchID, campaignID, batchStatus string
	var defaultPoints int
	err = tx.QueryRow(ctx,
		`SELECT b.id, b.campaign_id, b.status,
			COALESCE((c.settings->>'points_per_scan')::int, 1)
		 FROM batches b
		 JOIN campaigns c ON c.id = b.campaign_id
		 WHERE b.tenant_id = $1 AND b.prefix = $2
			AND $3 BETWEEN b.serial_start AND b.serial_end
		 LIMIT 1`,
		tenantID, prefix, serial,
	).Scan(&batchID, &campaignID, &batchStatus, &defaultPoints)
	if err != nil {
		return nil, ErrBatchNotFound
	}

	if batchStatus == "recalled" {
		return nil, ErrBatchRecalled
	}

	// Check roll status — only allow scanning if roll is QC approved or distributed
	var rollStatus string
	var rollProductPoints *int
	var productID *string
	err = tx.QueryRow(ctx,
		`SELECT r.status, p.points_per_scan, r.product_id::text
		 FROM rolls r
		 LEFT JOIN products p ON p.id = r.product_id
		 WHERE r.batch_id = $1 AND r.tenant_id = $2
			AND $3 BETWEEN r.serial_start AND r.serial_end
		 LIMIT 1`,
		batchID, tenantID, serial,
	).Scan(&rollStatus, &rollProductPoints, &productID)

	pointsPerScan := defaultPoints
	if err == nil {
		if rollStatus != "qc_approved" && rollStatus != "distributed" {
			return nil, ErrRollNotReady
		}
		if rollProductPoints != nil {
			pointsPerScan = *rollProductPoints
		}
	} else {
		// Legacy batch without rolls — try batch-level product_id
		_ = tx.QueryRow(ctx,
			`SELECT product_id::text FROM batches WHERE id = $1 AND tenant_id = $2`, batchID, tenantID,
		).Scan(&productID)
	}

	// Check if code already used (on-scan creation: INSERT ON CONFLICT)
	ref1Val := input.Ref1
	if ref1Val == "" {
		ref1Val = input.Code
	}

	// Compute ref2 running number from batch's ref2 range
	var ref2Start *int64
	var batchSerialStart int64
	_ = tx.QueryRow(ctx,
		`SELECT ref2_start, serial_start FROM batches WHERE id = $1 AND tenant_id = $2`,
		batchID, tenantID,
	).Scan(&ref2Start, &batchSerialStart)

	var ref2Val string
	if ref2Start != nil {
		ref2Val = codegen.GenerateRef2(*ref2Start + (serial - batchSerialStart))
	} else {
		ref2Val = fmt.Sprintf("%s-%d", prefix, serial)
	}

	var codeStatus string
	err = tx.QueryRow(ctx,
		`INSERT INTO codes (tenant_id, batch_id, serial_number, ref1, ref2, status, scanned_by)
		 VALUES ($1, $2, $3, $4, $5, 'scanned', $6)
		 ON CONFLICT (tenant_id, batch_id, serial_number) DO NOTHING
		 RETURNING status`,
		tenantID, batchID, serial, ref1Val, ref2Val, userID,
	).Scan(&codeStatus)

	if err != nil {
		// Code already exists — check its status
		err = tx.QueryRow(ctx,
			`SELECT status FROM codes WHERE tenant_id = $1 AND batch_id = $2 AND serial_number = $3`,
			tenantID, batchID, serial,
		).Scan(&codeStatus)
		if err != nil {
			return nil, fmt.Errorf("check code: %w", err)
		}
		if codeStatus == "scanned" || codeStatus == "redeemed" {
			return nil, ErrCodeUsed
		}
	}

	// Check promotional bonus via bonus_rules (multiplier + fixed + currency bonuses)
	bonusPoints := 0
	var currencyBonuses []promotion.CurrencyBonusItem
	if productID != nil && *productID != "" && s.promoSvc != nil {
		br, err := s.promoSvc.CalcBonus(ctx, tenantID, *productID, pointsPerScan)
		if err == nil && br != nil {
			bonusPoints = br.PointBonus
			currencyBonuses = br.CurrencyBonuses
		}
	}
	totalPoints := pointsPerScan + bonusPoints

	// Award points via immutable ledger
	scanRef := input.Code
	if scanRef == "" {
		scanRef = input.Ref1
	}
	desc := fmt.Sprintf("QR scan: %s", scanRef)
	if bonusPoints > 0 {
		desc = fmt.Sprintf("QR scan: %s (base %d + promo bonus %d)", scanRef, pointsPerScan, bonusPoints)
	}
	if err := s.ledgerSvc.Credit(ctx, tx, tenantID, userID, campaignID, totalPoints,
		"scan", batchID, desc, "point"); err != nil {
		return nil, fmt.Errorf("credit points: %w", err)
	}

	// Credit each bonus currency with per-entry expiry from promotion rules
	var bonusCurrency string
	var bonusCurrencyAmount int
	for _, cb := range currencyBonuses {
		currDesc := fmt.Sprintf("Promo bonus: %s x%d from scan %s", cb.Currency, cb.Amount, scanRef)
		if err := s.ledgerSvc.CreditWithExpiry(ctx, tx, tenantID, userID, campaignID, cb.Amount,
			"promo_bonus", batchID, currDesc, cb.Currency,
			cb.ExpiresAt, cb.ExpiryAction, cb.PromotionID); err != nil {
			return nil, fmt.Errorf("credit bonus currency %s: %w", cb.Currency, err)
		}
		bonusCurrency = cb.Currency
		bonusCurrencyAmount += cb.Amount
	}

	// Record scan history with location
	_, err = tx.Exec(ctx,
		`INSERT INTO scan_history (tenant_id, user_id, code_id, campaign_id, batch_id, points_earned, latitude, longitude, scanned_at)
		 VALUES ($1, $2, (SELECT id FROM codes WHERE tenant_id = $1 AND batch_id = $3 AND serial_number = $4), $5, $3, $6, $7, $8, NOW())`,
		tenantID, userID, batchID, serial, campaignID, totalPoints, input.Latitude, input.Longitude,
	)
	if err != nil {
		return nil, fmt.Errorf("insert scan history: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	msg := fmt.Sprintf("You earned %d points!", totalPoints)
	if bonusPoints > 0 {
		msg = fmt.Sprintf("You earned %d points! (%d base + %d bonus)", totalPoints, pointsPerScan, bonusPoints)
	}
	if bonusCurrencyAmount > 0 {
		msg += fmt.Sprintf(" + %d %s", bonusCurrencyAmount, bonusCurrency)
	}

	return &ScanResult{
		Status:              "success",
		Points:              pointsPerScan,
		BonusPoints:         bonusPoints,
		TotalPoints:         totalPoints,
		BonusCurrency:       bonusCurrency,
		BonusCurrencyAmount: bonusCurrencyAmount,
		CampaignID:          campaignID,
		Message:             msg,
	}, nil
}

// resolveRef1ToBatch finds batch and serial from ref1 (running_number).
func (s *Service) resolveRef1ToBatch(ctx context.Context, tenantID string, runningNumber int64) (prefix string, serial int64, err error) {
	rows, err := s.db.Query(ctx,
		`SELECT b.id, b.prefix, b.serial_start, b.serial_end,
			COALESCE(t.settings, '{}'::jsonb)::text,
			COALESCE(c.settings, '{}'::jsonb)::text
		 FROM batches b
		 JOIN campaigns c ON c.id = b.campaign_id
		 JOIN tenants t ON t.id = b.tenant_id
		 WHERE b.tenant_id = $1 AND b.status != 'recalled'
		 ORDER BY b.created_at DESC`,
		tenantID,
	)
	if err != nil {
		return "", 0, fmt.Errorf("query batches: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var batchID, rawTenant, rawCampaign string
		var serialStart, serialEnd int64
		if err := rows.Scan(&batchID, &prefix, &serialStart, &serialEnd, &rawTenant, &rawCampaign); err != nil {
			continue
		}
		var tenantSettings, campaignSettings map[string]any
		_ = json.Unmarshal([]byte(rawTenant), &tenantSettings)
		_ = json.Unmarshal([]byte(rawCampaign), &campaignSettings)

		cfg := codegen.ConfigFromTenantSettings(tenantSettings)
		cfg = cfg.MergeWith(codegen.ConfigFromCampaignSettings(campaignSettings))

		ref1Min := cfg.Ref1MinValue
		if ref1Min == 0 {
			ref1Min = int64(serialStart)
		}
		serial = runningNumber - ref1Min + serialStart
		if serial >= serialStart && serial <= serialEnd {
			return prefix, serial, nil
		}
	}
	return "", 0, ErrBatchNotFound
}

func (s *Service) loadKnownPrefixes(ctx context.Context, tenantID string) ([]string, error) {
	rows, err := s.db.Query(ctx,
		`SELECT DISTINCT prefix FROM batches WHERE tenant_id = $1 ORDER BY length(prefix) DESC`,
		tenantID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prefixes []string
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, err
		}
		prefixes = append(prefixes, p)
	}
	return prefixes, rows.Err()
}
