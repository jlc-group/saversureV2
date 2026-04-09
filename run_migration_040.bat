@echo off
cd /d c:\saversureV2
echo Running migration 040 on saversure-postgres...
docker exec -i saversure-postgres psql -U saversure_app -d saversure -c "ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(30); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(200); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS recipient_phone VARCHAR(20); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT; ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT; ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_district VARCHAR(100); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_sub_district VARCHAR(100); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_province VARCHAR(100); ALTER TABLE reward_reservations ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(10);"
echo EXIT CODE: %ERRORLEVEL%
echo AGENT_SCRIPT_DONE
