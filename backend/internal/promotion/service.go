package promotion

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// --- Domain Models ---

type Promotion struct {
	ID            string      `json:"id"`
	TenantID      string      `json:"tenant_id"`
	Name          string      `json:"name"`
	Description   *string     `json:"description"`
	StartDate     time.Time   `json:"start_date"`
	EndDate       time.Time   `json:"end_date"`
	ApplyTo       string      `json:"apply_to"`
	Status        string      `json:"status"`
	CreatedBy     *string     `json:"created_by"`
	ApprovedBy    *string     `json:"approved_by"`
	ApprovedAt    *string     `json:"approved_at"`
	RejectionNote *string     `json:"rejection_note"`
	CreatedAt     string      `json:"created_at"`
	BonusRules    []BonusRule `json:"bonus_rules"`
	IsActive      bool        `json:"is_active"`
}

type BonusRule struct {
	ID           string  `json:"id"`
	ProductID    *string `json:"product_id"`
	ProductName  string  `json:"product_name,omitempty"`
	ProductSKU   string  `json:"product_sku,omitempty"`
	Currency     string  `json:"currency"`
	BonusType    string  `json:"bonus_type"`
	BonusAmount  int     `json:"bonus_amount"`
	ExpiresAt    *string `json:"expires_at"`
	ExpiryAction string  `json:"expiry_action"`
}

// --- Input DTOs ---

type CreateInput struct {
	Name        string           `json:"name" binding:"required"`
	Description string           `json:"description"`
	StartDate   string           `json:"start_date" binding:"required"`
	EndDate     string           `json:"end_date" binding:"required"`
	ApplyTo     string           `json:"apply_to"`
	BonusRules  []BonusRuleInput `json:"bonus_rules"`
}

type UpdateInput struct {
	Name        *string          `json:"name"`
	Description *string          `json:"description"`
	StartDate   *string          `json:"start_date"`
	EndDate     *string          `json:"end_date"`
	ApplyTo     *string          `json:"apply_to"`
	BonusRules  []BonusRuleInput `json:"bonus_rules"`
}

type BonusRuleInput struct {
	ProductID    *string `json:"product_id"`
	Currency     string  `json:"currency"`
	BonusType    string  `json:"bonus_type"`
	BonusAmount  int     `json:"bonus_amount"`
	ExpiresAt    *string `json:"expires_at"`
	ExpiryAction string  `json:"expiry_action"`
}

// --- Scan-time Bonus Calculation ---

type ScanBonus struct {
	PointBonus      int
	CurrencyBonuses []CurrencyBonusItem
	PromotionIDs    []string
}

type CurrencyBonusItem struct {
	Currency     string
	Amount       int
	ExpiresAt    *time.Time
	ExpiryAction string
	PromotionID  string
}

// --- SQL helpers ---

const promoSelectCols = `p.id, p.tenant_id, p.name, p.description,
	p.start_date, p.end_date, p.apply_to, p.status,
	p.created_by, p.approved_by, p.approved_at::text, p.rejection_note,
	p.created_at::text`

const promoReturnCols = `id, tenant_id, name, description,
	start_date, end_date, apply_to, status,
	created_by, approved_by, approved_at::text, rejection_note,
	created_at::text`

func scanPromoRow(scan func(dest ...any) error) (Promotion, error) {
	var p Promotion
	err := scan(&p.ID, &p.TenantID, &p.Name, &p.Description,
		&p.StartDate, &p.EndDate, &p.ApplyTo, &p.Status,
		&p.CreatedBy, &p.ApprovedBy, &p.ApprovedAt, &p.RejectionNote,
		&p.CreatedAt)
	if err == nil {
		p.IsActive = isActiveNow(p)
		if p.BonusRules == nil {
			p.BonusRules = []BonusRule{}
		}
	}
	return p, err
}

