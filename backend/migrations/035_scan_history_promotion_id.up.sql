ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id);
