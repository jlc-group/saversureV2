-- Reward tiers per tenant (Bronze, Silver, Gold etc.)
CREATE TABLE IF NOT EXISTS reward_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(100) NOT NULL,
    min_points INT NOT NULL DEFAULT 0,
    icon VARCHAR(10) DEFAULT '🥉',
    color VARCHAR(20) DEFAULT '#CD7F32',
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_reward_tiers_tenant ON reward_tiers(tenant_id);

-- Add tier requirement to rewards
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES reward_tiers(id);

-- Flash reward scheduling
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS is_flash BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS flash_start TIMESTAMPTZ;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS flash_end TIMESTAMPTZ;

-- Add branding settings for tenant self-service
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS branding JSONB NOT NULL DEFAULT '{}';
