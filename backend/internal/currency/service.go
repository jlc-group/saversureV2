package currency

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

type Currency struct {
	ID           string  `json:"id"`
	TenantID     string  `json:"tenant_id"`
	Code         string  `json:"code"`
	Name         string  `json:"name"`
	Icon         string  `json:"icon"`
	IsDefault    bool    `json:"is_default"`
	SortOrder    int     `json:"sort_order"`
	Active       bool    `json:"active"`
	ExchangeRate float64 `json:"exchange_rate"`
	CreatedAt    string  `json:"created_at"`
}

type CreateInput struct {
	TenantID     string  `json:"-"`
	Code         string  `json:"code" binding:"required"`
	Name         string  `json:"name" binding:"required"`
	Icon         string  `json:"icon"`
	IsDefault    bool    `json:"is_default"`
	SortOrder    int     `json:"sort_order"`
	ExchangeRate float64 `json:"exchange_rate"`
}

type UpdateInput struct {
	Name         *string  `json:"name"`
	Icon         *string  `json:"icon"`
	IsDefault    *bool    `json:"is_default"`
	SortOrder    *int     `json:"sort_order"`
	Active       *bool    `json:"active"`
	ExchangeRate *float64 `json:"exchange_rate"`
}

type MultiBalance struct {
	Currency string `json:"currency"`
	Name     string `json:"name"`
	Icon     string `json:"icon"`
	Balance  int    `json:"balance"`
	Earned   int    `json:"earned"`
	Spent    int    `json:"spent"`
}

type ConvertResult struct {
	UsersAffected  int     `json:"users_affected"`
	TotalConverted int     `json:"total_converted"`
	PointsCredited int     `json:"points_credited"`
	ExchangeRate   float64 `json:"exchange_rate"`
}

const selectCols = `id, tenant_id, code, name, icon, is_default, sort_order, active,
	exchange_rate, created_at::text`

func scanCurrency(scan func(dest ...any) error) (Currency, error) {
	var c Currency
	err := scan(&c.ID, &c.TenantID, &c.Code, &c.Name, &c.Icon,
		&c.IsDefault, &c.SortOrder, &c.Active,
		&c.ExchangeRate, &c.CreatedAt)
	return c, err
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Currency, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+selectCols+` FROM point_currencies WHERE tenant_id = $1 ORDER BY sort_order, code`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list currencies: %w", err)
	}
	defer rows.Close()

	var items []Currency
	for rows.Next() {
		c, err := scanCurrency(rows.Scan)
		if err != nil {
			return nil, fmt.Errorf("scan currency: %w", err)
		}
		items = append(items, c)
	}
	return items, nil
}

