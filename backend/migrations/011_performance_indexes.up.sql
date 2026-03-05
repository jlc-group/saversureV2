-- Performance indexes for frequently queried columns

-- Point ledger lookups (balance calc, history)
CREATE INDEX IF NOT EXISTS idx_point_ledger_user_time ON point_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_ledger_tenant_type ON point_ledger(tenant_id, entry_type);

-- Code scan lookups
CREATE INDEX IF NOT EXISTS idx_codes_tenant_batch_serial ON codes(tenant_id, batch_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_codes_scanned_at ON codes(tenant_id, scanned_at DESC) WHERE scanned_at IS NOT NULL;

-- Batch prefix lookup (critical for QR scan performance)
CREATE INDEX IF NOT EXISTS idx_batches_prefix ON batches(tenant_id, prefix);

-- Reward reservations
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reward_reservations(user_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reward_reservations(tenant_id, status);

-- User missions progress
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_incomplete ON user_missions(user_id) WHERE completed = FALSE;

-- Coupon codes claim
CREATE INDEX IF NOT EXISTS idx_coupon_codes_claim ON coupon_codes(reward_id, tenant_id) WHERE claimed_by IS NULL;

-- Notifications read status
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON notifications(tenant_id, user_id, created_at DESC);

-- Scan history for dashboard
CREATE INDEX IF NOT EXISTS idx_scan_history_tenant ON scan_history(tenant_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_history_user_date ON scan_history(user_id, tenant_id, scanned_at);

-- Leaderboard ranking
CREATE INDEX IF NOT EXISTS idx_leaderboard_ranking ON leaderboard(tenant_id, period, period_key, category, rank);
