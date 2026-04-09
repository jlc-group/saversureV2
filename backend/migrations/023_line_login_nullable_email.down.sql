-- Revert LINE Login nullable email changes
DROP INDEX IF EXISTS users_tenant_id_email_key;
CREATE UNIQUE INDEX users_tenant_id_email_key ON users (tenant_id, email);

ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
