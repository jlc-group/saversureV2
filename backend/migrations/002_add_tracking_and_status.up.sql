-- Add tracking_number to reward_reservations
ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Expand status constraint to include shipping statuses
ALTER TABLE reward_reservations DROP CONSTRAINT IF EXISTS reward_reservations_status_check;
ALTER TABLE reward_reservations ADD CONSTRAINT reward_reservations_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'SHIPPED', 'COMPLETED', 'EXPIRED', 'CANCELLED'));

-- Add status column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Indexes for customer search
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_tenant_status ON users(tenant_id, status);

-- Scans table for scan history (if not already using codes table)
-- codes table already has what we need, just add indexes
CREATE INDEX IF NOT EXISTS idx_codes_created ON codes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_codes_scanned_by ON codes(scanned_by) WHERE scanned_by IS NOT NULL;
