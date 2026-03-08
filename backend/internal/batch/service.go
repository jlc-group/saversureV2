package batch

import (
	"context"
	"fmt"
	"io"

	"github.com/jackc/pgx/v5/pgxpool"

	"saversure/internal/roll"
	"saversure/pkg/codegen"
	qrhmac "saversure/pkg/hmac"
)

type Service struct {
	db      *pgxpool.Pool
	signer  *qrhmac.Signer
	rollSvc *roll.Service
}

type ExportOptions struct {
	StartSerial int64
	EndSerial   int64
	LotSize     int64
}

func NewService(db *pgxpool.Pool, signer *qrhmac.Signer, rollSvc *roll.Service) *Service {
	return &Service{db: db, signer: signer, rollSvc: rollSvc}
}

type Batch struct {
	ID          string  `json:"id"`
	TenantID    string  `json:"tenant_id"`
	CampaignID  string  `json:"campaign_id"`
	Prefix      string  `json:"prefix"`
	SerialStart int64   `json:"serial_start"`
	SerialEnd   int64   `json:"serial_end"`
	Ref2Start   *int64  `json:"ref2_start,omitempty"`
	Ref2End     *int64  `json:"ref2_end,omitempty"`
	Status      string  `json:"status"`
	CreatedBy   string  `json:"created_by"`
	CreatedAt   string  `json:"created_at"`
	CodeCount   int64   `json:"code_count"`
	ProductID   *string `json:"product_id"`
	FactoryID   *string `json:"factory_id"`
	ProductName *string `json:"product_name,omitempty"`
	FactoryName *string `json:"factory_name,omitempty"`
}

type CreateInput struct {
	CampaignID   string  `json:"campaign_id" binding:"required"`
	Prefix       string  `json:"prefix" binding:"required,max=10"`
	Quantity     int64   `json:"quantity" binding:"required,min=1"`
	CodesPerRoll int     `json:"codes_per_roll"`
	ProductID    *string `json:"product_id"`
	FactoryID    *string `json:"factory_id"`
}

