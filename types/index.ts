export interface Doctor {
  id: string
  user_id: string
  email: string
  full_name: string
  specialty?: string
  clinic_name?: string
  phone?: string
  avatar_url?: string
  subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired'
  subscription_plan?: 'free' | 'basic' | 'pro' | 'enterprise'
  trial_ends_at?: string
  created_at?: string
  updated_at?: string
}

export interface Patient {
  id: string
  doctor_id: string
  full_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  city?: string
  state?: string
  postal_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_record_number?: string
  notes?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  insurance_provider?: string
  insurance_number?: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  visit_date: string
  visit_type?: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup' | 'procedure' | 'other'
  temperature?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  heart_rate?: number
  respiratory_rate?: number
  oxygen_saturation?: number
  weight?: number
  height?: number
  bmi?: number
  chief_complaint?: string
  symptoms?: string
  diagnosis?: string
  clinical_notes?: string
  treatment_plan?: string
  medications_prescribed?: string
  lab_tests_ordered?: string
  follow_up_date?: string
  follow_up_instructions?: string
  created_at: string
  updated_at: string
}

export interface PatientIntakeForm {
  id: string
  doctor_id: string
  full_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
  previous_surgeries?: string
  is_processed: boolean
  patient_id?: string
  submitted_at: string
  ip_address?: string
  user_agent?: string
}

export interface Payment {
  id: string
  patient_id: string
  doctor_id: string
  medical_record_id?: string
  amount: number
  payment_method: 'cash' | 'card' | 'insurance' | 'online' | 'other'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  invoice_number?: string
  description?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  doctor_id: string
  title: string
  description?: string
  slug: string
  is_active: boolean
  requires_patient_info: boolean
  success_message?: string
  notification_email?: string
  allow_multiple_submissions: boolean
  submission_count: number
  created_at: string
  updated_at: string
}

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'

export interface FormField {
  id: string
  form_id: string
  field_type: FieldType
  label: string
  placeholder?: string
  help_text?: string
  required: boolean
  options?: string[] // For select, radio, checkbox
  validation_rules?: Record<string, any>
  order_index: number
  created_at: string
}

export interface FormSubmission {
  id: string
  form_id: string
  patient_id?: string
  doctor_id: string
  patient_name?: string
  patient_email?: string
  patient_phone?: string
  responses: Record<string, any>
  attachments?: Array<{
    field_id: string
    file_url: string
    file_name: string
    file_size: number
  }>
  ip_address?: string
  user_agent?: string
  submitted_at: string
  viewed_at?: string
  is_read: boolean
}

export interface Subscription {
  id: string
  doctor_id: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  created_at: string
  updated_at: string
}
