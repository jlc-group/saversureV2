package support

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

// ── Category definitions (single source of truth) ──

type Category struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// SupportCategories is the canonical list shared by DB CHECK constraint,
// API validation, and public /categories endpoint.
var SupportCategories = []Category{
	{Value: "general", Label: "ทั่วไป"},
	{Value: "points", Label: "เกี่ยวกับแต้มสะสม"},
	{Value: "rewards", Label: "เกี่ยวกับของรางวัล"},
	{Value: "account", Label: "บัญชีผู้ใช้"},
	{Value: "scan", Label: "การสแกน QR"},
	{Value: "other", Label: "อื่นๆ"},
}

type Case struct {
	ID         string  `json:"id"`
	TenantID   string  `json:"tenant_id"`
	UserID     string  `json:"user_id"`
	Subject    string  `json:"subject"`
	Category   string  `json:"category"`
	Status     string  `json:"status"`
	Priority   string  `json:"priority"`
	AssignedTo *string `json:"assigned_to"`
	ResolvedAt *string `json:"resolved_at"`
	CreatedAt  string  `json:"created_at"`
	UserEmail  *string `json:"user_email,omitempty"`
	MsgCount   int     `json:"message_count,omitempty"`
}

type Message struct {
	ID         string  `json:"id"`
	CaseID     string  `json:"case_id"`
	SenderID   string  `json:"sender_id"`
	SenderRole string  `json:"sender_role"`
	Message    string  `json:"message"`
	ImageURL   *string `json:"image_url"`
	CreatedAt  string  `json:"created_at"`
}

type CaseListFilter struct {
	Status   string
	Category string
	Priority string
	Limit    int
	Offset   int
}

type CreateCaseInput struct {
	TenantID string `json:"-"`
	UserID   string `json:"-"`
	Subject  string `json:"subject" binding:"required"`
	Category string `json:"category"`
	Message  string `json:"message" binding:"required"`
	ImageURL string `json:"image_url"`
}

type ReplyInput struct {
	SenderID   string `json:"-"`
	SenderRole string `json:"-"`
	Message    string `json:"message" binding:"required"`
	ImageURL   string `json:"image_url"`
}

type UpdateCaseInput struct {
	Status   *string `json:"status"`
	Priority *string `json:"priority"`
}

func (s *Service) ListCases(ctx context.Context, tenantID string, f CaseListFilter) ([]Case, int64, error) {
	if f.Limit <= 0 {
		f.Limit = 50
	}

	where := "sc.tenant_id = $1"
	args := []any{tenantID}
	argN := 2

	if f.Status != "" {
		where += fmt.Sprintf(" AND sc.status = $%d", argN)
		args = append(args, f.Status)
		argN++
	}
	if f.Category != "" {
		where += fmt.Sprintf(" AND sc.category = $%d", argN)
		args = append(args, f.Category)
		argN++
	}
	if f.Priority != "" {
		where += fmt.Sprintf(" AND sc.priority = $%d", argN)
		args = append(args, f.Priority)
		argN++
	}

	var total int64
	_ = s.db.QueryRow(ctx,
		fmt.Sprintf("SELECT COUNT(*) FROM support_cases sc WHERE %s", where),
		args[:argN-1]...,
	).Scan(&total)

	query := fmt.Sprintf(
		`SELECT sc.id, sc.tenant_id, sc.user_id, sc.subject, sc.category, sc.status, sc.priority,
		        sc.assigned_to, sc.resolved_at::text, sc.created_at::text,
		        u.email,
		        (SELECT COUNT(*) FROM support_messages sm WHERE sm.case_id = sc.id)
		 FROM support_cases sc
		 LEFT JOIN users u ON u.id = sc.user_id
		 WHERE %s ORDER BY sc.created_at DESC LIMIT $%d OFFSET $%d`,
		where, argN, argN+1,
	)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list cases: %w", err)
	}
	defer rows.Close()

	var cases []Case
	for rows.Next() {
		var c Case
		if err := rows.Scan(&c.ID, &c.TenantID, &c.UserID, &c.Subject, &c.Category,
			&c.Status, &c.Priority, &c.AssignedTo, &c.ResolvedAt, &c.CreatedAt,
			&c.UserEmail, &c.MsgCount); err != nil {
			return nil, 0, fmt.Errorf("scan case: %w", err)
		}
		cases = append(cases, c)
	}
	return cases, total, nil
}

func (s *Service) ListUserCases(ctx context.Context, tenantID, userID string) ([]Case, error) {
	rows, err := s.db.Query(ctx,
		`SELECT sc.id, sc.tenant_id, sc.user_id, sc.subject, sc.category, sc.status, sc.priority,
		        sc.assigned_to, sc.resolved_at::text, sc.created_at::text,
		        (SELECT COUNT(*) FROM support_messages sm WHERE sm.case_id = sc.id)
		 FROM support_cases sc
		 WHERE sc.tenant_id = $1 AND sc.user_id = $2
		 ORDER BY sc.created_at DESC LIMIT 50`,
		tenantID, userID,
	)
	if err != nil {
		return nil, fmt.Errorf("list user cases: %w", err)
	}
	defer rows.Close()

	var cases []Case
	for rows.Next() {
		var c Case
		var email *string
		if err := rows.Scan(&c.ID, &c.TenantID, &c.UserID, &c.Subject, &c.Category,
			&c.Status, &c.Priority, &c.AssignedTo, &c.ResolvedAt, &c.CreatedAt,
			&c.MsgCount); err != nil {
			return nil, fmt.Errorf("scan case: %w", err)
		}
		c.UserEmail = email
		cases = append(cases, c)
	}
	return cases, nil
}

