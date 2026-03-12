-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,

  -- Expense details
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Categorization (free text, no constraint)
  category TEXT,

  -- Date tracking
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can view own expenses"
  ON expenses FOR SELECT
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update own expenses"
  ON expenses FOR UPDATE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ))
  WITH CHECK (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can delete own expenses"
  ON expenses FOR DELETE
  USING (doctor_id IN (
    SELECT id FROM doctors WHERE user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_expenses_doctor_id ON expenses(doctor_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