func (s *Service) Create(ctx context.Context, tenantID, userID string, input CreateInput) (*Batch, error) {
	codesPerRoll := input.CodesPerRoll
	if codesPerRoll <= 0 {
		codesPerRoll = 10000
	}

	var maxSerial int64
	err := s.db.QueryRow(ctx,
		`SELECT COALESCE(MAX(serial_end), 0) FROM batches WHERE tenant_id = $1 AND prefix = $2`,
		tenantID, input.Prefix,
	).Scan(&maxSerial)
	if err != nil {
		return nil, fmt.Errorf("query max serial: %w", err)
	}

	serialStart := maxSerial + 1
	serialEnd := serialStart + input.Quantity - 1

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Claim ref2 running number range atomically
	var ref2Start int64
	err = tx.QueryRow(ctx,
		`UPDATE tenants SET ref2_next = ref2_next + $2 WHERE id = $1 RETURNING ref2_next - $2`,
		tenantID, input.Quantity,
	).Scan(&ref2Start)
	if err != nil {
		return nil, fmt.Errorf("claim ref2 range: %w", err)
	}
	ref2End := ref2Start + input.Quantity - 1

	var b Batch
	err = tx.QueryRow(ctx,
		`INSERT INTO batches (tenant_id, campaign_id, prefix, seed_secret, serial_start, serial_end, ref2_start, ref2_end, codes_per_roll, status, created_by, product_id, factory_id)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'generated', $10, $11, $12)
		 RETURNING id, tenant_id, campaign_id, prefix, serial_start, serial_end, ref2_start, ref2_end, status, created_by, created_at::text, product_id, factory_id`,
		tenantID, input.CampaignID, input.Prefix, s.signer.Sign(input.Prefix),
		serialStart, serialEnd, ref2Start, ref2End, codesPerRoll, userID, input.ProductID, input.FactoryID,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID)
	if err != nil {
		return nil, fmt.Errorf("create batch: %w", err)
	}

	if err := s.rollSvc.CreateRollsForBatch(ctx, tx, tenantID, b.ID, serialStart, serialEnd, codesPerRoll); err != nil {
		return nil, fmt.Errorf("create rolls: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	b.CodeCount = b.SerialEnd - b.SerialStart + 1
	return &b, nil
}

const batchSelectCols = `b.id, b.tenant_id, b.campaign_id, b.prefix, b.serial_start, b.serial_end,
	b.ref2_start, b.ref2_end, b.status, b.created_by, b.created_at::text, b.product_id, b.factory_id`

func scanBatch(scanner interface {
	Scan(dest ...any) error
}, b *Batch) error {
	return scanner.Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID)
}

func scanBatchWithNames(scanner interface {
	Scan(dest ...any) error
}, b *Batch) error {
	return scanner.Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID,
		&b.ProductName, &b.FactoryName)
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Batch, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+batchSelectCols+`, p.name, f.name
		 FROM batches b
		 LEFT JOIN products p ON p.id = b.product_id
		 LEFT JOIN factories f ON f.id = b.factory_id
		 WHERE b.tenant_id = $1 ORDER BY b.created_at DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list batches: %w", err)
	}
	defer rows.Close()

	var batches []Batch
	for rows.Next() {
		var b Batch
		if err := scanBatchWithNames(rows, &b); err != nil {
			return nil, fmt.Errorf("scan batch: %w", err)
		}
		b.CodeCount = b.SerialEnd - b.SerialStart + 1
		batches = append(batches, b)
	}
	return batches, nil
}

func (s *Service) UpdateStatus(ctx context.Context, tenantID, id, status string) (*Batch, error) {
	validTransitions := map[string][]string{
		"generated":   {"printed"},
		"printed":     {"distributed"},
		"distributed": {"recalled"},
	}

	var currentStatus string
	err := s.db.QueryRow(ctx,
		`SELECT status FROM batches WHERE id = $1 AND tenant_id = $2`, id, tenantID,
	).Scan(&currentStatus)
	if err != nil {
		return nil, fmt.Errorf("batch not found: %w", err)
	}

	allowed := validTransitions[currentStatus]
	valid := false
	for _, s := range allowed {
		if s == status {
			valid = true
			break
		}
	}
	if !valid {
		return nil, fmt.Errorf("invalid transition from %s to %s", currentStatus, status)
	}

	var b Batch
	err = s.db.QueryRow(ctx,
		`UPDATE batches SET status = $3, updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING `+batchSelectCols,
		id, tenantID, status,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID)
	if err != nil {
		return nil, fmt.Errorf("update batch status: %w", err)
	}
	b.CodeCount = b.SerialEnd - b.SerialStart + 1
	return &b, nil
}

// Recall marks an entire batch as recalled, invalidating all unscanned codes.
func (s *Service) Recall(ctx context.Context, tenantID, id, reason, actorID string) (*Batch, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var b Batch
	err = tx.QueryRow(ctx,
		`UPDATE batches SET status = 'recalled', updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status != 'recalled'
		 RETURNING `+batchSelectCols,
		id, tenantID,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID)
	if err != nil {
		return nil, fmt.Errorf("recall batch: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO audit_trail (tenant_id, actor_id, action, entity_type, entity_id, old_value, new_value, ip_address)
		 VALUES ($1, $2, 'batch_recall', 'batch', $3, $4, $5, '')`,
		tenantID, actorID, id, `{"reason": "`+reason+`"}`, `{"status": "recalled"}`,
	)
	if err != nil {
		return nil, fmt.Errorf("audit recall: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	b.CodeCount = b.SerialEnd - b.SerialStart + 1
	return &b, nil
}

// GenerateCodes returns QR code strings for a batch range (on-demand, not stored).
func (s *Service) GenerateCodes(prefix string, start, end int64) []string {
	codes := make([]string, 0, end-start+1)
	for i := start; i <= end; i++ {
		codes = append(codes, s.signer.GenerateCode(prefix, i))
	}
	return codes
}

// GetByID returns a batch by ID within tenant
func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*Batch, error) {
	var b Batch
	err := s.db.QueryRow(ctx,
		`SELECT `+batchSelectCols+`, p.name, f.name
		 FROM batches b
		 LEFT JOIN products p ON p.id = b.product_id
		 LEFT JOIN factories f ON f.id = b.factory_id
		 WHERE b.id = $1 AND b.tenant_id = $2`,
		id, tenantID,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Ref2Start, &b.Ref2End, &b.Status, &b.CreatedBy, &b.CreatedAt, &b.ProductID, &b.FactoryID,
		&b.ProductName, &b.FactoryName)
	if err != nil {
		return nil, fmt.Errorf("batch not found: %w", err)
	}
	b.CodeCount = b.SerialEnd - b.SerialStart + 1
	return &b, nil
}