func (s *Service) GetCaseWithMessages(ctx context.Context, tenantID, caseID string) (*Case, []Message, error) {
	var c Case
	err := s.db.QueryRow(ctx,
		`SELECT sc.id, sc.tenant_id, sc.user_id, sc.subject, sc.category, sc.status, sc.priority,
		        sc.assigned_to, sc.resolved_at::text, sc.created_at::text, u.email
		 FROM support_cases sc
		 LEFT JOIN users u ON u.id = sc.user_id
		 WHERE sc.id = $1 AND sc.tenant_id = $2`,
		caseID, tenantID,
	).Scan(&c.ID, &c.TenantID, &c.UserID, &c.Subject, &c.Category,
		&c.Status, &c.Priority, &c.AssignedTo, &c.ResolvedAt, &c.CreatedAt, &c.UserEmail)
	if err != nil {
		return nil, nil, fmt.Errorf("case not found: %w", err)
	}

	rows, err := s.db.Query(ctx,
		`SELECT id, case_id, sender_id, sender_role, message, image_url, created_at::text
		 FROM support_messages WHERE case_id = $1 ORDER BY created_at ASC`,
		caseID,
	)
	if err != nil {
		return &c, nil, fmt.Errorf("list messages: %w", err)
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.CaseID, &m.SenderID, &m.SenderRole,
			&m.Message, &m.ImageURL, &m.CreatedAt); err != nil {
			return &c, nil, fmt.Errorf("scan message: %w", err)
		}
		messages = append(messages, m)
	}
	return &c, messages, nil
}

func (s *Service) CreateCase(ctx context.Context, input CreateCaseInput) (*Case, error) {
	if input.Category == "" {
		input.Category = "general"
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var c Case
	err = tx.QueryRow(ctx,
		`INSERT INTO support_cases (tenant_id, user_id, subject, category)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, tenant_id, user_id, subject, category, status, priority, assigned_to, resolved_at::text, created_at::text`,
		input.TenantID, input.UserID, input.Subject, input.Category,
	).Scan(&c.ID, &c.TenantID, &c.UserID, &c.Subject, &c.Category,
		&c.Status, &c.Priority, &c.AssignedTo, &c.ResolvedAt, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create case: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO support_messages (case_id, sender_id, sender_role, message, image_url)
		 VALUES ($1, $2, 'customer', $3, NULLIF($4,''))`,
		c.ID, input.UserID, input.Message, input.ImageURL,
	)
	if err != nil {
		return nil, fmt.Errorf("create first message: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return &c, nil
}

func (s *Service) Reply(ctx context.Context, tenantID, caseID string, input ReplyInput) (*Message, error) {
	var exists bool
	_ = s.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM support_cases WHERE id = $1 AND tenant_id = $2)`,
		caseID, tenantID,
	).Scan(&exists)
	if !exists {
		return nil, fmt.Errorf("case not found")
	}

	var m Message
	err := s.db.QueryRow(ctx,
		`INSERT INTO support_messages (case_id, sender_id, sender_role, message, image_url)
		 VALUES ($1, $2, $3, $4, NULLIF($5,''))
		 RETURNING id, case_id, sender_id, sender_role, message, image_url, created_at::text`,
		caseID, input.SenderID, input.SenderRole, input.Message, input.ImageURL,
	).Scan(&m.ID, &m.CaseID, &m.SenderID, &m.SenderRole, &m.Message, &m.ImageURL, &m.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create reply: %w", err)
	}

	if input.SenderRole == "admin" {
		s.db.Exec(ctx, `UPDATE support_cases SET status = 'in_progress', updated_at = NOW() WHERE id = $1 AND status = 'open'`, caseID)
	}

	return &m, nil
}

func (s *Service) UpdateCase(ctx context.Context, tenantID, caseID string, input UpdateCaseInput) (*Case, error) {
	if input.Status != nil {
		valid := map[string]bool{"open": true, "in_progress": true, "waiting_customer": true, "resolved": true, "closed": true}
		if !valid[*input.Status] {
			return nil, fmt.Errorf("invalid status: %s", *input.Status)
		}
		if *input.Status == "resolved" || *input.Status == "closed" {
			s.db.Exec(ctx, `UPDATE support_cases SET status = $3, resolved_at = NOW(), updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, caseID, tenantID, *input.Status)
		} else {
			s.db.Exec(ctx, `UPDATE support_cases SET status = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, caseID, tenantID, *input.Status)
		}
	}
	if input.Priority != nil {
		valid := map[string]bool{"low": true, "normal": true, "high": true, "urgent": true}
		if !valid[*input.Priority] {
			return nil, fmt.Errorf("invalid priority: %s", *input.Priority)
		}
		s.db.Exec(ctx, `UPDATE support_cases SET priority = $3, updated_at = NOW() WHERE id = $1 AND tenant_id = $2`, caseID, tenantID, *input.Priority)
	}

	var c Case
	err := s.db.QueryRow(ctx,
		`SELECT id, tenant_id, user_id, subject, category, status, priority, assigned_to, resolved_at::text, created_at::text
		 FROM support_cases WHERE id = $1 AND tenant_id = $2`,
		caseID, tenantID,
	).Scan(&c.ID, &c.TenantID, &c.UserID, &c.Subject, &c.Category,
		&c.Status, &c.Priority, &c.AssignedTo, &c.ResolvedAt, &c.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("case not found: %w", err)
	}
	return &c, nil
}
