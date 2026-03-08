DROP INDEX IF EXISTS idx_reservations_tenant_user_idempotency_unique;

ALTER TABLE reward_reservations
DROP COLUMN IF EXISTS coupon_code;
