-- Reverse migration: drop all tables in dependency order

DROP TRIGGER IF EXISTS trg_audit_no_update ON audit_trail;
DROP TRIGGER IF EXISTS trg_ledger_no_update ON point_ledger;
DROP FUNCTION IF EXISTS prevent_ledger_modification();

DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS audit_trail;
DROP TABLE IF EXISTS point_ledger;
DROP TABLE IF EXISTS reward_reservations;
DROP TABLE IF EXISTS codes;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS reward_inventory;
DROP TABLE IF EXISTS rewards;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS pdpa_consents;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;
