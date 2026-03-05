ALTER TABLE reward_reservations DROP COLUMN IF EXISTS tracking_number;
ALTER TABLE reward_reservations DROP COLUMN IF EXISTS updated_at;

ALTER TABLE reward_reservations DROP CONSTRAINT IF EXISTS reward_reservations_status_check;
ALTER TABLE reward_reservations ADD CONSTRAINT reward_reservations_status_check
    CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'));

DROP INDEX IF EXISTS idx_codes_created;
DROP INDEX IF EXISTS idx_codes_scanned_by;
