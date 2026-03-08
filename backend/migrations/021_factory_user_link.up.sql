-- 021: Link factory_user accounts to their factory
ALTER TABLE users ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id) ON DELETE SET NULL;

COMMENT ON COLUMN users.factory_id IS 'For factory_user role: the factory this user belongs to';
