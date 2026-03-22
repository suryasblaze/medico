-- Add form_slug column to doctors for short intake form URLs
ALTER TABLE doctors ADD COLUMN form_slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX idx_doctors_form_slug ON doctors(form_slug);

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(input_text),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '[\s]+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing doctors with auto-generated slugs
UPDATE doctors
SET form_slug = CONCAT(
  generate_slug(COALESCE(clinic_name, full_name, 'doctor')),
  '-',
  SUBSTRING(id::TEXT, 1, 4)
)
WHERE form_slug IS NULL;
