-- Run this in Supabase SQL Editor to create your doctor profile
-- Replace 'your-email@example.com' with your actual login email

-- First, check if doctor profile exists
SELECT
  u.id as user_id,
  u.email,
  d.id as doctor_id,
  d.full_name
FROM auth.users u
LEFT JOIN public.doctors d ON d.user_id = u.id
WHERE u.email = 'your-email@example.com';

-- If the above shows NULL for doctor_id, run this to create the profile:
INSERT INTO public.doctors (user_id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Doctor') as full_name
FROM auth.users
WHERE email = 'your-email@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.doctors WHERE user_id = auth.users.id
  );

-- Verify it was created
SELECT * FROM public.doctors WHERE email = 'your-email@example.com';
