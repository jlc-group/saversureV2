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

// ScanEntry is one row from scan_history (each scan attempt: success or duplicate).
type ScanEntry struct {
	ID                  string   `json:"id"`
	CodeID              string   `json:"code_id"`
	TenantID            string   `json:"tenant_id"`
	BatchID             string   `json:"batch_id"`
	SerialNumber        int64    `json:"serial_number"`
	Ref1                string   `json:"ref1"`
	Ref2                string   `json:"ref2"`
	CodeStatus          string   `json:"code_status"`
	ScannedBy           *string  `json:"scanned_by"`
	ScannerName         *string  `json:"scanner_name"`
	ScannerPhone        *string  `json:"scanner_phone"`
	BatchPrefix         string   `json:"batch_prefix"`
	ProductName         *string  `json:"product_name"`
	ProductSKU          *string  `json:"product_sku"`
	ProductImageURL     *string  `json:"product_image_url"`
	CampaignName        *string  `json:"campaign_name"`
	ScanType            string   `json:"scan_type"`
	PointsEarned        int      `json:"points_earned"`
	BonusCurrency       *string  `json:"bonus_currency,omitempty"`
	BonusCurrencyAmount int      `json:"bonus_currency_amount"`
	PromotionID         *string  `json:"promotion_id,omitempty"`
	PromotionName       *string  `json:"promotion_name,omitempty"`
	Latitude            *float64 `json:"latitude"`
	Longitude           *float64 `json:"longitude"`
	Province            *string  `json:"province"`
	District            *string  `json:"district,omitempty"`
	SubDistrict         *string  `json:"sub_district,omitempty"`
	PostalCode          *string  `json:"postal_code,omitempty"`
	LegacyQRCodeID      *int64   `json:"legacy_qr_code_id,omitempty"`
	LegacyQRCodeSerial  *string  `json:"legacy_qr_code_serial,omitempty"`
	CreatedAt           string   `json:"created_at"`
}

// allowedSortColumns maps safe frontend sort keys to SQL expressions.
var allowedSortColumns = map[string]string{
	"serial_number": "COALESCE(c.serial_number, 0)",
	"ref1":          "COALESCE(c.ref1, '')",
	"product_name":  "COALESCE(rp.name, bp.name, lp.name, sh.legacy_product_name)",
	"scan_type":     "sh.scan_type",
	"scanner_name":  "COALESCE(NULLIF(u.display_name,''), u.first_name)",
	"points_earned": "sh.points_earned",
	"scanned_at":    "sh.scanned_at",
}

type ListFilter struct {
	Status          string // code status (scanned, redeemed)
	ScanType        string // success, duplicate_self, duplicate_other
	BatchID         string
	CodeID          string // filter by code = "by code" view
	LegacySerial    string
	LegacyQRCodeID  int64
	SortBy          string // column key (see allowedSortColumns)
	SortDir         string // asc | desc
	Limit           int
	Offset          int
}

