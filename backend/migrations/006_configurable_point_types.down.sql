ALTER TABLE rewards DROP COLUMN IF EXISTS cost_currency;
ALTER TABLE products DROP COLUMN IF EXISTS point_currency;
ALTER TABLE point_ledger DROP COLUMN IF EXISTS currency;
DROP TABLE IF EXISTS point_currencies;