// ExportCodes generates export records (code, ref1, ref2, url) for a batch.
func (s *Service) ExportCodes(ctx context.Context, tenantID, batchID string, tenantSettings, campaignSettings map[string]any, opts ExportOptions) ([]codegen.ExportRecord, error) {
	b, err := s.GetByID(ctx, tenantID, batchID)
	if err != nil {
		return nil, err
	}

	if b.Ref2Start == nil || b.Ref2End == nil {
		return nil, fmt.Errorf("batch has no ref2 range (legacy batch?), please re-create")
	}

	cfg := codegen.ConfigFromTenantSettings(tenantSettings)
	cfg = cfg.MergeWith(codegen.ConfigFromCampaignSettings(campaignSettings))

	baseURL := cfg.ScanBaseURL
	if baseURL == "" {
		baseURL = "https://scan.saversure.com"
	}

	startSerial := b.SerialStart
	endSerial := b.SerialEnd
	if opts.StartSerial > 0 {
		startSerial = opts.StartSerial
	}
	if opts.EndSerial > 0 {
		endSerial = opts.EndSerial
	}
	if startSerial < b.SerialStart {
		startSerial = b.SerialStart
	}
	if endSerial > b.SerialEnd {
		endSerial = b.SerialEnd
	}
	if endSerial < startSerial {
		return nil, fmt.Errorf("invalid serial range")
	}

	lotSize := opts.LotSize
	if lotSize <= 0 {
		lotSize = cfg.LotSize
	}
	if lotSize <= 0 {
		lotSize = 10000
	}

	count := endSerial - startSerial + 1
	const maxExportRows int64 = 200000
	if count > maxExportRows {
		return nil, fmt.Errorf("export range too large (%d rows). use lot_size/roll or start_serial/end_serial", count)
	}

	hmacLen := cfg.HMACLength
	if hmacLen <= 0 {
		hmacLen = 8
	}

	records := make([]codegen.ExportRecord, 0, count)

	for serial := startSerial; serial <= endSerial; serial++ {
		offset := serial - b.SerialStart
		ref2Running := *b.Ref2Start + offset

		runningNumber := serial
		if cfg.Ref1MinValue > 0 {
			runningNumber = cfg.Ref1MinValue + offset
		}

		var code, url string
		if cfg.CompactCode {
			code = s.signer.GenerateCompactCode(b.Prefix, serial, hmacLen)
			if cfg.URLFormat == "path" {
				url = fmt.Sprintf("%s/%s", baseURL, code)
			} else {
				url = fmt.Sprintf("%s?code=%s", baseURL, code)
			}
		} else {
			code = s.signer.GenerateCode(b.Prefix, serial)
			url = fmt.Sprintf("%s?code=%s", baseURL, code)
		}

		if cfg.MaxURLLength > 0 && len(url) > cfg.MaxURLLength {
			return nil, fmt.Errorf(
				"URL length %d exceeds max %d (serial=%d). shorten prefix or use shorter domain",
				len(url), cfg.MaxURLLength, serial,
			)
		}

		ref1 := codegen.GenerateRef1(runningNumber, cfg)
		ref2 := codegen.GenerateRef2(ref2Running)

		lotNum := offset/lotSize + 1
		lotNumber := fmt.Sprintf("LOT%04d", lotNum)

		records = append(records, codegen.ExportRecord{
			SerialNumber: serial,
			Code:         code,
			Ref1:         ref1,
			Ref2:         ref2,
			URL:          url,
			LotNumber:    lotNumber,
		})
	}

	return records, nil
}

// StreamExportCodes streams CSV records directly to writer without buffering all in memory.
// Supports unlimited batch size. Calls onRecord for each generated record (e.g. for ZIP splitting).
func (s *Service) StreamExportCodes(ctx context.Context, tenantID, batchID string, tenantSettings, campaignSettings map[string]any, opts ExportOptions, w io.Writer, codesPerFile int64) error {
	b, err := s.GetByID(ctx, tenantID, batchID)
	if err != nil {
		return err
	}
	if b.Ref2Start == nil || b.Ref2End == nil {
		return fmt.Errorf("batch has no ref2 range")
	}

	cfg := codegen.ConfigFromTenantSettings(tenantSettings)
	cfg = cfg.MergeWith(codegen.ConfigFromCampaignSettings(campaignSettings))

	baseURL := cfg.ScanBaseURL
	if baseURL == "" {
		baseURL = "https://scan.saversure.com"
	}

	startSerial := b.SerialStart
	endSerial := b.SerialEnd
	if opts.StartSerial > 0 {
		startSerial = opts.StartSerial
	}
	if opts.EndSerial > 0 {
		endSerial = opts.EndSerial
	}
	if startSerial < b.SerialStart {
		startSerial = b.SerialStart
	}
	if endSerial > b.SerialEnd {
		endSerial = b.SerialEnd
	}
	if endSerial < startSerial {
		return fmt.Errorf("invalid serial range")
	}

	lotSize := opts.LotSize
	if lotSize <= 0 {
		lotSize = cfg.LotSize
	}
	if lotSize <= 0 {
		lotSize = 10000
	}

	hmacLen := cfg.HMACLength
	if hmacLen <= 0 {
		hmacLen = 8
	}

	csvW := codegen.NewCSVWriter(w)
	codegen.WriteCSVHeader(csvW)

	for serial := startSerial; serial <= endSerial; serial++ {
		offset := serial - b.SerialStart
		ref2Running := *b.Ref2Start + offset

		runningNumber := serial
		if cfg.Ref1MinValue > 0 {
			runningNumber = cfg.Ref1MinValue + offset
		}

		var code, url string
		if cfg.CompactCode {
			code = s.signer.GenerateCompactCode(b.Prefix, serial, hmacLen)
			if cfg.URLFormat == "path" {
				url = fmt.Sprintf("%s/%s", baseURL, code)
			} else {
				url = fmt.Sprintf("%s?code=%s", baseURL, code)
			}
		} else {
			code = s.signer.GenerateCode(b.Prefix, serial)
			url = fmt.Sprintf("%s?code=%s", baseURL, code)
		}

		lotNum := offset/lotSize + 1
		codegen.WriteCSVRecord(csvW, codegen.ExportRecord{
			SerialNumber: serial,
			Code:         code,
			Ref1:         codegen.GenerateRef1(runningNumber, cfg),
			Ref2:         codegen.GenerateRef2(ref2Running),
			URL:          url,
			LotNumber:    fmt.Sprintf("LOT%04d", lotNum),
		})

		if serial%10000 == 0 {
			csvW.Flush()
		}
	}
	csvW.Flush()
	return csvW.Error()
}

