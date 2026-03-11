package pageconfig

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type VersionEntry struct {
	Version   int       `json:"version"`
	Sections  []Section `json:"sections"`
	Status    string    `json:"status"`
	UpdatedBy *string   `json:"updated_by"`
	UpdatedAt string    `json:"updated_at"`
}

type HistoryService struct {
	db *pgxpool.Pool
}

func NewHistoryService(db *pgxpool.Pool) *HistoryService {
	return &HistoryService{db: db}
}

func (h *HistoryService) SaveSnapshot(ctx context.Context, pc *PageConfig) error {
	sectionsJSON, err := json.Marshal(pc.Sections)
	if err != nil {
		return fmt.Errorf("marshal snapshot sections: %w", err)
	}

	_, err = h.db.Exec(ctx,
		`INSERT INTO page_config_history (page_config_id, tenant_id, page_slug, version, sections, status, updated_by)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		pc.ID, pc.TenantID, pc.PageSlug, pc.Version, sectionsJSON, pc.Status, pc.UpdatedBy)
	if err != nil {
		return fmt.Errorf("save snapshot: %w", err)
	}
	return nil
}

func (h *HistoryService) ListVersions(ctx context.Context, tenantID, pageSlug string) ([]VersionEntry, error) {
	rows, err := h.db.Query(ctx,
		`SELECT version, sections, status, updated_by, updated_at::text
		 FROM page_config_history
		 WHERE tenant_id = $1 AND page_slug = $2
		 ORDER BY version DESC LIMIT 50`, tenantID, pageSlug)
	if err != nil {
		return nil, fmt.Errorf("list versions: %w", err)
	}
	defer rows.Close()

	var versions []VersionEntry
	for rows.Next() {
		var v VersionEntry
		var sectionsJSON []byte
		if err := rows.Scan(&v.Version, &sectionsJSON, &v.Status, &v.UpdatedBy, &v.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan version: %w", err)
		}
		if err := json.Unmarshal(sectionsJSON, &v.Sections); err != nil {
			v.Sections = []Section{}
		}
		versions = append(versions, v)
	}
	return versions, nil
}

func (h *HistoryService) GetVersion(ctx context.Context, tenantID, pageSlug string, version int) (*VersionEntry, error) {
	var v VersionEntry
	var sectionsJSON []byte
	err := h.db.QueryRow(ctx,
		`SELECT version, sections, status, updated_by, updated_at::text
		 FROM page_config_history
		 WHERE tenant_id = $1 AND page_slug = $2 AND version = $3`,
		tenantID, pageSlug, version,
	).Scan(&v.Version, &sectionsJSON, &v.Status, &v.UpdatedBy, &v.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("version not found: %w", err)
	}
	if err := json.Unmarshal(sectionsJSON, &v.Sections); err != nil {
		v.Sections = []Section{}
	}
	return &v, nil
}
