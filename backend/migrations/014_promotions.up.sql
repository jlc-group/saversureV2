-- Promotional Bonus: time-limited bonus points for specific products
-- Replaces V1's extra_points / diamond_point period mechanism

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    bonus_points INT NOT NULL DEFAULT 0,
    bonus_type VARCHAR(20) NOT NULL DEFAULT 'fixed'
        CHECK (bonus_type IN ('fixed', 'multiplier')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    apply_to VARCHAR(20) NOT NULL DEFAULT 'selected'
        CHECK (apply_to IN ('all_products', 'selected')),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS promotion_products (
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (promotion_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_promotions_tenant_active ON promotions(tenant_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotion_products_product ON promotion_products(product_id);
