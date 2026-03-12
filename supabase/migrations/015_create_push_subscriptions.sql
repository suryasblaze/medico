-- Store push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Doctors can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()));

-- Index
CREATE INDEX idx_push_subscriptions_doctor_id ON push_subscriptions(doctor_id);
