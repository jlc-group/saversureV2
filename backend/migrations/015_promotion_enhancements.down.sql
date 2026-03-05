-- Revert promotions status back
UPDATE promotions SET status = 'active' WHERE status = 'approved';

ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_status_check;
ALTER TABLE promotions ADD CONSTRAINT promotions_status_check
  CHECK (status IN ('active', 'inactive'));
ALTER TABLE promotions ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE promotions
  DROP COLUMN IF EXISTS rejection_note,
  DROP COLUMN IF EXISTS approved_at,
  DROP COLUMN IF EXISTS approved_by,
  DROP COLUMN IF EXISTS bonus_currency_amount,
  DROP COLUMN IF EXISTS bonus_currency;

ALTER TABLE point_currencies DROP CONSTRAINT IF EXISTS chk_expiry_action;
ALTER TABLE point_currencies
  DROP COLUMN IF EXISTS expiry_action,
  DROP COLUMN IF EXISTS expires_at,
  DROP COLUMN IF EXISTS exchange_rate;
