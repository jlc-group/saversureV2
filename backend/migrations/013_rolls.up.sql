-- Roll Lifecycle Management
-- Rolls are physical sticker rolls derived from batches.
-- Each roll tracks product mapping, QC approval, and distribution status independently.

ALTER TABLE batches ADD COLUMN IF NOT EXISTS codes_per_roll INT NOT NULL DEFAULT 10000;

CREATE TABLE IF NOT EXISTS rolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    roll_number INT NOT NULL,
    serial_start BIGINT NOT NULL,
    serial_end BIGINT NOT NULL,
    code_count INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_print'
        CHECK (status IN (
            'pending_print','printed','mapped',
            'qc_approved','qc_rejected','distributed','recalled'
        )),
    product_id UUID REFERENCES products(id),
    factory_id UUID REFERENCES factories(id),
    mapped_by UUID REFERENCES users(id),
    mapped_at TIMESTAMPTZ,
    qc_by UUID REFERENCES users(id),
    qc_at TIMESTAMPTZ,
    qc_note TEXT,
    qc_evidence_urls TEXT[] DEFAULT '{}',
    distributed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE (batch_id, roll_number)
);

CREATE INDEX IF NOT EXISTS idx_rolls_tenant_status ON rolls(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_rolls_batch ON rolls(batch_id);
CREATE INDEX IF NOT EXISTS idx_rolls_product ON rolls(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rolls_serial ON rolls(tenant_id, batch_id, serial_start, serial_end);
