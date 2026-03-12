'use client'

import { useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, Phone, Plus, X } from 'lucide-react'

interface IntakeFormClientProps {
  doctorId: string
}

export function IntakeFormClient({ doctorId }: IntakeFormClientProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([''])
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ''])
  }

  const removePhoneNumber = (index: number) => {
    const newPhones = [...phoneNumbers]
    newPhones.splice(index, 1)
    setPhoneNumbers(newPhones.length ? newPhones : [''])
  }

  const updatePhoneNumber = (index: number, value: string) => {
    const newPhones = [...phoneNumbers]
    newPhones[index] = value
    setPhoneNumbers(newPhones)
    setFormData({ ...formData, phone: newPhones[0] || '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      // Directly create patient record
      const { error } = await supabase
        .from('patients')
        .insert({
          doctor_id: doctorId,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          email: formData.email,
          phone: phoneNumbers[0] || formData.phone,
          phone_numbers: phoneNumbers.filter(p => p),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          notes: formData.notes,
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
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-fuchsia-800 dark:text-fuchsia-200">Form Submitted Successfully!</h3>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70 mb-4">
          Thank you for submitting your information. Your dental care provider will review it shortly.
        </p>
        <p className="text-sm text-fuchsia-600/60 dark:text-fuchsia-400/50">
          You will be contacted to schedule your appointment.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Basic Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-fuchsia-700 dark:text-fuchsia-300">
              Full Name <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-fuchsia-700 dark:text-fuchsia-300">
              Date of Birth <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-fuchsia-700 dark:text-fuchsia-300">
              Gender <span className="text-orange-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-fuchsia-700 dark:text-fuchsia-300">
              Email <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Contact Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-fuchsia-700 dark:text-fuchsia-300">
                Phone Numbers <span className="text-orange-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhoneNumber}
                disabled={loading}
                className="border-fuchsia-200 dark:border-fuchsia-800 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-400" />
                    <Input
                      type="tel"
                      placeholder={index === 0 ? 'Primary phone number' : 'Additional phone'}
                      value={phone}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                      disabled={loading}
                      required={index === 0}
                      className="pl-9"
                    />
                  </div>
                  {phoneNumbers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address" className="text-fuchsia-700 dark:text-fuchsia-300">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-fuchsia-700 dark:text-fuchsia-300">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-fuchsia-700 dark:text-fuchsia-300">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-fuchsia-700 dark:text-fuchsia-300">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="ZIP / Postal code"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Emergency Contact
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name" className="text-fuchsia-700 dark:text-fuchsia-300">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone" className="text-fuchsia-700 dark:text-fuchsia-300">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              placeholder="+1 (555) 987-6543"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Additional Notes
        </h3>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-fuchsia-700 dark:text-fuchsia-300">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information you'd like to share"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 shadow-lg shadow-fuchsia-500/25"
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

      <p className="text-xs text-center text-fuchsia-600/60 dark:text-fuchsia-400/50">
        By submitting this form, you consent to the collection and use of this information for dental care purposes.
      </p>
    </form>
  )
}