func (s *Service) loadBonusRules(ctx context.Context, promotionID string) ([]BonusRule, error) {
	rows, err := s.db.Query(ctx,
		`SELECT r.id, r.product_id::text, COALESCE(pr.name, ''), COALESCE(pr.sku, ''),
			r.currency, r.bonus_type, r.bonus_amount, r.expires_at::text, r.expiry_action
		 FROM promotion_bonus_rules r
		 LEFT JOIN products pr ON pr.id = r.product_id
		 WHERE r.promotion_id = $1
		 ORDER BY r.created_at`,
		promotionID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []BonusRule
	for rows.Next() {
		var r BonusRule
		if err := rows.Scan(&r.ID, &r.ProductID, &r.ProductName, &r.ProductSKU,
			&r.Currency, &r.BonusType, &r.BonusAmount, &r.ExpiresAt, &r.ExpiryAction); err != nil {
			return nil, err
		}
		rules = append(rules, r)
	}
	if rules == nil {
		rules = []BonusRule{}
	}
	return rules, nil
}

func (s *Service) saveBonusRules(ctx context.Context, tx interface{ Exec(ctx context.Context, sql string, args ...any) (interface{ RowsAffected() int64 }, error) }, promotionID string, rules []BonusRuleInput) error {
	// This is a simplified interface - we'll use the real pgx tx
	return nil
}

func (s *Service) saveBonusRulesTx(ctx context.Context, promotionID string, rules []BonusRuleInput, execFn func(ctx context.Context, sql string, args ...any) error) error {
	// Delete old rules
	if err := execFn(ctx, `DELETE FROM promotion_bonus_rules WHERE promotion_id = $1`, promotionID); err != nil {
		return fmt.Errorf("clear old rules: %w", err)
	}

	for _, r := range rules {
		if r.Currency == "" {
			r.Currency = "point"
		}
		if r.BonusType == "" {
			r.BonusType = "fixed"
		}
		if r.ExpiryAction == "" {
			r.ExpiryAction = "keep"
		}

		var expiresAt *time.Time
		if r.ExpiresAt != nil && *r.ExpiresAt != "" {
			t, err := time.Parse(time.RFC3339, *r.ExpiresAt)
			if err == nil {
				expiresAt = &t
			}
		}

		if err := execFn(ctx,
			`INSERT INTO promotion_bonus_rules (promotion_id, product_id, currency, bonus_type, bonus_amount, expires_at, expiry_action)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			promotionID, r.ProductID, r.Currency, r.BonusType, r.BonusAmount, expiresAt, r.ExpiryAction,
		); err != nil {
			return fmt.Errorf("insert rule: %w", err)
		}
	}
	return nil
}

// --- CRUD ---

func (s *Service) Create(ctx context.Context, tenantID, userID string, input CreateInput) (*Promotion, error) {
	if input.ApplyTo == "" {
		input.ApplyTo = "selected"
	}

	startDate, err := time.Parse(time.RFC3339, input.StartDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start_date format: %w", err)
	}
	endDate, err := time.Parse(time.RFC3339, input.EndDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end_date format: %w", err)
	}
	if !endDate.After(startDate) {
		return nil, fmt.Errorf("end_date must be after start_date")
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	p, err := scanPromoRow(tx.QueryRow(ctx,
		`INSERT INTO promotions (tenant_id, name, description, start_date, end_date, apply_to, created_by,
			bonus_points, bonus_type)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 'fixed')
		 RETURNING `+promoReturnCols,
		tenantID, input.Name, nilIfEmpty(input.Description),
		startDate, endDate, input.ApplyTo, userID,
	).Scan)
	if err != nil {
		return nil, fmt.Errorf("create promotion: %w", err)
	}

	// Save bonus rules
	execFn := func(ctx context.Context, sql string, args ...any) error {
		_, err := tx.Exec(ctx, sql, args...)
		return err
	}
	if err := s.saveBonusRulesTx(ctx, p.ID, input.BonusRules, execFn); err != nil {
		return nil, fmt.Errorf("save rules: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	p.BonusRules, _ = s.loadBonusRules(ctx, p.ID)
	return &p, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Promotion, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`UPDATE promotions SET
			name = COALESCE($3, name),
			description = COALESCE($4, description),
			start_date = COALESCE($5::timestamptz, start_date),
			end_date = COALESCE($6::timestamptz, end_date),
			apply_to = COALESCE($7, apply_to),
			updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status IN ('draft', 'rejected')`,
		id, tenantID, input.Name, input.Description,
		input.StartDate, input.EndDate, input.ApplyTo,
	)
	if err != nil {
		return nil, fmt.Errorf("update promotion: %w", err)
	}

	if input.BonusRules != nil {
		execFn := func(ctx context.Context, sql string, args ...any) error {
			_, err := tx.Exec(ctx, sql, args...)
			return err
		}
		if err := s.saveBonusRulesTx(ctx, id, input.BonusRules, execFn); err != nil {
			return nil, fmt.Errorf("save rules: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Promotion, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+promoSelectCols+`
		 FROM promotions p
		 WHERE p.tenant_id = $1
		 ORDER BY p.start_date DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list promotions: %w", err)
	}
	defer rows.Close()

	var promos []Promotion
	for rows.Next() {
		p, err := scanPromoRow(rows.Scan)
		if err != nil {
			return nil, fmt.Errorf("scan promotion: %w", err)
		}
		p.BonusRules, _ = s.loadBonusRules(ctx, p.ID)
		promos = append(promos, p)
	}
	return promos, nil
}

func (s *Service) GetByID(ctx context.Context, tenantID, id string) (*Promotion, error) {
	p, err := scanPromoRow(s.db.QueryRow(ctx,
		`SELECT `+promoSelectCols+`
		 FROM promotions p
		 WHERE p.id = $1 AND p.tenant_id = $2`, id, tenantID,
	).Scan)
	if err != nil {
		return nil, fmt.Errorf("promotion not found: %w", err)
	}

	p.BonusRules, _ = s.loadBonusRules(ctx, p.ID)
	return &p, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM promotions WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	if err != nil {
		return fmt.Errorf("delete promotion: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("promotion not found")
	}
	return nil
}

// --- Approval Workflow ---

func (s *Service) Submit(ctx context.Context, tenantID, id string) (*Promotion, error) {
	tag, err := s.db.Exec(ctx,
		`UPDATE promotions SET status = 'pending_approval', updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status IN ('draft', 'rejected')`,
		id, tenantID)
	if err != nil {
		return nil, fmt.Errorf("submit promotion: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return nil, fmt.Errorf("promotion must be in draft or rejected status to submit")
	}
	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Approve(ctx context.Context, tenantID, id, approverID string) (*Promotion, error) {
	tag, err := s.db.Exec(ctx,
		`UPDATE promotions SET status = 'approved', approved_by = $3, approved_at = NOW(),
			rejection_note = NULL, updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status = 'pending_approval'`,
		id, tenantID, approverID)
	if err != nil {
		return nil, fmt.Errorf("approve promotion: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return nil, fmt.Errorf("promotion must be in pending_approval status to approve")
	}
	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Reject(ctx context.Context, tenantID, id, approverID, note string) (*Promotion, error) {
	if note == "" {
		return nil, fmt.Errorf("rejection note is required")
	}
	tag, err := s.db.Exec(ctx,
		`UPDATE promotions SET status = 'rejected', approved_by = $3, rejection_note = $4, updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status = 'pending_approval'`,
		id, tenantID, approverID, note)
	if err != nil {
		return nil, fmt.Errorf("reject promotion: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return nil, fmt.Errorf("promotion must be in pending_approval status to reject")
	}
	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Deactivate(ctx context.Context, tenantID, id string) (*Promotion, error) {
	_, err := s.db.Exec(ctx,
		`UPDATE promotions SET status = 'inactive', updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status = 'approved'`,
		id, tenantID)
	if err != nil {
		return nil, fmt.Errorf("deactivate promotion: %w", err)
	}
	return s.GetByID(ctx, tenantID, id)
}

func (s *Service) Reactivate(ctx context.Context, tenantID, id string) (*Promotion, error) {
	_, err := s.db.Exec(ctx,
		`UPDATE promotions SET status = 'approved', updated_at = NOW()
		 WHERE id = $1 AND tenant_id = $2 AND status = 'inactive'`,
		id, tenantID)
	if err != nil {
		return nil, fmt.Errorf("reactivate promotion: %w", err)
	}
	return s.GetByID(ctx, tenantID, id)
}

// --- Scan-time Bonus Calculation ---

// CalcBonus computes all applicable bonuses from approved promotions for a product.
// Returns point bonus (summed) + individual currency bonuses with expiry info.
func (s *Service) CalcBonus(ctx context.Context, tenantID, productID string, basePoints int) (*ScanBonus, error) {
	rows, err := s.db.Query(ctx,
		`SELECT r.currency, r.bonus_type, r.bonus_amount, r.expires_at, r.expiry_action, p.id
		 FROM promotion_bonus_rules r
		 JOIN promotions p ON p.id = r.promotion_id
		 WHERE p.tenant_id = $1
			AND p.status = 'approved'
			AND NOW() BETWEEN p.start_date AND p.end_date
			AND (r.product_id IS NULL OR r.product_id = $2::uuid)`,
		tenantID, productID,
	)
	if err != nil {
		return nil, fmt.Errorf("calc bonus: %w", err)
	}
	defer rows.Close()

	result := &ScanBonus{}
	var fixedPointTotal int
	highestMultiplier := 0
	promoSet := map[string]bool{}

	for rows.Next() {
		var currency, bonusType, expiryAction, promotionID string
		var bonusAmount int
		var expiresAt *time.Time
		if err := rows.Scan(&currency, &bonusType, &bonusAmount, &expiresAt, &expiryAction, &promotionID); err != nil {
			continue
		}

		if promotionID != "" && !promoSet[promotionID] {
			promoSet[promotionID] = true
			result.PromotionIDs = append(result.PromotionIDs, promotionID)
		}

		if currency == "point" || currency == "" {
			switch bonusType {
			case "multiplier":
				if bonusAmount > highestMultiplier {
					highestMultiplier = bonusAmount
				}
			default:
				fixedPointTotal += bonusAmount
			}
		} else {
			result.CurrencyBonuses = append(result.CurrencyBonuses, CurrencyBonusItem{
				Currency:     currency,
				Amount:       bonusAmount,
				ExpiresAt:    expiresAt,
				ExpiryAction: expiryAction,
				PromotionID:  promotionID,
			})
		}
	}

	multiplierBonus := 0
	if highestMultiplier > 1 {
		multiplierBonus = basePoints * (highestMultiplier - 1)
	}
	result.PointBonus = multiplierBonus + fixedPointTotal

	return result, nil
}

// GetActiveBonus backward-compatible wrapper (returns just point bonus).
func (s *Service) GetActiveBonus(ctx context.Context, tenantID, productID string) (int, error) {
	r, err := s.CalcBonus(ctx, tenantID, productID, 0)
	if err != nil {
		return 0, err
	}
	return r.PointBonus, nil
}

func isActiveNow(p Promotion) bool {
	now := time.Now()
	return p.Status == "approved" && now.After(p.StartDate) && now.Before(p.EndDate)
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
