-- Allow LINE Login users who don't have email or password
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Update unique constraint to allow multiple NULL emails
DROP INDEX IF EXISTS users_tenant_id_email_key;
CREATE UNIQUE INDEX users_tenant_id_email_key ON users (tenant_id, email) WHERE email IS NOT NULL;
