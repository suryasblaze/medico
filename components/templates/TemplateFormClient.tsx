'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, Search } from 'lucide-react'

interface TemplateFormClientProps {
  doctorId: string
  template: any
}

export function TemplateFormClient({ doctorId, template }: TemplateFormClientProps) {
  const [loading, setLoading] = useState(false)
  const [mrnLoading, setMrnLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showMrnLookup, setShowMrnLookup] = useState(true)
  const [mrn, setMrn] = useState('')
  const [patientInfo, setPatientInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  })
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleMrnLookup = async () => {
    if (!mrn) return

    setMrnLoading(true)
    try {
      const supabase = createClient()

      const { data: patient } = await supabase
        .from('patients')
        .select('full_name, email, phone, date_of_birth')
        .eq('doctor_id', doctorId)
        .eq('medical_record_number', mrn)
        .single()

      if (patient) {
        setPatientInfo({
          full_name: patient.full_name,
          email: patient.email || '',
          phone: patient.phone || '',
          date_of_birth: patient.date_of_birth || '',
        })
        setShowMrnLookup(false)
        alert('Patient found! Your information has been auto-filled.')
      } else {
        alert('No patient found with that MRN. Please enter your information manually.')
      }
    } catch (error) {
      console.error('Error looking up MRN:', error)
      alert('Error looking up MRN. Please enter your information manually.')
    } finally {
      setMrnLoading(false)
    }
  }

  const handlePatientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handleFieldChange = (fieldLabel: string, value: any) => {
    setFormData({
      ...formData,
      [fieldLabel]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Find existing patient by email or MRN
      let query = supabase
        .from('patients')
        .select('id')
        .eq('doctor_id', doctorId)

      if (mrn) {
        query = query.eq('medical_record_number', mrn)
      } else if (patientInfo.email) {
        query = query.eq('email', patientInfo.email)
      }

      const { data: existingPatient } = await query.maybeSingle()

      let patientId = existingPatient?.id

      // If patient doesn't exist, create them
      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            doctor_id: doctorId,
            full_name: patientInfo.full_name,
            email: patientInfo.email,
            phone: patientInfo.phone,
            date_of_birth: patientInfo.date_of_birth,
          })
          .select()
          .single()

        if (patientError) throw patientError
        patientId = newPatient.id
      }

      // Create medical record with template data
      const { error: recordError } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          visit_date: new Date().toISOString(),
          visit_type: 'consultation',
          chief_complaint: template.title,
          clinical_notes: JSON.stringify(formData, null, 2),
        })

      if (recordError) throw recordError

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/20 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Form Submitted Successfully!</h3>
        <p className="text-muted-foreground mb-4">
          Thank you for submitting your information. Your doctor will review it shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* MRN Lookup (for existing patients) */}
      {showMrnLookup && (
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-900">
          <h3 className="text-lg font-semibold">Existing Patient?</h3>
          <p className="text-sm text-muted-foreground">
            If you're already a patient, enter your Medical Record Number (MRN) to auto-fill your information.
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter your MRN (e.g., MRN-123456)"
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleMrnLookup}
              disabled={mrnLoading || !mrn}
              variant="outline"
            >
              {mrnLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Lookup
                </>
              )}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setShowMrnLookup(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            Skip - I'm a new patient
          </button>
        </div>
      )}

      {/* Patient Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Your Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={patientInfo.full_name}
              onChange={handlePatientInfoChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={patientInfo.email}
              onChange={handlePatientInfoChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={patientInfo.phone}
              onChange={handlePatientInfoChange}
              required
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={patientInfo.date_of_birth}
              onChange={handlePatientInfoChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Template Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">{template.title}</h3>

        {template.fields.map((field: any, index: number) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`field-${index}`}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.field_type === 'text' && (
              <Input
                id={`field-${index}`}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
              />
            )}

            {field.field_type === 'textarea' && (
              <Textarea
                id={`field-${index}`}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
              />
            )}

            {field.field_type === 'select' && field.options && (
              <select
                id={`field-${index}`}
                required={field.required}
                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 text-sm"
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
              >
                <option value="">Select an option</option>
                {field.options.map((option: string, i: number) => (
                  <option key={i} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.field_type === 'checkbox' && field.options && (
              <div className="space-y-2">
                {field.options.map((option: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`field-${index}-${i}`}
                      className="h-4 w-4 border-gray-300 rounded"
                      onChange={(e) => {
                        const currentValues = formData[field.label] || []
                        if (e.target.checked) {
                          handleFieldChange(field.label, [...currentValues, option])
                        } else {
                          handleFieldChange(
                            field.label,
                            currentValues.filter((v: string) => v !== option)
                          )
                        }
                      }}
                    />
                    <label htmlFor={`field-${index}-${i}`} className="text-sm">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {field.field_type === 'radio' && field.options && (
              <div className="space-y-2">
                {field.options.map((option: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`field-${index}-${i}`}
                      name={`field-${index}`}
                      value={option}
                      className="h-4 w-4 border-gray-300"
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                    />
                    <label htmlFor={`field-${index}-${i}`} className="text-sm">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {field.field_type === 'date' && (
              <Input
                type="date"
                id={`field-${index}`}
                required={field.required}
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
              />
            )}

            {field.field_type === 'number' && (
              <Input
                type="number"
                id={`field-${index}`}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleFieldChange(field.label, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Form'
          )}
        </Button>
      </div>
    </form>
  )
}
