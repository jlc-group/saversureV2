-- Saversure V2 - Initial Schema
-- All tables use gen_random_uuid() from pgcrypto extension

-- ============================================================
-- IDENTITY & TENANT
-- ============================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE (tenant_id, email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'brand_admin', 'brand_staff', 'factory_user', 'api_client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, tenant_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);

CREATE TABLE pdpa_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(45)
);

CREATE INDEX idx_pdpa_user ON pdpa_consents(user_id);

-- ============================================================
-- CAMPAIGN & REWARD
-- ============================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    terms_conditions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
    settings JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(tenant_id, status);

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    point_cost INT NOT NULL CHECK (point_cost > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX idx_rewards_tenant ON rewards(tenant_id);
CREATE INDEX idx_rewards_campaign ON rewards(campaign_id);

CREATE TABLE reward_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL UNIQUE REFERENCES rewards(id),
    total_qty INT NOT NULL CHECK (total_qty >= 0),
    reserved_qty INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
    sold_qty INT NOT NULL DEFAULT 0 CHECK (sold_qty >= 0),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT inventory_balance CHECK (reserved_qty + sold_qty <= total_qty)
);

CREATE INDEX idx_inventory_reward ON reward_inventory(reward_id);

-- ============================================================
-- BATCH & CODE
-- ============================================================

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    prefix VARCHAR(10) NOT NULL,
    seed_secret VARCHAR(255) NOT NULL,
    serial_start BIGINT NOT NULL,
    serial_end BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'generated'
        CHECK (status IN ('generated', 'printed', 'distributed', 'recalled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT serial_range CHECK (serial_end >= serial_start)
);

CREATE INDEX idx_batches_tenant ON batches(tenant_id);
CREATE INDEX idx_batches_prefix ON batches(tenant_id, prefix);

-- Codes are created on-scan, NOT pre-generated
CREATE TABLE codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    batch_id UUID NOT NULL REFERENCES batches(id),
    serial_number BIGINT NOT NULL,
    ref1 VARCHAR(100),
    ref2 VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'scanned' CHECK (status IN ('scanned', 'redeemed', 'expired')),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scanned_by UUID REFERENCES users(id),
    UNIQUE (tenant_id, batch_id, serial_number)
);

CREATE INDEX idx_codes_tenant_batch ON codes(tenant_id, batch_id);
CREATE INDEX idx_codes_scanned_by ON codes(scanned_by);

-- ============================================================
-- REDEMPTION & POINTS
-- ============================================================

CREATE TABLE reward_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    reward_id UUID NOT NULL REFERENCES rewards(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
    idempotency_key VARCHAR(100),
    expires_at TIMESTAMPTZ NOT NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_user ON reward_reservations(user_id);
CREATE INDEX idx_reservations_reward ON reward_reservations(reward_id);
CREATE INDEX idx_reservations_tenant ON reward_reservations(tenant_id);
CREATE INDEX idx_reservations_status ON reward_reservations(status) WHERE status = 'PENDING';
CREATE INDEX idx_reservations_idempotency ON reward_reservations(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Immutable point ledger: append-only, no UPDATE/DELETE allowed
CREATE TABLE point_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('credit', 'debit', 'reversal', 'expiry')),
    amount INT NOT NULL CHECK (amount > 0),
    balance_after INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_user ON point_ledger(tenant_id, user_id);
CREATE INDEX idx_ledger_created ON point_ledger(tenant_id, user_id, created_at DESC);
CREATE INDEX idx_ledger_campaign ON point_ledger(campaign_id);

-- Prevent UPDATE/DELETE on point_ledger (immutability rule)
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'point_ledger is immutable: UPDATE and DELETE are not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_no_update
    BEFORE UPDATE OR DELETE ON point_ledger
    FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- ============================================================
-- SYSTEM
-- ============================================================

-- Audit trail: append-only
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_trail(tenant_id);
CREATE INDEX idx_audit_created ON audit_trail(tenant_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_trail(entity_type, entity_id);

-- Prevent UPDATE/DELETE on audit_trail
CREATE TRIGGER trg_audit_no_update
    BEFORE UPDATE OR DELETE ON audit_trail
    FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- Idempotency keys
CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    endpoint VARCHAR(255),
    response_code INT,
    response_body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE (key, tenant_id)
);

CREATE INDEX idx_idempotency_key ON idempotency_keys(key, tenant_id);
CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
