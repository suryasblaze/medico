-- Additional indexes for dashboard performance optimization
-- These indexes will speed up the count queries on the dashboard

-- Composite index for patients count queries by doctor_id
-- This is already covered by idx_patients_doctor_id but adding a covering index
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id_created_at
  ON patients(doctor_id, created_at DESC);

-- Composite index for forms count queries by doctor_id
CREATE INDEX IF NOT EXISTS idx_forms_doctor_id_created_at
  ON forms(doctor_id, created_at DESC);

-- Composite index for form_submissions count queries by doctor_id
-- Already have idx_submissions_doctor_id but this adds ordering
CREATE INDEX IF NOT EXISTS idx_submissions_doctor_id_submitted_at
  ON form_submissions(doctor_id, submitted_at DESC);

-- Add index for unread submissions (commonly queried)
CREATE INDEX IF NOT EXISTS idx_submissions_doctor_unread
  ON form_submissions(doctor_id)
  WHERE is_read = false;

-- Analyze tables to update statistics for query planner
ANALYZE doctors;
ANALYZE patients;
ANALYZE forms;
ANALYZE form_submissions;