// StreamExportZip streams a ZIP file containing multiple CSVs split by codesPerFile.
func (s *Service) StreamExportZip(ctx context.Context, tenantID, batchID string, tenantSettings, campaignSettings map[string]any, opts ExportOptions, zipW *codegen.ZipExporter) error {
	b, err := s.GetByID(ctx, tenantID, batchID)
	if err != nil {
		return err
	}
	if b.Ref2Start == nil || b.Ref2End == nil {
		return fmt.Errorf("batch has no ref2 range")
	}

	cfg := codegen.ConfigFromTenantSettings(tenantSettings)
	cfg = cfg.MergeWith(codegen.ConfigFromCampaignSettings(campaignSettings))

	baseURL := cfg.ScanBaseURL
	if baseURL == "" {
		baseURL = "https://scan.saversure.com"
	}

	startSerial := b.SerialStart
	endSerial := b.SerialEnd
	if opts.StartSerial > 0 {
		startSerial = opts.StartSerial
	}
	if opts.EndSerial > 0 {
		endSerial = opts.EndSerial
	}
	if startSerial < b.SerialStart {
		startSerial = b.SerialStart
	}
	if endSerial > b.SerialEnd {
		endSerial = b.SerialEnd
	}
	if endSerial < startSerial {
		return fmt.Errorf("invalid serial range")
	}

	lotSize := opts.LotSize
	if lotSize <= 0 {
		lotSize = cfg.LotSize
	}
	if lotSize <= 0 {
		lotSize = 10000
	}

	hmacLen := cfg.HMACLength
	if hmacLen <= 0 {
		hmacLen = 8
	}

	codesPerFile := zipW.CodesPerFile
	if codesPerFile <= 0 {
		codesPerFile = 40000
	}

	fileIdx := int64(1)
	rowInFile := int64(0)

	fileName := fmt.Sprintf("%s_%d.csv", b.Prefix, fileIdx)
	if err := zipW.StartFile(fileName); err != nil {
		return err
	}

	for serial := startSerial; serial <= endSerial; serial++ {
		if rowInFile >= codesPerFile {
			zipW.FlushCSV()
			fileIdx++
			rowInFile = 0
			fileName = fmt.Sprintf("%s_%d.csv", b.Prefix, fileIdx)
			if err := zipW.StartFile(fileName); err != nil {
				return err
			}
		}

		offset := serial - b.SerialStart
		ref2Running := *b.Ref2Start + offset

		runningNumber := serial
		if cfg.Ref1MinValue > 0 {
			runningNumber = cfg.Ref1MinValue + offset
		}

		var code, url string
		if cfg.CompactCode {
			code = s.signer.GenerateCompactCode(b.Prefix, serial, hmacLen)
			if cfg.URLFormat == "path" {
				url = fmt.Sprintf("%s/%s", baseURL, code)
			} else {
				url = fmt.Sprintf("%s?code=%s", baseURL, code)
			}
		} else {
			code = s.signer.GenerateCode(b.Prefix, serial)
			url = fmt.Sprintf("%s?code=%s", baseURL, code)
		}

		lotNum := offset/lotSize + 1
		zipW.WriteRecord(codegen.ExportRecord{
			SerialNumber: serial,
			Code:         code,
			Ref1:         codegen.GenerateRef1(runningNumber, cfg),
			Ref2:         codegen.GenerateRef2(ref2Running),
			URL:          url,
			LotNumber:    fmt.Sprintf("LOT%04d", lotNum),
		})
		rowInFile++
	}
	zipW.FlushCSV()
	return zipW.Close()
}
