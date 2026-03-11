ALTER TABLE rewards
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE rewards
  ADD CONSTRAINT rewards_status_check
  CHECK (status IN ('active', 'inactive', 'draft'));

CREATE INDEX IF NOT EXISTS idx_rewards_status ON rewards (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_rewards_expires ON rewards (expires_at) WHERE expires_at IS NOT NULL;
