import { z } from 'zod'

export const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  is_active: z.boolean().default(true),
  requires_patient_info: z.boolean().default(true),
  success_message: z.string().optional(),
  notification_email: z.string().email('Invalid email').optional().or(z.literal('')),
  allow_multiple_submissions: z.boolean().default(false),
})

export type FormFormData = z.infer<typeof formSchema>

export const formFieldSchema = z.object({
  field_type: z.enum([
    'text',
    'email',
    'number',
    'phone',
    'textarea',
    'select',
    'radio',
    'checkbox',
    'date',
    'file',
  ]),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation_rules: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  order_index: z.number(),
})

export type FormFieldData = z.infer<typeof formFieldSchema>