func (s *Service) List(ctx context.Context, tenantID string, f ListFilter) ([]ScanEntry, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where := "sh.tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if f.CodeID != "" {
		where += fmt.Sprintf(" AND sh.code_id = $%d", argN)
		args = append(args, f.CodeID)
		argN++
	}
	if f.LegacySerial != "" {
		where += fmt.Sprintf(" AND sh.legacy_qr_code_serial = $%d", argN)
		args = append(args, f.LegacySerial)
		argN++
	}
	if f.LegacyQRCodeID > 0 {
		where += fmt.Sprintf(" AND sh.legacy_qr_code_id = $%d", argN)
		args = append(args, f.LegacyQRCodeID)
		argN++
	}
	if f.ScanType != "" {
		where += fmt.Sprintf(" AND sh.scan_type = $%d", argN)
		args = append(args, f.ScanType)
		argN++
	}
	if f.BatchID != "" {
		where += fmt.Sprintf(" AND sh.batch_id = $%d", argN)
		args = append(args, f.BatchID)
		argN++
	}
	if f.Status != "" {
		where += fmt.Sprintf(" AND EXISTS (SELECT 1 FROM codes c WHERE c.id = sh.code_id AND c.tenant_id = sh.tenant_id AND c.status = $%d)", argN)
		args = append(args, f.Status)
		argN++
	}

	var total int64
	countQuery := fmt.Sprintf(
		`SELECT COUNT(*) FROM scan_history sh WHERE %s`,
		where,
	)
	_ = s.db.QueryRow(ctx, countQuery, args...).Scan(&total)

	// build ORDER BY — default newest first
	orderCol := "sh.scanned_at"
	if col, ok := allowedSortColumns[f.SortBy]; ok {
		orderCol = col
	}
	orderDir := "DESC"
	if f.SortDir == "asc" {
		orderDir = "ASC"
	}
	orderNulls := " NULLS LAST"
	if orderCol == "sh.scanned_at" {
		orderNulls = ""
	}

	fastSortable := f.SortBy == "" || f.SortBy == "scanned_at" || f.SortBy == "scan_type" || f.SortBy == "points_earned" || f.SortBy == "serial_number" || f.SortBy == "ref1"
	query := ""
	if fastSortable {
		finalOrderCol := orderCol
		query = fmt.Sprintf(
			`WITH base AS (
				SELECT sh.id
				FROM scan_history sh
				LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
				WHERE %s
				ORDER BY %s %s%s, sh.scanned_at DESC
				LIMIT $%d OFFSET $%d
			)
			SELECT sh.id, COALESCE(sh.code_id::text, ''), sh.tenant_id, COALESCE(sh.batch_id::text, ''),
			       COALESCE(c.serial_number, 0), COALESCE(c.ref1, ''), COALESCE(c.ref2, ''),
			       COALESCE(c.status, ''),
			       sh.user_id::text,
			       COALESCE(NULLIF(u.display_name,''), NULLIF(TRIM(CONCAT(u.first_name,' ',u.last_name)),''), u.email, sh.user_id::text),
			       u.phone,
			       COALESCE(b.prefix, ''),
			       COALESCE(rp.name, bp.name, lp.name, sh.legacy_product_name),
			       COALESCE(rp.sku, bp.sku, lp.sku, sh.legacy_product_sku),
			       COALESCE(rp.image_url, bp.image_url, lp.image_url, sh.legacy_product_image_url),
			       cam.name,
			       COALESCE(sh.scan_type, 'success'), COALESCE(sh.points_earned, 0),
			       sh.bonus_currency, COALESCE(sh.bonus_currency_amount, 0),
			       sh.promotion_id::text, promo.name,
			       sh.latitude, sh.longitude, sh.province, sh.district, sh.sub_district, sh.postal_code,
			       sh.legacy_qr_code_id, sh.legacy_qr_code_serial,
			       sh.scanned_at::text
			FROM base bse
			JOIN scan_history sh ON sh.id = bse.id
			LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
			LEFT JOIN batches b ON b.id = sh.batch_id
			LEFT JOIN campaigns cam ON cam.id = sh.campaign_id
			LEFT JOIN users u ON u.id = sh.user_id
			LEFT JOIN rolls r ON r.batch_id = sh.batch_id AND c.serial_number BETWEEN r.serial_start AND r.serial_end
			LEFT JOIN products rp ON rp.id = r.product_id
			LEFT JOIN products bp ON bp.id = b.product_id
			LEFT JOIN migration_entity_maps lpm ON lpm.tenant_id = sh.tenant_id AND lpm.entity_type = 'product' AND lpm.source_system = 'v1' AND lpm.source_id = sh.legacy_product_v1_id::text
			LEFT JOIN products lp ON lp.id::text = lpm.target_id AND lp.tenant_id = sh.tenant_id
			LEFT JOIN promotions promo ON promo.id = sh.promotion_id
			ORDER BY %s %s%s, sh.scanned_at DESC`,
			where, orderCol, orderDir, orderNulls, argN, argN+1, finalOrderCol, orderDir, orderNulls,
		)
	} else {
		// Fallback for sorts that depend on joined tables such as product_name / scanner_name.
		query = fmt.Sprintf(
			`SELECT sh.id, COALESCE(sh.code_id::text, ''), sh.tenant_id, COALESCE(sh.batch_id::text, ''),
			        COALESCE(c.serial_number, 0), COALESCE(c.ref1, ''), COALESCE(c.ref2, ''),
			        COALESCE(c.status, ''),
			        sh.user_id::text,
			        COALESCE(NULLIF(u.display_name,''), NULLIF(TRIM(CONCAT(u.first_name,' ',u.last_name)),''), u.email, sh.user_id::text),
			        u.phone,
			        COALESCE(b.prefix, ''),
			        COALESCE(rp.name, bp.name, lp.name, sh.legacy_product_name),
			        COALESCE(rp.sku, bp.sku, lp.sku, sh.legacy_product_sku),
			        COALESCE(rp.image_url, bp.image_url, lp.image_url, sh.legacy_product_image_url),
			        cam.name,
			        COALESCE(sh.scan_type, 'success'), COALESCE(sh.points_earned, 0),
			        sh.bonus_currency, COALESCE(sh.bonus_currency_amount, 0),
			        sh.promotion_id::text, promo.name,
			        sh.latitude, sh.longitude, sh.province, sh.district, sh.sub_district, sh.postal_code,
			        sh.legacy_qr_code_id, sh.legacy_qr_code_serial,
			        sh.scanned_at::text
			 FROM scan_history sh
			 LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
			 LEFT JOIN batches b ON b.id = sh.batch_id
			 LEFT JOIN campaigns cam ON cam.id = sh.campaign_id
			 LEFT JOIN users u ON u.id = sh.user_id
			 LEFT JOIN rolls r ON r.batch_id = sh.batch_id AND c.serial_number BETWEEN r.serial_start AND r.serial_end
			 LEFT JOIN products rp ON rp.id = r.product_id
			 LEFT JOIN products bp ON bp.id = b.product_id
			 LEFT JOIN migration_entity_maps lpm ON lpm.tenant_id = sh.tenant_id AND lpm.entity_type = 'product' AND lpm.source_system = 'v1' AND lpm.source_id = sh.legacy_product_v1_id::text
			 LEFT JOIN products lp ON lp.id::text = lpm.target_id AND lp.tenant_id = sh.tenant_id
			 LEFT JOIN promotions promo ON promo.id = sh.promotion_id
			 WHERE %s
			 ORDER BY %s %s%s, sh.scanned_at DESC
			 LIMIT $%d OFFSET $%d`,
			where, orderCol, orderDir, orderNulls, argN, argN+1,
		)
	}
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list scans: %w", err)
	}
	defer rows.Close()

	var entries []ScanEntry
	for rows.Next() {
		var e ScanEntry
		var scannedBy, scannerName, scannerPhone *string
		if err := rows.Scan(&e.ID, &e.CodeID, &e.TenantID, &e.BatchID, &e.SerialNumber, &e.Ref1, &e.Ref2,
			&e.CodeStatus, &scannedBy, &scannerName, &scannerPhone, &e.BatchPrefix,
			&e.ProductName, &e.ProductSKU, &e.ProductImageURL, &e.CampaignName,
			&e.ScanType, &e.PointsEarned, &e.BonusCurrency, &e.BonusCurrencyAmount,
			&e.PromotionID, &e.PromotionName,
			&e.Latitude, &e.Longitude, &e.Province, &e.District, &e.SubDistrict, &e.PostalCode, &e.LegacyQRCodeID, &e.LegacyQRCodeSerial, &e.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan row: %w", err)
		}
		e.ScannedBy = scannedBy
		e.ScannerName = scannerName
		e.ScannerPhone = scannerPhone
		entries = append(entries, e)
	}
	return entries, total, nil
}

