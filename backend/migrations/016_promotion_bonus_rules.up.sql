-- Migration 016: Promotion Bonus Rules + Ledger Expiry
--
-- BEFORE: bonus_points/bonus_type/bonus_currency on promotions table (single rule per promotion)
-- AFTER:  promotion_bonus_rules table (multiple rules per promotion, per product)
--         point_ledger tracks expiry per entry (not per currency)

-- 1. Create promotion_bonus_rules (replaces promotion_products)
CREATE TABLE IF NOT EXISTS promotion_bonus_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    currency VARCHAR(30) NOT NULL DEFAULT 'point',
    bonus_type VARCHAR(20) NOT NULL DEFAULT 'fixed'
        CHECK (bonus_type IN ('fixed', 'multiplier')),
    bonus_amount INT NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ,
    expiry_action VARCHAR(20) DEFAULT 'keep'
        CHECK (expiry_action IN ('keep', 'convert', 'expire')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_rules_promotion ON promotion_bonus_rules(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promo_rules_product ON promotion_bonus_rules(product_id);

-- 2. Add expiry tracking columns to point_ledger
ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS expiry_action VARCHAR(20) DEFAULT 'keep';
ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS source_promotion_id UUID;

CREATE INDEX IF NOT EXISTS idx_ledger_expires ON point_ledger(expires_at)
    WHERE expires_at IS NOT NULL;

-- 3. Migrate existing promotion_products → bonus_rules (if any data exists)
INSERT INTO promotion_bonus_rules (promotion_id, product_id, currency, bonus_type, bonus_amount)
SELECT pp.promotion_id, pp.product_id,
    'point', COALESCE(p.bonus_type, 'fixed'), COALESCE(p.bonus_points, 1)
FROM promotion_products pp
JOIN promotions p ON p.id = pp.promotion_id
WHERE NOT EXISTS (
    SELECT 1 FROM promotion_bonus_rules pbr
    WHERE pbr.promotion_id = pp.promotion_id AND pbr.product_id = pp.product_id AND pbr.currency = 'point'
);

-- For all_products promotions: rule with NULL product_id
INSERT INTO promotion_bonus_rules (promotion_id, product_id, currency, bonus_type, bonus_amount)
SELECT p.id, NULL, 'point', COALESCE(p.bonus_type, 'fixed'), COALESCE(p.bonus_points, 1)
FROM promotions p
WHERE p.apply_to = 'all_products'
AND NOT EXISTS (
    SELECT 1 FROM promotion_bonus_rules pbr
    WHERE pbr.promotion_id = p.id AND pbr.product_id IS NULL AND pbr.currency = 'point'
);

-- Migrate bonus_currency entries
INSERT INTO promotion_bonus_rules (promotion_id, product_id, currency, bonus_type, bonus_amount)
SELECT pp.promotion_id, pp.product_id,
    p.bonus_currency, 'fixed', p.bonus_currency_amount
FROM promotion_products pp
JOIN promotions p ON p.id = pp.promotion_id
WHERE p.bonus_currency IS NOT NULL AND p.bonus_currency != '' AND p.bonus_currency_amount > 0
AND NOT EXISTS (
    SELECT 1 FROM promotion_bonus_rules pbr
    WHERE pbr.promotion_id = pp.promotion_id AND pbr.product_id = pp.product_id AND pbr.currency = p.bonus_currency
);
