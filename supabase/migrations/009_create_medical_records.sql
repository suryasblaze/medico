-- Create medical_records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,

  -- Visit Information
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  visit_type TEXT CHECK (visit_type IN ('consultation', 'follow_up', 'emergency', 'routine_checkup', 'procedure', 'other')),

  -- Vitals
  temperature DECIMAL(4,1), -- in Fahrenheit
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER, -- bpm
  respiratory_rate INTEGER, -- breaths per minute
  oxygen_saturation INTEGER, -- percentage
  weight DECIMAL(5,2), -- in kg
  height DECIMAL(5,2), -- in cm
  bmi DECIMAL(4,2), -- calculated

  -- Clinical Information
  chief_complaint TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  clinical_notes TEXT,

  -- Treatment Plan
  treatment_plan TEXT,
  medications_prescribed TEXT,
  lab_tests_ordered TEXT,

  -- Follow-up
  follow_up_date DATE,
  follow_up_instructions TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own patients' records"
  ON medical_records FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert records for own patients"
  ON medical_records FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own patients' records"
  ON medical_records FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own patients' records"
  ON medical_records FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date DESC);
CREATE INDEX idx_medical_records_patient_visit ON medical_records(patient_id, visit_date DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create patient_intake_forms table (for shareable intake forms)
CREATE TABLE patient_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,

  -- Form Data (submitted by patient)
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- Medical History
  allergies TEXT,
  current_medications TEXT,
  medical_conditions TEXT,
  previous_surgeries TEXT,

  -- Status
  is_processed BOOLEAN DEFAULT false,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL, -- Linked after processing

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE patient_intake_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own intake forms"
  ON patient_intake_forms FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit intake forms"
  ON patient_intake_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Doctors can update own intake forms"
  ON patient_intake_forms FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_intake_forms_doctor_id ON patient_intake_forms(doctor_id);
CREATE INDEX idx_intake_forms_processed ON patient_intake_forms(doctor_id, is_processed);
CREATE INDEX idx_intake_forms_submitted_at ON patient_intake_forms(submitted_at DESC);

-- Add medical history fields to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_number TEXT;

-- Create payments table (for future use)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,

  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'insurance', 'online', 'other')),
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',

  -- Invoice
  invoice_number TEXT UNIQUE,
  description TEXT,

  -- Metadata
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (same pattern as medical_records)
CREATE POLICY "Doctors can view own payments"
  ON payments FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_doctor_id ON payments(doctor_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