// ListByUser returns scan history for a specific user (consumer self-view).
func (s *Service) ListByUser(ctx context.Context, tenantID, userID string, limit, offset int) ([]ScanEntry, int64, error) {
	if limit <= 0 {
		limit = 50
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM scan_history sh WHERE sh.tenant_id = $1 AND sh.user_id = $2`,
		tenantID, userID,
	).Scan(&total)

	rows, err := s.db.Query(ctx,
		`SELECT sh.id, COALESCE(sh.code_id::text, ''), sh.tenant_id, COALESCE(sh.batch_id::text, ''),
		        COALESCE(c.serial_number, 0), COALESCE(c.ref1, ''), COALESCE(c.ref2, ''),
		        COALESCE(c.status, ''),
		        sh.user_id::text,
		        COALESCE(NULLIF(u.display_name,''), NULLIF(TRIM(CONCAT(u.first_name,' ',u.last_name)),''), u.email, sh.user_id::text),
		        u.phone,
		        COALESCE(b.prefix, ''),
		        COALESCE(rp.name, bp.name, lp.name, sh.legacy_product_name),
		        COALESCE(rp.sku, bp.sku, lp.sku, sh.legacy_product_sku),
		        COALESCE(rp.image_url, bp.image_url, lp.image_url, sh.legacy_product_image_url),
		        cam.name,
		        COALESCE(sh.scan_type, 'success'), COALESCE(sh.points_earned, 0),
		        sh.bonus_currency, COALESCE(sh.bonus_currency_amount, 0),
		        sh.promotion_id::text, promo.name,
		        sh.latitude, sh.longitude, sh.province, sh.district, sh.sub_district, sh.postal_code,
		        sh.legacy_qr_code_id, sh.legacy_qr_code_serial,
		        sh.scanned_at::text
		 FROM scan_history sh
		 LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
		 LEFT JOIN batches b ON b.id = sh.batch_id
		 LEFT JOIN campaigns cam ON cam.id = sh.campaign_id
		 LEFT JOIN users u ON u.id = sh.user_id
		 LEFT JOIN rolls r ON r.batch_id = sh.batch_id AND c.serial_number BETWEEN r.serial_start AND r.serial_end
		 LEFT JOIN products rp ON rp.id = r.product_id
		 LEFT JOIN products bp ON bp.id = b.product_id
		 LEFT JOIN migration_entity_maps lpm ON lpm.tenant_id = sh.tenant_id AND lpm.entity_type = 'product' AND lpm.source_system = 'v1' AND lpm.source_id = sh.legacy_product_v1_id::text
		 LEFT JOIN products lp ON lp.id::text = lpm.target_id AND lp.tenant_id = sh.tenant_id
		 LEFT JOIN promotions promo ON promo.id = sh.promotion_id
		 WHERE sh.tenant_id = $1 AND sh.user_id = $2
		 ORDER BY sh.scanned_at DESC
		 LIMIT $3 OFFSET $4`,
		tenantID, userID, limit, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("list user scans: %w", err)
	}
	defer rows.Close()

	var entries []ScanEntry
	for rows.Next() {
		var e ScanEntry
		var scannedBy, scannerName, scannerPhone *string
		if err := rows.Scan(&e.ID, &e.CodeID, &e.TenantID, &e.BatchID, &e.SerialNumber, &e.Ref1, &e.Ref2,
			&e.CodeStatus, &scannedBy, &scannerName, &scannerPhone, &e.BatchPrefix,
			&e.ProductName, &e.ProductSKU, &e.ProductImageURL, &e.CampaignName,
			&e.ScanType, &e.PointsEarned, &e.BonusCurrency, &e.BonusCurrencyAmount,
			&e.PromotionID, &e.PromotionName,
			&e.Latitude, &e.Longitude, &e.Province, &e.District, &e.SubDistrict, &e.PostalCode, &e.LegacyQRCodeID, &e.LegacyQRCodeSerial, &e.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan row: %w", err)
		}
		e.ScannedBy = scannedBy
		e.ScannerName = scannerName
		e.ScannerPhone = scannerPhone
		entries = append(entries, e)
	}
	return entries, total, nil
}

// ListByCodeID returns all scan attempts for one code (who scanned, when, type).
func (s *Service) ListByCodeID(ctx context.Context, tenantID, codeID string) ([]ScanEntry, error) {
	entries, _, err := s.List(ctx, tenantID, ListFilter{CodeID: codeID, Limit: 100})
	if err != nil {
		return nil, err
	}

	hasSuccess := false
	for _, entry := range entries {
		if entry.ScanType == "success" {
			hasSuccess = true
			break
		}
	}
	if hasSuccess {
		return entries, nil
	}

	synthetic, err := s.loadPrimaryScanFallback(ctx, tenantID, codeID)
	if err == nil && synthetic != nil {
		entries = append([]ScanEntry{*synthetic}, entries...)
	}
	return entries, nil
}

func (s *Service) loadPrimaryScanFallback(ctx context.Context, tenantID, codeID string) (*ScanEntry, error) {
	var entry ScanEntry
	var scannedBy, scannerName, scannerPhone *string
	err := s.db.QueryRow(ctx,
		`SELECT
			'fallback-' || c.id::text AS synthetic_id,
			c.id::text,
			c.tenant_id,
			c.batch_id,
			COALESCE(c.serial_number, 0),
			COALESCE(c.ref1, ''),
			COALESCE(c.ref2, ''),
			COALESCE(c.status, ''),
			c.scanned_by::text,
			COALESCE(NULLIF(u.display_name,''), NULLIF(TRIM(CONCAT(u.first_name,' ',u.last_name)),''), u.email, c.scanned_by::text),
			u.phone,
			COALESCE(b.prefix, ''),
			COALESCE(rp.name, bp.name),
			COALESCE(rp.sku, bp.sku),
			COALESCE(rp.image_url, bp.image_url),
			cam.name,
			'success',
			0,
			NULL::varchar,
			0,
			NULL::uuid,
			NULL::varchar,
			NULL::float8,
			NULL::float8,
			NULL::text,
			NULL::text,
			NULL::text,
			NULL::text,
			NULL::bigint,
			NULL::text,
			c.scanned_at::text
		 FROM codes c
		 LEFT JOIN batches b ON b.id = c.batch_id
		 LEFT JOIN campaigns cam ON cam.id = b.campaign_id
		 LEFT JOIN users u ON u.id = c.scanned_by
		 LEFT JOIN rolls r ON r.batch_id = c.batch_id AND c.serial_number BETWEEN r.serial_start AND r.serial_end
		 LEFT JOIN products rp ON rp.id = r.product_id
		 LEFT JOIN products bp ON bp.id = b.product_id
		 WHERE c.id = $1 AND c.tenant_id = $2 AND c.scanned_by IS NOT NULL`,
		codeID, tenantID,
	).Scan(
		&entry.ID, &entry.CodeID, &entry.TenantID, &entry.BatchID, &entry.SerialNumber, &entry.Ref1, &entry.Ref2,
		&entry.CodeStatus, &scannedBy, &scannerName, &scannerPhone, &entry.BatchPrefix, &entry.ProductName,
		&entry.ProductSKU, &entry.ProductImageURL, &entry.CampaignName, &entry.ScanType, &entry.PointsEarned,
		&entry.BonusCurrency, &entry.BonusCurrencyAmount,
		&entry.PromotionID, &entry.PromotionName,
		&entry.Latitude, &entry.Longitude, &entry.Province, &entry.District, &entry.SubDistrict, &entry.PostalCode, &entry.LegacyQRCodeID, &entry.LegacyQRCodeSerial, &entry.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	entry.ScannedBy = scannedBy
	entry.ScannerName = scannerName
	entry.ScannerPhone = scannerPhone
	return &entry, nil
}

// GetByID returns one scan_history entry by its id (for backward compat).
func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*ScanEntry, error) {
	var e ScanEntry
	var scannedBy, scannerName, scannerPhone *string
	err := s.db.QueryRow(ctx,
		`SELECT sh.id, COALESCE(sh.code_id::text, ''), sh.tenant_id, sh.batch_id,
		        COALESCE(c.serial_number, 0), COALESCE(c.ref1, ''), COALESCE(c.ref2, ''),
		        COALESCE(c.status, ''),
		        sh.user_id::text,
		        COALESCE(NULLIF(u.display_name,''), NULLIF(TRIM(CONCAT(u.first_name,' ',u.last_name)),''), u.email, sh.user_id::text),
		        u.phone,
		        COALESCE(b.prefix, ''),
		        COALESCE(rp.name, bp.name, lp.name, sh.legacy_product_name), COALESCE(rp.sku, bp.sku, lp.sku, sh.legacy_product_sku), COALESCE(rp.image_url, bp.image_url, lp.image_url, sh.legacy_product_image_url),
		        cam.name,
		        COALESCE(sh.scan_type, 'success'), COALESCE(sh.points_earned, 0),
		        sh.bonus_currency, COALESCE(sh.bonus_currency_amount, 0),
		        sh.promotion_id::text, promo.name,
		        sh.latitude, sh.longitude, sh.province, sh.district, sh.sub_district, sh.postal_code,
		        sh.legacy_qr_code_id, sh.legacy_qr_code_serial,
		        sh.scanned_at::text
		 FROM scan_history sh
		 LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
		 LEFT JOIN batches b ON b.id = sh.batch_id
		 LEFT JOIN campaigns cam ON cam.id = sh.campaign_id
		 LEFT JOIN users u ON u.id = sh.user_id
		 LEFT JOIN rolls r ON r.batch_id = sh.batch_id AND c.serial_number BETWEEN r.serial_start AND r.serial_end
		 LEFT JOIN products rp ON rp.id = r.product_id
		 LEFT JOIN products bp ON bp.id = b.product_id
		 LEFT JOIN migration_entity_maps lpm ON lpm.tenant_id = sh.tenant_id AND lpm.entity_type = 'product' AND lpm.source_system = 'v1' AND lpm.source_id = sh.legacy_product_v1_id::text
		 LEFT JOIN products lp ON lp.id::text = lpm.target_id AND lp.tenant_id = sh.tenant_id
		 LEFT JOIN promotions promo ON promo.id = sh.promotion_id
		 WHERE sh.id = $1 AND sh.tenant_id = $2`,
		id, tenantID,
	).Scan(&e.ID, &e.CodeID, &e.TenantID, &e.BatchID,
		&e.SerialNumber, &e.Ref1, &e.Ref2, &e.CodeStatus, &scannedBy, &scannerName, &scannerPhone,
		&e.BatchPrefix, &e.ProductName, &e.ProductSKU, &e.ProductImageURL, &e.CampaignName, &e.ScanType, &e.PointsEarned,
		&e.BonusCurrency, &e.BonusCurrencyAmount,
		&e.PromotionID, &e.PromotionName,
		&e.Latitude, &e.Longitude, &e.Province, &e.District, &e.SubDistrict, &e.PostalCode, &e.LegacyQRCodeID, &e.LegacyQRCodeSerial, &e.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("scan not found: %w", err)
	}
	e.ScannedBy = scannedBy
	e.ScannerName = scannerName
	e.ScannerPhone = scannerPhone
	return &e, nil
}

// SuspiciousScanSummary is a code that has duplicate scans (for alerts).
type SuspiciousScanSummary struct {
	AlertKey         string  `json:"alert_key"`
	DataSource       string  `json:"data_source"`
	CodeID           string  `json:"code_id"`
	Ref1             string  `json:"ref1"`
	BatchPrefix      string  `json:"batch_prefix"`
	SerialNumber     int64   `json:"serial_number"`
	LegacySerial     *string `json:"legacy_serial,omitempty"`
	LegacyQRCodeID   *int64  `json:"legacy_qr_code_id,omitempty"`
	TotalScans       int64   `json:"total_scans"`
	DuplicateCount   int64   `json:"duplicate_count"`
	FirstScannedAt   string  `json:"first_scanned_at"`
}

// ListSuspicious returns codes that have at least one duplicate scan (for monitoring).
func (s *Service) ListSuspicious(ctx context.Context, tenantID string, limit int) ([]SuspiciousScanSummary, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `
		WITH suspicious_groups AS (
			SELECT
				COALESCE(
					NULLIF(sh.code_id::text, ''),
					NULLIF(sh.legacy_qr_code_serial, ''),
					CASE
						WHEN sh.legacy_qr_code_id IS NOT NULL THEN 'legacy-id:' || sh.legacy_qr_code_id::text
						ELSE NULL
					END
				) AS alert_key,
				CASE
					WHEN BOOL_OR(sh.code_id IS NOT NULL) THEN 'v2'
					WHEN BOOL_OR(NULLIF(sh.legacy_qr_code_serial, '') IS NOT NULL OR sh.legacy_qr_code_id IS NOT NULL) THEN 'v1'
					ELSE 'unknown'
				END AS data_source,
				MAX(COALESCE(sh.code_id::text, '')) AS code_id,
				MAX(COALESCE(c.ref1, '')) AS ref1,
				MAX(COALESCE(b.prefix, '')) AS batch_prefix,
				MAX(COALESCE(c.serial_number, 0)) AS serial_number,
				MAX(sh.legacy_qr_code_serial) AS legacy_serial,
				MAX(sh.legacy_qr_code_id) AS legacy_qr_code_id,
				COUNT(*)::bigint AS total_scans,
				COUNT(*) FILTER (WHERE sh.scan_type IN ('duplicate_self', 'duplicate_other'))::bigint AS duplicate_count,
				MIN(sh.scanned_at)::text AS first_scanned_at
			FROM scan_history sh
			LEFT JOIN codes c ON c.id = sh.code_id AND c.tenant_id = sh.tenant_id
			LEFT JOIN batches b ON b.id = sh.batch_id
			WHERE sh.tenant_id = $1
			  AND COALESCE(
				NULLIF(sh.code_id::text, ''),
				NULLIF(sh.legacy_qr_code_serial, ''),
				CASE
					WHEN sh.legacy_qr_code_id IS NOT NULL THEN 'legacy-id:' || sh.legacy_qr_code_id::text
					ELSE NULL
				END
			  ) IS NOT NULL
			GROUP BY 1
		)
		SELECT alert_key, data_source, code_id, ref1, batch_prefix, serial_number,
		       legacy_serial, legacy_qr_code_id, total_scans, duplicate_count, first_scanned_at
		  FROM suspicious_groups
		 WHERE duplicate_count > 0
		 ORDER BY duplicate_count DESC, first_scanned_at DESC
		 LIMIT $2`
	rows, err := s.db.Query(ctx, query, tenantID, limit)
	if err != nil {
		return nil, fmt.Errorf("list suspicious: %w", err)
	}
	defer rows.Close()
	var out []SuspiciousScanSummary
	for rows.Next() {
		var r SuspiciousScanSummary
		if err := rows.Scan(&r.AlertKey, &r.DataSource, &r.CodeID, &r.Ref1, &r.BatchPrefix, &r.SerialNumber,
			&r.LegacySerial, &r.LegacyQRCodeID, &r.TotalScans, &r.DuplicateCount, &r.FirstScannedAt); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, nil
}
