import {
  Type,
  Mail,
  Hash,
  Phone,
  AlignLeft,
  List,
  CircleDot,
  CheckSquare,
  Calendar,
  Upload,
} from 'lucide-react'
import type { FieldType } from '@/types'

export interface FieldTypeDefinition {
  type: FieldType
  label: string
  icon: any
  description: string
  defaultPlaceholder: string
  supportsOptions: boolean
  supportsValidation: boolean
}

export const FIELD_TYPES: FieldTypeDefinition[] = [
  {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    description: 'Single line text input',
    defaultPlaceholder: 'Enter text...',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input with validation',
    defaultPlaceholder: 'your@email.com',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input field',
    defaultPlaceholder: 'Enter number...',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'phone',
    label: 'Phone Number',
    icon: Phone,
    description: 'Phone number input',
    defaultPlaceholder: '+1 (555) 000-0000',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: AlignLeft,
    description: 'Multi-line text input',
    defaultPlaceholder: 'Enter detailed text...',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: List,
    description: 'Select from dropdown list',
    defaultPlaceholder: 'Select an option...',
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: 'radio',
    label: 'Radio Buttons',
    icon: CircleDot,
    description: 'Single choice from multiple options',
    defaultPlaceholder: '',
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckSquare,
    description: 'Multiple choice selection',
    defaultPlaceholder: '',
    supportsOptions: true,
    supportsValidation: false,
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    description: 'Date selection input',
    defaultPlaceholder: 'Select date...',
    supportsOptions: false,
    supportsValidation: true,
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    description: 'File attachment field',
    defaultPlaceholder: 'Upload file...',
    supportsOptions: false,
    supportsValidation: true,
  },
]

export const getFieldTypeDefinition = (type: FieldType): FieldTypeDefinition => {
  return FIELD_TYPES.find((ft) => ft.type === type) || FIELD_TYPES[0]
}
