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
