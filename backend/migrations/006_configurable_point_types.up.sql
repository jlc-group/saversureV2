-- Tenant-configurable point currencies
CREATE TABLE IF NOT EXISTS point_currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) DEFAULT '⭐',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_point_currencies_tenant ON point_currencies(tenant_id);

-- Add currency column to point_ledger (nullable for backward compat, defaults via trigger)
ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS currency VARCHAR(30) NOT NULL DEFAULT 'point';

-- Add point_currency to products: which currency does scanning this product give
ALTER TABLE products ADD COLUMN IF NOT EXISTS point_currency VARCHAR(30) NOT NULL DEFAULT 'point';

-- Add cost_currency to rewards: which currency is needed to redeem
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS cost_currency VARCHAR(30) NOT NULL DEFAULT 'point';
