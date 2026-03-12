-- Create storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-documents', 'patient-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for patient-documents
CREATE POLICY "Doctors can view patient documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'patient-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can upload patient documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update patient documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'patient-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete patient documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Create patient_documents table to track uploaded files
CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

  -- Document Information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,

  -- Categorization
  document_type TEXT CHECK (document_type IN (
    'lab_report',
    'prescription',
    'imaging',
    'referral',
    'insurance',
    'consent_form',
    'medical_history',
    'discharge_summary',
    'other'
  )) DEFAULT 'other',

  -- Metadata
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own patients' documents"
  ON patient_documents FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert documents for own patients"
  ON patient_documents FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own patients' documents"
  ON patient_documents FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own patients' documents"
  ON patient_documents FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_patient_documents_patient_id ON patient_documents(patient_id);
CREATE INDEX idx_patient_documents_doctor_id ON patient_documents(doctor_id);
CREATE INDEX idx_patient_documents_medical_record_id ON patient_documents(medical_record_id);
CREATE INDEX idx_patient_documents_document_type ON patient_documents(document_type);
CREATE INDEX idx_patient_documents_uploaded_at ON patient_documents(uploaded_at DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_patient_documents_updated_at
  BEFORE UPDATE ON patient_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
