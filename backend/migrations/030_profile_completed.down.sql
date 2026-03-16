-- Revert profile_completed migration
DROP INDEX IF EXISTS idx_users_tenant_phone_unique;
ALTER TABLE users DROP COLUMN IF EXISTS profile_completed;
