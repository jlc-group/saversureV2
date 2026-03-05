-- V1 migration: add fields from Saversure V1 users
-- province, occupation → demographic data for analytics/segmentation
-- customer_flag → business ops risk/status (green, yellow, black, gray)
-- v1_user_id → cross-reference back to V1

ALTER TABLE users ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_flag VARCHAR(20) NOT NULL DEFAULT 'green';
ALTER TABLE users ADD COLUMN IF NOT EXISTS v1_user_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_users_province ON users(province) WHERE province IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_flag ON users(customer_flag);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_v1_id ON users(v1_user_id) WHERE v1_user_id IS NOT NULL;
