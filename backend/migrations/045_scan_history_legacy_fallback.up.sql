ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_qr_code_id BIGINT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_qr_code_serial TEXT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_product_v1_id BIGINT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_product_name TEXT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_product_sku TEXT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_product_image_url TEXT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_status SMALLINT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS legacy_verify_method SMALLINT;
