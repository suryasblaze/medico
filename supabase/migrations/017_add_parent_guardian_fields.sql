-- Add parent/guardian fields for patients under 18
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS parent_guardian_name TEXT,
ADD COLUMN IF NOT EXISTS parent_guardian_phone TEXT;

-- Optional: Remove emergency contact fields if no longer needed
-- Commenting out in case you want to keep them for backwards compatibility
-- ALTER TABLE patients
-- DROP COLUMN IF EXISTS emergency_contact_name,
-- DROP COLUMN IF EXISTS emergency_contact_phone;
