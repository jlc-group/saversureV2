-- Version history for page configs (rollback support)
CREATE TABLE IF NOT EXISTS page_config_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_config_id UUID NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    page_slug VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    sections JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_config_history_lookup
    ON page_config_history(tenant_id, page_slug, version DESC);
