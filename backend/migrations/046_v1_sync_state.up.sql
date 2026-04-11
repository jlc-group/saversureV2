CREATE TABLE IF NOT EXISTS v1_sync_state (
    entity_type     VARCHAR(50) PRIMARY KEY,
    last_synced_id  BIGINT NOT NULL DEFAULT 0,
    last_run_at     TIMESTAMPTZ,
    last_run_status VARCHAR(20) DEFAULT 'idle',
    rows_synced     BIGINT DEFAULT 0,
    total_synced    BIGINT DEFAULT 0,
    error_message   TEXT,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO v1_sync_state (entity_type) VALUES ('user'), ('scan_history')
ON CONFLICT DO NOTHING;
