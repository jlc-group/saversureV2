ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS bonus_currency VARCHAR(50);
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS bonus_currency_amount INTEGER DEFAULT 0;
