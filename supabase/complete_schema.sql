-- Create doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  clinic_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Doctors can view own profile"
  ON doctors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile"
  ON doctors FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can insert own profile"
  ON doctors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_email ON doctors(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create doctor profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.doctors (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Doctor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create doctor profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_record_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Doctors can view own patients"
  ON patients FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert patients"
  ON patients FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own patients"
  ON patients FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own patients"
  ON patients FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_full_name ON patients(full_name);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
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
-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own subscription"
  ON subscriptions FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own subscription"
  ON subscriptions FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_subscriptions_doctor_id ON subscriptions(doctor_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Create storage bucket for form attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-attachments', 'form-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for form-attachments
CREATE POLICY "Doctors can view own attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'form-attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'form-attachments');

CREATE POLICY "Doctors can delete own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'form-attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Doctors can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );
