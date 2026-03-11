package transaction

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Transaction struct {
	ID                string  `json:"id"`
	TenantID          string  `json:"tenant_id"`
	UserID            string  `json:"user_id"`
	RewardID          string  `json:"reward_id"`
	RewardName        *string `json:"reward_name"`
	UserName          *string `json:"user_name"`
	UserPhone         *string `json:"user_phone"`
	Status            string  `json:"status"`
	Tracking          *string `json:"tracking"`
	DeliveryType      *string `json:"delivery_type"`
	CouponCode        *string `json:"coupon_code"`
	AddressID         *string `json:"address_id"`
	RecipientName     *string `json:"recipient_name"`
	RecipientPhone    *string `json:"recipient_phone"`
	AddressLine1      *string `json:"address_line1"`
	AddressLine2      *string `json:"address_line2"`
	District          *string `json:"district"`
	SubDistrict       *string `json:"sub_district"`
	Province          *string `json:"province"`
	PostalCode        *string `json:"postal_code"`
	FulfillmentStatus *string `json:"fulfillment_status"`
	ConfirmedAt       *string `json:"confirmed_at"`
	ExpiresAt         string  `json:"expires_at"`
	CreatedAt         string  `json:"created_at"`
}

type ListFilter struct {
	Status       string
	Search       string
	DateFrom     string
	DateTo       string
	DeliveryType string
	RewardID     string
	SortBy       string
	SortDir      string
	Limit        int
	Offset       int
}

type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

func (s *Service) List(ctx context.Context, tenantID string, f ListFilter) ([]Transaction, int64, error) {
	return s.list(ctx, tenantID, "", f)
}

func (s *Service) ListMine(ctx context.Context, tenantID, userID string, f ListFilter) ([]Transaction, int64, error) {
	return s.list(ctx, tenantID, userID, f)
}

const txnSelectCols = `rr.id, rr.tenant_id, rr.user_id, rr.reward_id, r.name,
		COALESCE(
		  NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''),
		  NULLIF(u.display_name, ''),
		  u.email,
		  u.phone
		) AS user_name,
		u.phone,
		rr.status, rr.tracking_number,
		CASE
		  WHEN COALESCE(rr.delivery_type, 'none') <> 'none' THEN rr.delivery_type
		  WHEN COALESCE(r.delivery_type, 'none') <> 'none' THEN r.delivery_type
		  WHEN r.type = 'coupon' THEN 'coupon'
		  WHEN r.type = 'digital' THEN 'digital'
		  WHEN r.type = 'ticket' THEN 'ticket'
		  ELSE COALESCE(r.delivery_type, 'none')
		END,
		rr.coupon_code,
		rr.address_id,
		COALESCE(rr.recipient_name, ua.recipient_name),
		COALESCE(rr.recipient_phone, ua.phone, u.phone),
		COALESCE(rr.shipping_address_line1, ua.address_line1),
		COALESCE(rr.shipping_address_line2, ua.address_line2),
		COALESCE(rr.shipping_district, ua.district),
		COALESCE(rr.shipping_sub_district, ua.sub_district),
		COALESCE(rr.shipping_province, ua.province),
		COALESCE(rr.shipping_postal_code, ua.postal_code),
		rr.fulfillment_status,
		rr.confirmed_at::text,
		rr.expires_at::text, rr.created_at::text`

const txnFromJoins = `FROM reward_reservations rr
		LEFT JOIN rewards r ON r.id = rr.reward_id
		LEFT JOIN users u ON u.id = rr.user_id
		LEFT JOIN user_addresses ua ON ua.id = rr.address_id`

func scanTransaction(scanner interface{ Scan(dest ...any) error }) (Transaction, error) {
	var t Transaction
	err := scanner.Scan(
		&t.ID, &t.TenantID, &t.UserID, &t.RewardID, &t.RewardName,
		&t.UserName, &t.UserPhone,
		&t.Status, &t.Tracking, &t.DeliveryType, &t.CouponCode,
		&t.AddressID, &t.RecipientName, &t.RecipientPhone,
		&t.AddressLine1, &t.AddressLine2, &t.District, &t.SubDistrict, &t.Province, &t.PostalCode,
		&t.FulfillmentStatus, &t.ConfirmedAt,
		&t.ExpiresAt, &t.CreatedAt,
	)
	return t, err
}

