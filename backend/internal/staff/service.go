package staff

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type StaffUser struct {
	ID        string  `json:"id"`
	TenantID  string  `json:"tenant_id"`
	Email     *string `json:"email"`
	Phone     *string `json:"phone"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Role      string  `json:"role"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
}

type CreateInput struct {
	TenantID  string `json:"-"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role" binding:"required"`
}

type UpdateInput struct {
	Role   *string `json:"role"`
	Status *string `json:"status"`
}

var validStaffRoles = map[string]bool{
	"brand_admin": true, "brand_staff": true, "factory_user": true, "viewer": true,
}

func (s *Service) List(ctx context.Context, tenantID string, limit, offset int) ([]StaffUser, int64, error) {
	if limit <= 0 {
		limit = 50
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND role != 'customer'`,
		tenantID,
	).Scan(&total)

	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, email, phone, first_name, last_name, role, status, created_at::text
		 FROM users
		 WHERE tenant_id = $1 AND role != 'customer'
		 ORDER BY created_at DESC
		 LIMIT $2 OFFSET $3`,
		tenantID, limit, offset,
	)
	if err != nil {
		return nil, 0, fmt.Errorf("list staff: %w", err)
	}
	defer rows.Close()

	var staff []StaffUser
	for rows.Next() {
		var u StaffUser
		if err := rows.Scan(&u.ID, &u.TenantID, &u.Email, &u.Phone, &u.FirstName, &u.LastName,
			&u.Role, &u.Status, &u.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("scan staff: %w", err)
		}
		staff = append(staff, u)
	}
	return staff, total, nil
}

func (s *Service) Create(ctx context.Context, input CreateInput) (*StaffUser, error) {
	if !validStaffRoles[input.Role] {
		return nil, fmt.Errorf("invalid role: %s (allowed: brand_admin, brand_staff, factory_user, viewer)", input.Role)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	var u StaffUser
	err = s.db.QueryRow(ctx,
		`INSERT INTO users (tenant_id, email, password_hash, first_name, last_name, role, status)
		 VALUES ($1, $2, $3, $4, $5, $6, 'active')
		 RETURNING id, tenant_id, email, phone, first_name, last_name, role, status, created_at::text`,
		input.TenantID, input.Email, string(hash), input.FirstName, input.LastName, input.Role,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Phone, &u.FirstName, &u.LastName,
		&u.Role, &u.Status, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create staff: %w", err)
	}
	return &u, nil
}

func (s *Service) Update(ctx context.Context, tenantID, id string, input UpdateInput) (*StaffUser, error) {
	if input.Role != nil {
		if !validStaffRoles[*input.Role] {
			return nil, fmt.Errorf("invalid role: %s", *input.Role)
		}
		_, err := s.db.Exec(ctx,
			`UPDATE users SET role = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 AND role != 'super_admin'`,
			id, tenantID, *input.Role,
		)
		if err != nil {
			return nil, fmt.Errorf("update role: %w", err)
		}
	}

	if input.Status != nil {
		validStatuses := map[string]bool{"active": true, "suspended": true}
		if !validStatuses[*input.Status] {
			return nil, fmt.Errorf("invalid status: %s", *input.Status)
		}
		_, err := s.db.Exec(ctx,
			`UPDATE users SET status = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2 AND role != 'super_admin'`,
			id, tenantID, *input.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("update status: %w", err)
		}
	}

	var u StaffUser
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, email, phone, first_name, last_name, role, status, created_at::text
		 FROM users WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Phone, &u.FirstName, &u.LastName,
		&u.Role, &u.Status, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("staff not found: %w", err)
	}
	return &u, nil
}

func (s *Service) Delete(ctx context.Context, tenantID, id string) error {
	result, err := s.db.Exec(ctx,
		`DELETE FROM users WHERE id = $1 AND tenant_id = $2 AND role != 'super_admin'`,
		id, tenantID,
	)
	if err != nil {
		return fmt.Errorf("delete staff: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("staff not found or cannot delete super_admin")
	}
	return nil
}
