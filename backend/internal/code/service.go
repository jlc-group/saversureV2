package code

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/ledger"
	qrhmac "saversure/pkg/hmac"
)

var (
	ErrInvalidCode    = errors.New("invalid QR code")
	ErrCodeUsed       = errors.New("code already used")
	ErrBatchRecalled  = errors.New("batch has been recalled")
	ErrBatchNotFound  = errors.New("batch not found for this code")
)

type Service struct {
	db        *pgxpool.Pool
	signer    *qrhmac.Signer
	ledgerSvc *ledger.Service
}

func NewService(db *pgxpool.Pool, signer *qrhmac.Signer, ledgerSvc *ledger.Service) *Service {
	return &Service{db: db, signer: signer, ledgerSvc: ledgerSvc}
}

type ScanInput struct {
	Code string `json:"code" binding:"required"`
}

type ScanResult struct {
	Status     string `json:"status"`
	Points     int    `json:"points_earned,omitempty"`
	CampaignID string `json:"campaign_id,omitempty"`
	Message    string `json:"message"`
}

// Scan validates a QR code and awards points if valid.
// Codes are NOT pre-stored in the DB; a record is created only on first scan.
func (s *Service) Scan(ctx context.Context, tenantID, userID string, input ScanInput) (*ScanResult, error) {
	prefix, serial, valid := s.signer.ValidateCode(input.Code)
	if !valid {
		return nil, ErrInvalidCode
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Find the batch this code belongs to
	var batchID, campaignID, batchStatus string
	var pointsPerScan int
	err = tx.QueryRow(ctx,
		`SELECT b.id, b.campaign_id, b.status,
			COALESCE((c.settings->>'points_per_scan')::int, 1)
		 FROM batches b
		 JOIN campaigns c ON c.id = b.campaign_id
		 WHERE b.tenant_id = $1 AND b.prefix = $2
			AND $3 BETWEEN b.serial_start AND b.serial_end
		 LIMIT 1`,
		tenantID, prefix, serial,
	).Scan(&batchID, &campaignID, &batchStatus, &pointsPerScan)
	if err != nil {
		return nil, ErrBatchNotFound
	}

	if batchStatus == "recalled" {
		return nil, ErrBatchRecalled
	}

	// Check if code already used (on-scan creation: INSERT ON CONFLICT)
	var codeStatus string
	err = tx.QueryRow(ctx,
		`INSERT INTO codes (tenant_id, batch_id, serial_number, ref1, ref2, status, scanned_by)
		 VALUES ($1, $2, $3, $4, $5, 'scanned', $6)
		 ON CONFLICT (tenant_id, batch_id, serial_number) DO NOTHING
		 RETURNING status`,
		tenantID, batchID, serial, input.Code, fmt.Sprintf("%s-%d", prefix, serial), userID,
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

	// Award points via immutable ledger
	if err := s.ledgerSvc.Credit(ctx, tx, tenantID, userID, campaignID, pointsPerScan,
		"scan", batchID, fmt.Sprintf("QR scan: %s", input.Code)); err != nil {
		return nil, fmt.Errorf("credit points: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return &ScanResult{
		Status:     "success",
		Points:     pointsPerScan,
		CampaignID: campaignID,
		Message:    fmt.Sprintf("You earned %d points!", pointsPerScan),
	}, nil
}
