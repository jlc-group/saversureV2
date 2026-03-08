-- 019: Export Redesign — factory_type, export_logs, roll mapping evidence

-- 1. Add factory_type to factories
ALTER TABLE factories ADD COLUMN IF NOT EXISTS factory_type VARCHAR(20) NOT NULL DEFAULT 'general';

-- 2. Add mapping evidence columns to rolls
ALTER TABLE rolls ADD COLUMN IF NOT EXISTS mapping_evidence_urls TEXT[];
ALTER TABLE rolls ADD COLUMN IF NOT EXISTS mapping_note TEXT;

-- 3. Create export_logs table
CREATE TABLE IF NOT EXISTS export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    roll_ids UUID[] NOT NULL,
    roll_numbers INT[] NOT NULL,
    serial_range_start BIGINT NOT NULL,
    serial_range_end BIGINT NOT NULL,
    total_codes BIGINT NOT NULL,
    format VARCHAR(10) NOT NULL DEFAULT 'zip',
    file_url TEXT,
    file_size BIGINT,
    download_token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    download_count INT NOT NULL DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    factory_id UUID REFERENCES factories(id),
    exported_by UUID NOT NULL,
    exported_by_name VARCHAR(100),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_logs_tenant ON export_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_batch ON export_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_export_logs_token ON export_logs(download_token);
CREATE INDEX IF NOT EXISTS idx_export_logs_factory ON export_logs(factory_id);
