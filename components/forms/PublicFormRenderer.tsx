'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Form, FormField } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadFormFiles } from '@/lib/utils/storage'
import { Loader2 } from 'lucide-react'

interface PublicFormRendererProps {
  form: Form
  fields: FormField[]
}

export function PublicFormRenderer({ form, fields }: PublicFormRendererProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [responses, setResponses] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      for (const field of fields) {
        if (field.required && !responses[field.id] && !files[field.id]) {
          throw new Error(`${field.label} is required`)
        }
      }

      // Validate patient info if required
      if (form.requires_patient_info) {
        if (!patientInfo.name || !patientInfo.email || !patientInfo.phone) {
          throw new Error('Please fill in your contact information')
        }
      }

      const supabase = createClient()

      // Create submission ID first
      const submissionId = crypto.randomUUID()

      // Upload files if any
      let attachments: Array<{
        field_id: string
        file_url: string
        file_name: string
        file_size: number
      }> = []
      if (Object.keys(files).length > 0) {
        const filesToUpload = Object.entries(files).map(([fieldId, file]) => ({
          fieldId,
          file,
        }))

        attachments = await uploadFormFiles(
          form.doctor_id,
          form.id,
          submissionId,
          filesToUpload
        )
      }

      // Submit form
      const { error: submitError } = await supabase
        .from('form_submissions')
        .insert({
          id: submissionId,
          form_id: form.id,
          patient_name: form.requires_patient_info ? patientInfo.name : null,
          patient_email: form.requires_patient_info ? patientInfo.email : null,
          patient_phone: form.requires_patient_info ? patientInfo.phone : null,
          responses,
          attachments: attachments.length > 0 ? attachments : null,
          ip_address: null, // Could be captured server-side
          user_agent: navigator.userAgent,
        })

      if (submitError) throw submitError

      // Redirect to success page
      router.push(`/forms/${form.slug}/success`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = responses[field.id] || ''

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.field_type}
            value={value}
            onChange={(e) =>
              setResponses({ ...responses, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              setResponses({ ...responses, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || ''}
            min={field.validation_rules?.min}
            max={field.validation_rules?.max}
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) =>
              setResponses({ ...responses, [field.id]: e.target.value })
            }
            placeholder={field.placeholder || ''}
            rows={4}
            required={field.required}
          />
        )

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) =>
              setResponses({ ...responses, [field.id]: val })
            }
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) =>
                    setResponses({ ...responses, [field.id]: e.target.value })
                  }
                  required={field.required}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'checkbox':
        const checkedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`${field.id}-${index}`}
                  value={option}
                  checked={checkedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...checkedValues, option]
                      : checkedValues.filter((v) => v !== option)
                    setResponses({ ...responses, [field.id]: newValues })
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) =>
              setResponses({ ...responses, [field.id]: e.target.value })
            }
            required={field.required}
          />
        )

      case 'file':
        return (
          <div>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setFiles({ ...files, [field.id]: file })
                }
              }}
              required={field.required}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Accepted: Images, PDF (Max 10MB)
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Information */}
      {form.requires_patient_info && (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient_name"
                value={patientInfo.name}
                onChange={(e) =>
                  setPatientInfo({ ...patientInfo, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient_email"
                type="email"
                value={patientInfo.email}
                onChange={(e) =>
                  setPatientInfo({ ...patientInfo, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient_phone"
                type="tel"
                value={patientInfo.phone}
                onChange={(e) =>
                  setPatientInfo({ ...patientInfo, phone: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
              </Label>
              {field.help_text && (
                <p className="text-sm text-muted-foreground">{field.help_text}</p>
              )}
              {renderField(field)}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Form'
        )}
      </Button>
    </form>
  )
}
