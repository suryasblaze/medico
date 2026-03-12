-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- Appointment details
  title TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  notes TEXT,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own appointments"
  ON appointments FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own appointments"
  ON appointments FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own appointments"
  ON appointments FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
