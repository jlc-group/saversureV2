CREATE TABLE IF NOT EXISTS surveys (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL,
    title          TEXT NOT NULL,
    questions      JSONB NOT NULL DEFAULT '[]'::jsonb,
    trigger_event  TEXT,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_tenant_active
    ON surveys (tenant_id, active, created_at DESC);

CREATE TABLE IF NOT EXISTS survey_responses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id    UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL,
    tenant_id    UUID NOT NULL,
    answers      JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating       INT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey
    ON survey_responses (survey_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_survey_responses_survey_user
    ON survey_responses (survey_id, user_id);

CREATE TABLE IF NOT EXISTS referral_codes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    user_id          UUID NOT NULL,
    code             TEXT NOT NULL UNIQUE,
    uses             INT NOT NULL DEFAULT 0,
    max_uses         INT,
    reward_referrer  INT NOT NULL DEFAULT 0,
    reward_referee   INT NOT NULL DEFAULT 0,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_tenant_user
    ON referral_codes (tenant_id, user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id      UUID NOT NULL,
    referral_code  TEXT NOT NULL,
    referrer_id    UUID NOT NULL,
    referee_id     UUID NOT NULL,
    points_given   INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_history_referrer
    ON referral_history (tenant_id, referrer_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_history_referee
    ON referral_history (tenant_id, referee_id);
