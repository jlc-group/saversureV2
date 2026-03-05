-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),
    description TEXT,
    image_url TEXT,
    points_per_scan INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(tenant_id, sku) WHERE sku IS NOT NULL;

-- Factories table
CREATE TABLE IF NOT EXISTS factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    contact_name VARCHAR(200),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(200),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_factories_tenant ON factories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_factories_code ON factories(tenant_id, code) WHERE code IS NOT NULL;

-- Link batches to products and factories
ALTER TABLE batches ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE batches ADD COLUMN IF NOT EXISTS factory_id UUID REFERENCES factories(id);

CREATE INDEX IF NOT EXISTS idx_batches_product ON batches(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batches_factory ON batches(factory_id) WHERE factory_id IS NOT NULL;
