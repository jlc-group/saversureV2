package scanhistory

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type ScanEntry struct {
	ID           string  `json:"id"`
	TenantID     string  `json:"tenant_id"`
	BatchID      string  `json:"batch_id"`
	SerialNumber int64   `json:"serial_number"`
	Ref1         string  `json:"ref1"`
	Ref2         string  `json:"ref2"`
	Status       string  `json:"status"`
	ScannedBy    *string `json:"scanned_by"`
	BatchPrefix  string  `json:"batch_prefix"`
	CampaignName *string `json:"campaign_name"`
	CreatedAt    string  `json:"created_at"`
}

type ListFilter struct {
	Status  string
	BatchID string
	Limit   int
	Offset  int
}

func (s *Service) List(ctx context.Context, tenantID string, f ListFilter) ([]ScanEntry, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where := "c.tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if f.Status != "" {
		where += fmt.Sprintf(" AND c.status = $%d", argN)
		args = append(args, f.Status)
		argN++
	}
	if f.BatchID != "" {
		where += fmt.Sprintf(" AND c.batch_id = $%d", argN)
		args = append(args, f.BatchID)
		argN++
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		fmt.Sprintf("SELECT COUNT(*) FROM codes c WHERE %s", where),
		args...,
	).Scan(&total)

	query := fmt.Sprintf(
		`SELECT c.id, c.tenant_id, c.batch_id, c.serial_number, c.ref1, c.ref2, c.status, c.scanned_by,
		        b.prefix, cam.name, c.scanned_at::text
		 FROM codes c
		 LEFT JOIN batches b ON b.id = c.batch_id
		 LEFT JOIN campaigns cam ON cam.id = b.campaign_id
		 WHERE %s
		 ORDER BY c.scanned_at DESC
		 LIMIT $%d OFFSET $%d`,
		where, argN, argN+1,
	)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list scans: %w", err)
	}
	defer rows.Close()

	var entries []ScanEntry
	for rows.Next() {
		var e ScanEntry
		if err := rows.Scan(&e.ID, &e.TenantID, &e.BatchID, &e.SerialNumber, &e.Ref1, &e.Ref2,
			&e.Status, &e.ScannedBy, &e.BatchPrefix, &e.CampaignName, &e.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan row: %w", err)
		}
		entries = append(entries, e)
	}
	return entries, total, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*ScanEntry, error) {
	var e ScanEntry
	err := s.db.QueryRow(ctx,
		`SELECT c.id, c.tenant_id, c.batch_id, c.serial_number, c.ref1, c.ref2, c.status, c.scanned_by,
		        b.prefix, cam.name, c.scanned_at::text
		 FROM codes c
		 LEFT JOIN batches b ON b.id = c.batch_id
		 LEFT JOIN campaigns cam ON cam.id = b.campaign_id
		 WHERE c.id = $1 AND c.tenant_id = $2`,
		id, tenantID,
	).Scan(&e.ID, &e.TenantID, &e.BatchID, &e.SerialNumber, &e.Ref1, &e.Ref2,
		&e.Status, &e.ScannedBy, &e.BatchPrefix, &e.CampaignName, &e.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("scan not found: %w", err)
	}
	return &e, nil
}
