-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  requires_patient_info BOOLEAN DEFAULT true,
  success_message TEXT DEFAULT 'Thank you for your submission!',
  notification_email TEXT,
  allow_multiple_submissions BOOLEAN DEFAULT false,
  submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms
CREATE POLICY "Doctors can view own forms"
  ON forms FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active forms by slug"
  ON forms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Doctors can insert forms"
  ON forms FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own forms"
  ON forms FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own forms"
  ON forms FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_forms_doctor_id ON forms(doctor_id);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_is_active ON forms(is_active);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
