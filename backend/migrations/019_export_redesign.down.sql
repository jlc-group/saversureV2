DROP TABLE IF EXISTS export_logs;
ALTER TABLE rolls DROP COLUMN IF EXISTS mapping_evidence_urls;
ALTER TABLE rolls DROP COLUMN IF EXISTS mapping_note;
ALTER TABLE factories DROP COLUMN IF EXISTS factory_type;
