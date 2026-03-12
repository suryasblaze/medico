-- Add notes column to medical_records if not exists
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrate existing data: combine clinical_notes into notes if notes is empty
UPDATE medical_records
SET notes = COALESCE(clinical_notes, chief_complaint, '')
WHERE notes IS NULL OR notes = '';
