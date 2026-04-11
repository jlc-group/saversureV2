ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_verify_method;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_status;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_product_image_url;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_product_sku;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_product_name;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_product_v1_id;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_qr_code_serial;
ALTER TABLE scan_history DROP COLUMN IF EXISTS legacy_qr_code_id;
