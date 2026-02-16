-- Add missing fields to patient_intake_forms table
ALTER TABLE patient_intake_forms
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_number TEXT,
ADD COLUMN IF NOT EXISTS reason_for_visit TEXT;
