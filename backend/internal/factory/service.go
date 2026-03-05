package factory

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

type Factory struct {
	ID           string  `json:"id"`
	TenantID     string  `json:"tenant_id"`
	Name         string  `json:"name"`
	Code         *string `json:"code"`
	ContactName  *string `json:"contact_name"`
	ContactPhone *string `json:"contact_phone"`
	ContactEmail *string `json:"contact_email"`
	Address      *string `json:"address"`
	Status       string  `json:"status"`
	CreatedAt    string  `json:"created_at"`
}

type CreateInput struct {
	TenantID     string `json:"-"`
	Name         string `json:"name" binding:"required"`
	Code         string `json:"code"`
	ContactName  string `json:"contact_name"`
	ContactPhone string `json:"contact_phone"`
	ContactEmail string `json:"contact_email"`
	Address      string `json:"address"`
}

type UpdateInput struct {
	Name         *string `json:"name"`
	Code         *string `json:"code"`
	ContactName  *string `json:"contact_name"`
	ContactPhone *string `json:"contact_phone"`
	ContactEmail *string `json:"contact_email"`
	Address      *string `json:"address"`
	Status       *string `json:"status"`
}

func (s *Service) List(ctx context.Context, tenantID string, limit, offset int) ([]Factory, int64, error) {
	if limit <= 0 {
		limit = 50
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM factories WHERE tenant_id = $1`, tenantID,
	).Scan(&total)

	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, name, code, contact_name, contact_phone, contact_email, address, status, created_at::text
		 FROM factories WHERE tenant_id = $1
		 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		tenantID, limit, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("list factories: %w", err)
	}
	defer rows.Close()

	var factories []Factory
	for rows.Next() {
		var f Factory
		if err := rows.Scan(&f.ID, &f.TenantID, &f.Name, &f.Code, &f.ContactName,
			&f.ContactPhone, &f.ContactEmail, &f.Address, &f.Status, &f.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan factory: %w", err)
		}
		factories = append(factories, f)
	}
	return factories, total, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*Factory, error) {
	var f Factory
	err := s.db.QueryRow(ctx,
		`INSERT INTO factories (tenant_id, name, code, contact_name, contact_phone, contact_email, address)
		 VALUES ($1, $2, NULLIF($3,''), NULLIF($4,''), NULLIF($5,''), NULLIF($6,''), NULLIF($7,''))
		 RETURNING id, tenant_id, name, code, contact_name, contact_phone, contact_email, address, status, created_at::text`,
		input.TenantID, input.Name, input.Code, input.ContactName, input.ContactPhone, input.ContactEmail, input.Address,
	).Scan(&f.ID, &f.TenantID, &f.Name, &f.Code, &f.ContactName,
		&f.ContactPhone, &f.ContactEmail, &f.Address, &f.Status, &f.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create factory: %w", err)
	}
	return &f, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*Factory, error) {
	if input.Name != nil {
		s.db.Exec(ctx, `UPDATE factories SET name = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Name)
	}
	if input.Code != nil {
		s.db.Exec(ctx, `UPDATE factories SET code = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Code)
	}
	if input.ContactName != nil {
		s.db.Exec(ctx, `UPDATE factories SET contact_name = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.ContactName)
	}
	if input.ContactPhone != nil {
		s.db.Exec(ctx, `UPDATE factories SET contact_phone = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.ContactPhone)
	}
	if input.ContactEmail != nil {
		s.db.Exec(ctx, `UPDATE factories SET contact_email = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.ContactEmail)
	}
	if input.Address != nil {
		s.db.Exec(ctx, `UPDATE factories SET address = NULLIF($3,''), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Address)
	}
	if input.Status != nil {
		valid := map[string]bool{"active": true, "inactive": true}
		if !valid[*input.Status] {
			return nil, fmt.Errorf("invalid status: %s", *input.Status)
		}
		s.db.Exec(ctx, `UPDATE factories SET status = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, id, tenantID, *input.Status)
	}

	var f Factory
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, name, code, contact_name, contact_phone, contact_email, address, status, created_at::text
		 FROM factories WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&f.ID, &f.TenantID, &f.Name, &f.Code, &f.ContactName,
		&f.ContactPhone, &f.ContactEmail, &f.Address, &f.Status, &f.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("factory not found: %w", err)
	}
	return &f, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	result, err := s.db.Exec(ctx,
		`DELETE FROM factories WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	)
	if err != nil {
		return fmt.Errorf("delete factory: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("factory not found")
	}
	return nil
}
