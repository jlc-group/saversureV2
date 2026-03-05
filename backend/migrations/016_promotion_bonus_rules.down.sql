-- Rollback migration 016
ALTER TABLE point_ledger DROP COLUMN IF EXISTS expires_at;
ALTER TABLE point_ledger DROP COLUMN IF EXISTS expiry_action;
ALTER TABLE point_ledger DROP COLUMN IF EXISTS source_promotion_id;
DROP TABLE IF EXISTS promotion_bonus_rules;
