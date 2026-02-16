-- Add performance indexes for faster queries

-- Patients table indexes
CREATE INDEX IF NOT EXISTS idx_patients_doctor_created ON patients(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING gin(to_tsvector('english', full_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')));

-- Medical records composite indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_date ON medical_records(doctor_id, visit_date DESC);

-- Optimize RLS policy queries
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

-- Add materialized view for dashboard stats (optional, for very large datasets)
-- This can be refreshed periodically instead of calculating on every page load
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  d.id as doctor_id,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT mr.id) as total_visits,
  COUNT(DISTINCT CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN p.id END) as patients_last_30_days,
  COUNT(DISTINCT CASE WHEN mr.visit_date >= CURRENT_DATE - INTERVAL '30 days' THEN mr.id END) as visits_last_30_days
FROM doctors d
LEFT JOIN patients p ON p.doctor_id = d.id
LEFT JOIN medical_records mr ON mr.doctor_id = d.id
GROUP BY d.id;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_doctor ON dashboard_stats(doctor_id);

-- Function to refresh stats (call this periodically, e.g., every hour)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Analyze tables for better query planning
ANALYZE patients;
ANALYZE medical_records;
ANALYZE doctors;
