DROP INDEX IF EXISTS idx_rewards_expires;
DROP INDEX IF EXISTS idx_rewards_status;
ALTER TABLE rewards DROP CONSTRAINT IF EXISTS rewards_status_check;
ALTER TABLE rewards DROP COLUMN IF EXISTS expires_at;
ALTER TABLE rewards DROP COLUMN IF EXISTS status;
