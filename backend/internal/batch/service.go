package batch

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	qrhmac "saversure/pkg/hmac"
)

type Service struct {
	db     *pgxpool.Pool
	signer *qrhmac.Signer
}

func NewService(db *pgxpool.Pool, signer *qrhmac.Signer) *Service {
	return &Service{db: db, signer: signer}
}

type Batch struct {
	ID          string `json:"id"`
	TenantID    string `json:"tenant_id"`
	CampaignID  string `json:"campaign_id"`
	Prefix      string `json:"prefix"`
	SerialStart int64  `json:"serial_start"`
	SerialEnd   int64  `json:"serial_end"`
	Status      string `json:"status"`
	CreatedBy   string `json:"created_by"`
	CreatedAt   string `json:"created_at"`
	CodeCount   int64  `json:"code_count"`
}

type CreateInput struct {
	CampaignID  string `json:"campaign_id" binding:"required"`
	Prefix      string `json:"prefix" binding:"required,max=10"`
	SerialStart int64  `json:"serial_start" binding:"required,min=1"`
	SerialEnd   int64  `json:"serial_end" binding:"required,gtfield=SerialStart"`
}

func (s *Service) Create(ctx context.Context, tenantID, userID string, input CreateInput) (*Batch, error) {
	var b Batch
	err := s.db.QueryRow(ctx,
		`INSERT INTO batches (tenant_id, campaign_id, prefix, seed_secret, serial_start, serial_end, status, created_by)
		 VALUES ($1, $2, $3, $4, $5, $6, 'generated', $7)
		 RETURNING id, tenant_id, campaign_id, prefix, serial_start, serial_end, status, created_by, created_at`,
		tenantID, input.CampaignID, input.Prefix, s.signer.Sign(input.Prefix),
		input.SerialStart, input.SerialEnd, userID,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Status, &b.CreatedBy, &b.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create batch: %w", err)
	}
	b.CodeCount = b.SerialEnd - b.SerialStart + 1
	return &b, nil
}

func (s *Service) List(ctx context.Context, tenantID string) ([]Batch, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, campaign_id, prefix, serial_start, serial_end, status, created_by, created_at
		 FROM batches WHERE tenant_id = $1 ORDER BY created_at DESC`, tenantID)
	if err != nil {
		return nil, fmt.Errorf("list batches: %w", err)
	}
	defer rows.Close()

	var batches []Batch
	for rows.Next() {
		var b Batch
		if err := rows.Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
			&b.Status, &b.CreatedBy, &b.CreatedAt); err != nil {
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
		 RETURNING id, tenant_id, campaign_id, prefix, serial_start, serial_end, status, created_by, created_at`,
		id, tenantID, status,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Status, &b.CreatedBy, &b.CreatedAt)
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
		 RETURNING id, tenant_id, campaign_id, prefix, serial_start, serial_end, status, created_by, created_at`,
		id, tenantID,
	).Scan(&b.ID, &b.TenantID, &b.CampaignID, &b.Prefix, &b.SerialStart, &b.SerialEnd,
		&b.Status, &b.CreatedBy, &b.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("recall batch: %w", err)
	}

	// Record in audit trail
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
