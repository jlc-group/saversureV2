-- Revert Google auth columns
DROP INDEX IF EXISTS idx_users_google_sub;
ALTER TABLE users DROP COLUMN IF EXISTS google_picture_url;
ALTER TABLE users DROP COLUMN IF EXISTS google_sub;
