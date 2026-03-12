-- Add avatar_url to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for patient avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-avatars', 'patient-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for patient-avatars
CREATE POLICY "Anyone can view patient avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'patient-avatars');

CREATE POLICY "Doctors can upload patient avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update patient avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'patient-avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete patient avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'patient-avatars' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM doctors WHERE user_id = auth.uid()
    )
  );
