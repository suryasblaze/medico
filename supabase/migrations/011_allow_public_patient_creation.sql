-- Allow anyone to create patients (for intake forms)
-- This is safe because they can only create, not view/update/delete
CREATE POLICY "Anyone can create patients via intake forms"
  ON patients FOR INSERT
  WITH CHECK (true);