func buildWhereClause(tenantID, userID string, f ListFilter) (string, []any, int) {
	where := "rr.tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if userID != "" {
		where += fmt.Sprintf(" AND rr.user_id = $%d", argN)
		args = append(args, userID)
		argN++
	}

	if f.Status != "" {
		where += fmt.Sprintf(" AND rr.status = $%d", argN)
		args = append(args, f.Status)
		argN++
	}

	if f.DeliveryType != "" {
		where += fmt.Sprintf(" AND COALESCE(rr.delivery_type, COALESCE(r.delivery_type, 'none')) = $%d", argN)
		args = append(args, f.DeliveryType)
		argN++
	}

	if f.RewardID != "" {
		where += fmt.Sprintf(" AND rr.reward_id = $%d", argN)
		args = append(args, f.RewardID)
		argN++
	}

	if f.Search != "" {
		pattern := "%" + f.Search + "%"
		where += fmt.Sprintf(
			` AND (r.name ILIKE $%d OR u.first_name ILIKE $%d OR u.last_name ILIKE $%d
			 OR u.display_name ILIKE $%d OR u.email ILIKE $%d OR u.phone ILIKE $%d
			 OR COALESCE(rr.recipient_name, ua.recipient_name, '') ILIKE $%d
			 OR COALESCE(rr.recipient_phone, ua.phone, '') ILIKE $%d
			 OR rr.tracking_number ILIKE $%d)`,
			argN, argN, argN, argN, argN, argN, argN, argN, argN,
		)
		args = append(args, pattern)
		argN++
	}

	if f.DateFrom != "" {
		where += fmt.Sprintf(" AND rr.created_at >= $%d::timestamptz", argN)
		args = append(args, f.DateFrom)
		argN++
	}

	if f.DateTo != "" {
		where += fmt.Sprintf(" AND rr.created_at < ($%d::date + interval '1 day')", argN)
		args = append(args, f.DateTo)
		argN++
	}

	return where, args, argN
}

var allowedSortCols = map[string]string{
	"created_at":   "rr.created_at",
	"status":       "rr.status",
	"reward_name":  "r.name",
	"user_name":    "user_name",
	"tracking":     "rr.tracking_number",
	"confirmed_at": "rr.confirmed_at",
}

func (s *Service) list(ctx context.Context, tenantID, userID string, f ListFilter) ([]Transaction, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where, args, argN := buildWhereClause(tenantID, userID, f)

	var total int64
	_ = s.db.QueryRow(ctx,
		fmt.Sprintf("SELECT COUNT(*) %s WHERE %s", txnFromJoins, where),
		args...,
	).Scan(&total)

	orderBy := "rr.created_at DESC"
	if col, ok := allowedSortCols[f.SortBy]; ok {
		dir := "ASC"
		if strings.EqualFold(f.SortDir, "desc") {
			dir = "DESC"
		}
		orderBy = fmt.Sprintf("%s %s NULLS LAST", col, dir)
	}

	query := fmt.Sprintf(
		`SELECT %s %s WHERE %s ORDER BY %s LIMIT $%d OFFSET $%d`,
		txnSelectCols, txnFromJoins, where, orderBy, argN, argN+1,
	)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list transactions: %w", err)
	}
	defer rows.Close()

	var txns []Transaction
	for rows.Next() {
		t, err := scanTransaction(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("scan txn: %w", err)
		}
		txns = append(txns, t)
	}
	return txns, total, nil
}

func (s *Service) Summary(ctx context.Context, tenantID string, f ListFilter) ([]StatusCount, error) {
	where, args, _ := buildWhereClause(tenantID, "", ListFilter{
		Search:       f.Search,
		DateFrom:     f.DateFrom,
		DateTo:       f.DateTo,
		DeliveryType: f.DeliveryType,
		RewardID:     f.RewardID,
	})

	rows, err := s.db.Query(ctx,
		fmt.Sprintf(
			`SELECT rr.status, COUNT(*) %s WHERE %s GROUP BY rr.status ORDER BY COUNT(*) DESC`,
			txnFromJoins, where,
		),
		args...,
	)
	if err != nil {
		return nil, fmt.Errorf("summary: %w", err)
	}
	defer rows.Close()

	var counts []StatusCount
	for rows.Next() {
		var sc StatusCount
		if err := rows.Scan(&sc.Status, &sc.Count); err != nil {
			return nil, fmt.Errorf("scan summary: %w", err)
		}
		counts = append(counts, sc)
	}
	return counts, nil
}

func (s *Service) getByID(ctx context.Context, tenantID, id string) (*Transaction, error) {
	row := s.db.QueryRow(ctx,
		fmt.Sprintf(`SELECT %s %s WHERE rr.tenant_id = $1 AND rr.id = $2`, txnSelectCols, txnFromJoins),
		tenantID, id,
	)
	t, err := scanTransaction(row)
	if err != nil {
		return nil, fmt.Errorf("get transaction: %w", err)
	}
	return &t, nil
}

func (s *Service) UpdateStatus(ctx context.Context, tenantID, id, status, tracking string) (*Transaction, error) {
	validStatuses := map[string]bool{
		"PENDING": true, "CONFIRMED": true, "SHIPPING": true,
		"SHIPPED": true, "COMPLETED": true, "CANCELLED": true,
	}
	if !validStatuses[status] {
		return nil, fmt.Errorf("invalid status: %s", status)
	}

	_, err := s.db.Exec(ctx,
		`UPDATE reward_reservations
		 SET status = $3, tracking_number = COALESCE(NULLIF($4, ''), tracking_number), updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2`,
		id, tenantID, status, tracking,
	)
	if err != nil {
		return nil, fmt.Errorf("update transaction: %w", err)
	}
	return s.getByID(ctx, tenantID, id)
}
