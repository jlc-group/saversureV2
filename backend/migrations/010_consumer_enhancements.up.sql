-- Consumer profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS line_picture_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_line ON users(line_user_id) WHERE line_user_id IS NOT NULL;

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    label VARCHAR(50) NOT NULL DEFAULT 'home',
    recipient_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    district VARCHAR(100),
    sub_district VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Coupon code pool for rewards
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    code VARCHAR(100) NOT NULL,
    claimed_by UUID REFERENCES users(id),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(reward_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_reward ON coupon_codes(reward_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_unclaimed ON coupon_codes(reward_id) WHERE claimed_by IS NULL;

-- Scan history (for quota, geo, analytics)
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    code_id UUID REFERENCES codes(id),
    campaign_id UUID REFERENCES campaigns(id),
    batch_id UUID REFERENCES batches(id),
    points_earned INT NOT NULL DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    province VARCHAR(100),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scan_history_tenant ON scan_history(tenant_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_date ON scan_history(user_id, tenant_id, scanned_at);

-- Reward enhancements (delivery type)
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(30) NOT NULL DEFAULT 'none'
    CHECK (delivery_type IN ('none', 'shipping', 'pickup', 'digital', 'coupon'));
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Redeem reservation address (reward_reservations)
ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES user_addresses(id);
ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_note TEXT;

-- Scan daily quota per user
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scan_quota_per_day INT NOT NULL DEFAULT 20;

-- Product points (configurable points per product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS points_per_scan INT NOT NULL DEFAULT 1;
