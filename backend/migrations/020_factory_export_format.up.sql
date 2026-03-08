-- 020: Add export format settings per factory
ALTER TABLE factories ADD COLUMN IF NOT EXISTS export_format INT NOT NULL DEFAULT 1;
ALTER TABLE factories ADD COLUMN IF NOT EXISTS codes_per_roll INT NOT NULL DEFAULT 10000;
ALTER TABLE factories ADD COLUMN IF NOT EXISTS rolls_per_file INT NOT NULL DEFAULT 4;

COMMENT ON COLUMN factories.export_format IS '1=flat, 2=multi-4col, 3=multi-Ncol(TAVORN), 4=single-col';
COMMENT ON COLUMN factories.codes_per_roll IS 'Number of QR codes per sticker roll';
COMMENT ON COLUMN factories.rolls_per_file IS 'Number of rolls per CSV file';
