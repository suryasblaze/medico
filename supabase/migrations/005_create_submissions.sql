-- Create form_submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL,

  -- Patient info (if not linked to patient record)
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,

  -- Form response data
  responses JSONB NOT NULL,

  -- File attachments
  attachments JSONB,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_submissions
CREATE POLICY "Doctors can view own submissions"
  ON form_submissions FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit to active forms"
  ON form_submissions FOR INSERT
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE is_active = true
  ));

CREATE POLICY "Doctors can update own submissions"
  ON form_submissions FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_submissions_doctor_id ON form_submissions(doctor_id);
CREATE INDEX idx_submissions_patient_id ON form_submissions(patient_id);
CREATE INDEX idx_submissions_submitted_at ON form_submissions(submitted_at DESC);
CREATE INDEX idx_submissions_is_read ON form_submissions(doctor_id, is_read);

-- Function to set doctor_id on submission (denormalization)
CREATE OR REPLACE FUNCTION set_submission_doctor_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.doctor_id := (SELECT doctor_id FROM forms WHERE id = NEW.form_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_doctor_id_on_submission
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_submission_doctor_id();

-- Function to increment form submission count
CREATE OR REPLACE FUNCTION increment_form_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forms
  SET submission_count = submission_count + 1
  WHERE id = NEW.form_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_submission_count_trigger
  AFTER INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION increment_form_submission_count();
