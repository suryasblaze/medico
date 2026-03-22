-- Allow public read access to doctor info for intake forms
-- This is needed so unauthenticated users can see doctor info on public intake forms

CREATE POLICY "Public can view doctor basic info for intake forms"
  ON doctors FOR SELECT
  USING (true);
