'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2 } from 'lucide-react'

interface IntakeFormClientProps {
  doctorId: string
}

export function IntakeFormClient({ doctorId }: IntakeFormClientProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergies: '',
    current_medications: '',
    medical_conditions: '',
    insurance_provider: '',
    insurance_number: '',
    reason_for_visit: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Directly create patient record (no review needed)
      const { error } = await supabase
        .from('patients')
        .insert({
          doctor_id: doctorId,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          allergies: formData.allergies,
          current_medications: formData.current_medications,
          medical_conditions: formData.medical_conditions,
          insurance_provider: formData.insurance_provider,
          insurance_number: formData.insurance_number,
        })

      if (error) throw error

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
        <p className="text-sm text-muted-foreground">
          You will be contacted to schedule your appointment.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-gray-950 text-sm"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              placeholder="+1 (555) 987-6543"
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Medical History</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any allergies to medications, foods, or other substances"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Textarea
              id="current_medications"
              name="current_medications"
              value={formData.current_medications}
              onChange={handleChange}
              placeholder="List all medications you are currently taking"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Textarea
              id="medical_conditions"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              placeholder="List any chronic conditions or past medical history"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Insurance Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insurance_provider">Insurance Provider</Label>
            <Input
              id="insurance_provider"
              name="insurance_provider"
              value={formData.insurance_provider}
              onChange={handleChange}
              placeholder="Blue Cross, Aetna, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance_number">Insurance Number</Label>
            <Input
              id="insurance_number"
              name="insurance_number"
              value={formData.insurance_number}
              onChange={handleChange}
              placeholder="Policy/Member ID"
            />
          </div>
        </div>
      </div>

      {/* Reason for Visit */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Visit Information</h3>

        <div className="space-y-2">
          <Label htmlFor="reason_for_visit">Reason for Visit *</Label>
          <Textarea
            id="reason_for_visit"
            name="reason_for_visit"
            value={formData.reason_for_visit}
            onChange={handleChange}
            required
            placeholder="Briefly describe the reason for your visit"
            rows={3}
          />
        </div>
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

      <p className="text-xs text-center text-muted-foreground">
        By submitting this form, you consent to the collection and use of this information for medical purposes.
      </p>
    </form>
  )
}
