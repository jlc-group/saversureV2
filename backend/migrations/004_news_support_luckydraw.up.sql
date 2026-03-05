-- News & Banners
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(300) NOT NULL,
    content TEXT,
    image_url TEXT,
    link_url TEXT,
    position INT NOT NULL DEFAULT 0,
    type VARCHAR(30) NOT NULL DEFAULT 'news' CHECK (type IN ('news', 'banner')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_news_tenant ON news(tenant_id);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(tenant_id, status, type);
CREATE INDEX IF NOT EXISTS idx_news_position ON news(tenant_id, position) WHERE status = 'published';

-- Support Cases & Messages
CREATE TABLE IF NOT EXISTS support_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(300) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'scan', 'reward', 'account', 'other')),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_cases_tenant ON support_cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_cases_user ON support_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_support_cases_status ON support_cases(tenant_id, status);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    sender_role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (sender_role IN ('customer', 'admin')),
    message TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_case ON support_messages(case_id, created_at);

-- Lucky Draw
CREATE TABLE IF NOT EXISTS lucky_draw_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    image_url TEXT,
    cost_points INT NOT NULL DEFAULT 0,
    max_tickets_per_user INT NOT NULL DEFAULT 1,
    total_tickets INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'drawing', 'announced', 'ended')),
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,
    draw_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lucky_draw_tenant ON lucky_draw_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lucky_draw_status ON lucky_draw_campaigns(tenant_id, status);

CREATE TABLE IF NOT EXISTS lucky_draw_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES lucky_draw_campaigns(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    quantity INT NOT NULL DEFAULT 1,
    prize_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lucky_draw_prizes_campaign ON lucky_draw_prizes(campaign_id);

CREATE TABLE IF NOT EXISTS lucky_draw_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES lucky_draw_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    ticket_number VARCHAR(20) NOT NULL,
    points_spent INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, ticket_number)
);

CREATE INDEX IF NOT EXISTS idx_lucky_draw_tickets_campaign ON lucky_draw_tickets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_lucky_draw_tickets_user ON lucky_draw_tickets(campaign_id, user_id);

CREATE TABLE IF NOT EXISTS lucky_draw_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES lucky_draw_campaigns(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES lucky_draw_prizes(id),
    ticket_id UUID NOT NULL REFERENCES lucky_draw_tickets(id),
    user_id UUID NOT NULL REFERENCES users(id),
    announced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lucky_draw_winners_campaign ON lucky_draw_winners(campaign_id);
