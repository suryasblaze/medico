-- Create form_fields table
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'email', 'number', 'phone', 'textarea',
    'select', 'radio', 'checkbox', 'date', 'file'
  )),
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB,
  validation_rules JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_fields
CREATE POLICY "Doctors can view own form fields"
  ON form_fields FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Anyone can view fields for active forms"
  ON form_fields FOR SELECT
  USING (form_id IN (
    SELECT id FROM forms WHERE is_active = true
  ));

CREATE POLICY "Doctors can insert form fields"
  ON form_fields FOR INSERT
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Doctors can update own form fields"
  ON form_fields FOR UPDATE
  USING (form_id IN (
    SELECT id FROM forms WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (form_id IN (
    SELECT id FROM forms WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Doctors can delete own form fields"
  ON form_fields FOR DELETE
  USING (form_id IN (
    SELECT id FROM forms WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  ));

-- Indexes
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_order ON form_fields(form_id, order_index);
