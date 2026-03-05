-- Part 1: point_currencies lifecycle fields
ALTER TABLE point_currencies
  ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10,2) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expiry_action VARCHAR(20) NOT NULL DEFAULT 'keep';

-- Add CHECK constraint for expiry_action (separate statement for IF NOT EXISTS compat)
DO $$ BEGIN
  ALTER TABLE point_currencies ADD CONSTRAINT chk_expiry_action
    CHECK (expiry_action IN ('keep', 'convert', 'expire'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Part 2: promotions — bonus currency fields
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS bonus_currency VARCHAR(30),
  ADD COLUMN IF NOT EXISTS bonus_currency_amount INT NOT NULL DEFAULT 0;

-- Part 3: promotions — approval workflow fields
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_note TEXT;

-- Update status CHECK to include approval states
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_status_check;
ALTER TABLE promotions ADD CONSTRAINT promotions_status_check
  CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'active', 'inactive'));

-- Change default status from 'active' to 'draft'
ALTER TABLE promotions ALTER COLUMN status SET DEFAULT 'draft';

-- Migrate existing 'active' promotions to 'approved' so they keep working
UPDATE promotions SET status = 'approved' WHERE status = 'active';
