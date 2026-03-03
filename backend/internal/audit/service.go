package audit

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

type Entry struct {
	ID         string  `json:"id"`
	TenantID   string  `json:"tenant_id"`
	ActorID    *string `json:"actor_id"`
	Action     string  `json:"action"`
	EntityType string  `json:"entity_type"`
	EntityID   *string `json:"entity_id"`
	OldValue   *string `json:"old_value,omitempty"`
	NewValue   *string `json:"new_value,omitempty"`
	IPAddress  *string `json:"ip_address"`
	CreatedAt  string  `json:"created_at"`
}

// Record appends an audit entry. This table is append-only (no UPDATE/DELETE).
func (s *Service) Record(ctx context.Context, tenantID, actorID, action, entityType, entityID string, oldValue, newValue any, ipAddress string) error {
	oldJSON, _ := json.Marshal(oldValue)
	newJSON, _ := json.Marshal(newValue)

	_, err := s.db.Exec(ctx,
		`INSERT INTO audit_trail (tenant_id, actor_id, action, entity_type, entity_id, old_value, new_value, ip_address)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		tenantID, actorID, action, entityType, entityID, string(oldJSON), string(newJSON), ipAddress,
	)
	if err != nil {
		return fmt.Errorf("record audit: %w", err)
	}
	return nil
}

func (s *Service) List(ctx context.Context, tenantID string, limit, offset int) ([]Entry, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := s.db.Query(ctx,
		`SELECT id, tenant_id, actor_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at
		 FROM audit_trail WHERE tenant_id = $1
		 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		tenantID, limit, offset,
	)
	if err != nil {
		return nil, fmt.Errorf("list audit: %w", err)
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.TenantID, &e.ActorID, &e.Action, &e.EntityType, &e.EntityID,
			&e.OldValue, &e.NewValue, &e.IPAddress, &e.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan audit: %w", err)
		}
		entries = append(entries, e)
	}
	return entries, nil
}
