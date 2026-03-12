-- Add phone_numbers array column to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone_numbers TEXT[];

-- Migrate existing phone to phone_numbers array
UPDATE patients
SET phone_numbers = ARRAY[phone]
WHERE phone IS NOT NULL AND phone != '' AND (phone_numbers IS NULL OR array_length(phone_numbers, 1) IS NULL);
