-- ref2 running number: tenant-level counter + batch-level range
-- เริ่มจาก 200000000000 เพื่อแยกจาก V1 (1xxx...)

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ref2_next BIGINT NOT NULL DEFAULT 200000000000;

ALTER TABLE batches ADD COLUMN IF NOT EXISTS ref2_start BIGINT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS ref2_end   BIGINT;

CREATE INDEX IF NOT EXISTS idx_batches_ref2_range ON batches (tenant_id, ref2_start, ref2_end)
    WHERE ref2_start IS NOT NULL;
