-- Page Builder CMS: page_configs, popups, nav_menus
-- Allows brand admins to manage consumer frontend layout per tenant

CREATE TABLE IF NOT EXISTS page_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    page_slug VARCHAR(50) NOT NULL,
    sections JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    version INT NOT NULL DEFAULT 1,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, page_slug)
);

CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    trigger_type VARCHAR(30) NOT NULL DEFAULT 'on_load',
    target_pages TEXT[] NOT NULL DEFAULT '{}',
    frequency VARCHAR(20) NOT NULL DEFAULT 'every_visit',
    priority INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nav_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    menu_type VARCHAR(30) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, menu_type)
);

CREATE INDEX IF NOT EXISTS idx_page_configs_tenant ON page_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_popups_tenant_status ON popups(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_nav_menus_tenant ON nav_menus(tenant_id);
