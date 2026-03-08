-- 022: Persist coupon code on reward reservations
ALTER TABLE reward_reservations
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_tenant_user_idempotency_unique
ON reward_reservations(tenant_id, user_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;
