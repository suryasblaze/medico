import { z } from 'zod'

export const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  phone_numbers: z.array(z.string()).optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  parent_guardian_name: z.string().optional(),
  parent_guardian_phone: z.string().optional(),
  medical_record_number: z.string().optional(),
  notes: z.string().optional(),
})

export type PatientFormData = z.infer<typeof patientSchema>