func (s *Service) ListActive(ctx context.Context, tenantID string) ([]Currency, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+selectCols+` FROM point_currencies WHERE tenant_id = $1 AND active = true ORDER BY sort_order, code`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("list active currencies: %w", err)
	}
	defer rows.Close()

	var items []Currency
	for rows.Next() {
		c, err := scanCurrency(rows.Scan)
		if err != nil {
			return nil, fmt.Errorf("scan currency: %w", err)
		}
		items = append(items, c)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Currency, error) {
	input.Code = strings.ToLower(strings.TrimSpace(input.Code))
	if input.Icon == "" {
		input.Icon = "⭐"
	}
	if input.ExchangeRate <= 0 {
		input.ExchangeRate = 1.0
	}

	if input.IsDefault {
		_, _ = s.db.Exec(ctx,
			"UPDATE point_currencies SET is_default = FALSE WHERE tenant_id = $1",
			input.TenantID,
		)
	}

	c, err := scanCurrency(s.db.QueryRow(ctx,
		`INSERT INTO point_currencies (tenant_id, code, name, icon, is_default, sort_order, exchange_rate)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING `+selectCols,
		input.TenantID, input.Code, input.Name, input.Icon, input.IsDefault, input.SortOrder,
		input.ExchangeRate,
	).Scan)
	if err != nil {
		return nil, fmt.Errorf("create currency: %w", err)
	}
	return &c, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Currency, error) {
	if input.IsDefault != nil && *input.IsDefault {
		_, _ = s.db.Exec(ctx,
			"UPDATE point_currencies SET is_default = FALSE WHERE tenant_id = $1",
			tenantID,
		)
	}

	_, err := s.db.Exec(ctx,
		`UPDATE point_currencies SET
			name = COALESCE($3, name),
			icon = COALESCE($4, icon),
			is_default = COALESCE($5, is_default),
			sort_order = COALESCE($6, sort_order),
			active = COALESCE($7, active),
			exchange_rate = COALESCE($8, exchange_rate)
		 WHERE id = $1 AND tenant_id = $2`,
		id, tenantID, input.Name, input.Icon, input.IsDefault, input.SortOrder,
		input.Active, input.ExchangeRate,
	)
	if err != nil {
		return nil, fmt.Errorf("update currency: %w", err)
	}

	c, err := scanCurrency(s.db.QueryRow(ctx,
		`SELECT `+selectCols+` FROM point_currencies WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan)
	if err != nil {
		return nil, fmt.Errorf("currency not found: %w", err)
	}
	return &c, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	var isDefault bool
	_ = s.db.QueryRow(ctx, "SELECT is_default FROM point_currencies WHERE id = $1 AND tenant_id = $2", id, tenantID).Scan(&isDefault)
	if isDefault {
		return fmt.Errorf("cannot delete default currency")
	}
	_, err := s.db.Exec(ctx, "DELETE FROM point_currencies WHERE id = $1 AND tenant_id = $2", id, tenantID)
	return err
}

func (s *Service) GetMultiBalance(ctx context.Context, tenantID, userID string) ([]MultiBalance, error) {
	rows, err := s.db.Query(ctx,
		`SELECT
			LOWER(pl.currency),
			COALESCE(pc.name, LOWER(pl.currency)),
			COALESCE(pc.icon, '⭐'),
			COALESCE(SUM(CASE WHEN pl.entry_type = 'credit' THEN pl.amount ELSE 0 END), 0) AS earned,
			COALESCE(SUM(CASE WHEN pl.entry_type = 'debit' THEN pl.amount ELSE 0 END), 0) AS spent,
			COALESCE(SUM(CASE WHEN pl.entry_type = 'credit' THEN pl.amount ELSE -pl.amount END), 0) AS balance
		 FROM point_ledger pl
		 LEFT JOIN point_currencies pc ON pc.tenant_id = pl.tenant_id AND LOWER(pc.code) = LOWER(pl.currency)
		 WHERE pl.tenant_id = $1 AND pl.user_id = $2
		 GROUP BY LOWER(pl.currency), pc.name, pc.icon, pc.sort_order
		 ORDER BY COALESCE(pc.sort_order, 999)`,
		tenantID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("multi balance: %w", err)
	}
	defer rows.Close()

	var items []MultiBalance
	for rows.Next() {
		var b MultiBalance
		if err := rows.Scan(&b.Currency, &b.Name, &b.Icon, &b.Earned, &b.Spent, &b.Balance); err != nil {
			return nil, fmt.Errorf("scan balance: %w", err)
		}
		items = append(items, b)
	}
	return items, nil
}

// ConvertCurrency manually converts all balances of a given currency to 'point' for all users.
func (s *Service) ConvertCurrency(ctx context.Context, tenantID, currencyCode string) (*ConvertResult, error) {
	if currencyCode == "point" {
		return nil, fmt.Errorf("cannot convert the default point currency")
	}

	var exchangeRate float64
	err := s.db.QueryRow(ctx,
		`SELECT exchange_rate FROM point_currencies WHERE tenant_id = $1 AND code = $2`,
		tenantID, currencyCode,
	).Scan(&exchangeRate)
	if err != nil {
		return nil, fmt.Errorf("currency not found: %w", err)
	}
	if exchangeRate <= 0 {
		return nil, fmt.Errorf("exchange rate must be positive")
	}

	rows, err := s.db.Query(ctx,
		`SELECT user_id,
			COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) AS balance
		 FROM point_ledger
		 WHERE tenant_id = $1 AND currency = $2
		 GROUP BY user_id
		 HAVING COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE -amount END), 0) > 0`,
		tenantID, currencyCode,
	)
	if err != nil {
		return nil, fmt.Errorf("query balances: %w", err)
	}
	defer rows.Close()

	type userBalance struct {
		userID  string
		balance int
	}
	var users []userBalance
	for rows.Next() {
		var ub userBalance
		if err := rows.Scan(&ub.userID, &ub.balance); err != nil {
			continue
		}
		users = append(users, ub)
	}

	if len(users) == 0 {
		return &ConvertResult{ExchangeRate: exchangeRate}, nil
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var totalConverted, totalPoints int
	for _, u := range users {
		pointsToCredit := int(float64(u.balance) * exchangeRate)
		if pointsToCredit <= 0 {
			continue
		}

		_, err := tx.Exec(ctx,
			`INSERT INTO point_ledger (tenant_id, user_id, entry_type, amount, balance_after, reference_type, description, currency)
			 VALUES ($1, $2, 'debit', $3,
				COALESCE((SELECT balance_after FROM point_ledger WHERE tenant_id = $1 AND user_id = $2 AND currency = $4 ORDER BY created_at DESC LIMIT 1), 0) - $3,
				'conversion', $5, $4)`,
			tenantID, u.userID, u.balance, currencyCode,
			fmt.Sprintf("Converted %d %s to %d point (rate: %.2f)", u.balance, currencyCode, pointsToCredit, exchangeRate),
		)
		if err != nil {
			return nil, fmt.Errorf("debit %s for user %s: %w", currencyCode, u.userID, err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO point_ledger (tenant_id, user_id, entry_type, amount, balance_after, reference_type, description, currency)
			 VALUES ($1, $2, 'credit', $3,
				COALESCE((SELECT balance_after FROM point_ledger WHERE tenant_id = $1 AND user_id = $2 AND currency = 'point' ORDER BY created_at DESC LIMIT 1), 0) + $3,
				'conversion', $4, 'point')`,
			tenantID, u.userID, pointsToCredit,
			fmt.Sprintf("Converted from %d %s (rate: %.2f)", u.balance, currencyCode, exchangeRate),
		)
		if err != nil {
			return nil, fmt.Errorf("credit point for user %s: %w", u.userID, err)
		}

		totalConverted += u.balance
		totalPoints += pointsToCredit
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return &ConvertResult{
		UsersAffected:  len(users),
		TotalConverted: totalConverted,
		PointsCredited: totalPoints,
		ExchangeRate:   exchangeRate,
	}, nil
}
