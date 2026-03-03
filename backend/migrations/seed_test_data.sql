-- Seed: Create test tenant
INSERT INTO tenants (id, name, slug, settings, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Brand', 'demo', '{"points_per_scan": 10}'::jsonb, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Create super admin user (password: Admin123!)
-- bcrypt hash of "Admin123!" generated with cost 10
INSERT INTO users (id, tenant_id, email, phone, password_hash, display_name, status)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'admin@saversure.com',
    '0800000000',
    '$2a$10$5SJ15pukGoMIEiTtt3cnAegwz86BRde9JSq0XSM02IcDXTpP2g3fG',
    'Super Admin',
    'active'
)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Seed: Assign super_admin role
INSERT INTO user_roles (user_id, tenant_id, role)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'super_admin'
)
ON CONFLICT (user_id, tenant_id) DO NOTHING;

-- Seed: PDPA consent
INSERT INTO pdpa_consents (user_id, consent_type, ip_address)
VALUES ('00000000-0000-0000-0000-000000000002', 'registration', '127.0.0.1');

-- Seed: Create a test campaign
INSERT INTO campaigns (id, tenant_id, name, description, type, status, settings, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Summer Loyalty 2026',
    'Scan QR codes on products to earn points and redeem rewards',
    'loyalty',
    'active',
    '{"points_per_scan": 10}'::jsonb,
    '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT DO NOTHING;

-- Seed: Create a test batch
INSERT INTO batches (id, tenant_id, campaign_id, prefix, seed_secret, serial_start, serial_end, status, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'SV2026',
    'test-seed-secret',
    1,
    10000,
    'distributed',
    '00000000-0000-0000-0000-000000000002'
)
ON CONFLICT DO NOTHING;

-- Seed: Create test rewards
INSERT INTO rewards (id, tenant_id, campaign_id, name, description, type, point_cost)
VALUES
    ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Free Coffee', 'One free coffee at any branch', 'coupon', 50),
    ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'FAN MEET Ticket', 'Exclusive fan meet event ticket', 'ticket', 500)
ON CONFLICT DO NOTHING;

-- Seed: Create inventory for rewards
INSERT INTO reward_inventory (reward_id, total_qty, reserved_qty, sold_qty)
VALUES
    ('00000000-0000-0000-0000-000000000005', 1000, 0, 0),
    ('00000000-0000-0000-0000-000000000006', 50, 0, 0)
ON CONFLICT DO NOTHING;
