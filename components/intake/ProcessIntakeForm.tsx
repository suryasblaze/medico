'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

interface ProcessIntakeFormProps {
  intakeForm: any
  doctorId: string
}

export function ProcessIntakeForm({ intakeForm, doctorId }: ProcessIntakeFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleProcess = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      // Create a new patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .insert({
          doctor_id: doctorId,
          full_name: intakeForm.full_name,
          date_of_birth: intakeForm.date_of_birth,
          gender: intakeForm.gender,
          email: intakeForm.email,
          phone: intakeForm.phone,
          address: intakeForm.address,
          emergency_contact_name: intakeForm.emergency_contact_name,
          emergency_contact_phone: intakeForm.emergency_contact_phone,
          allergies: intakeForm.allergies,
          current_medications: intakeForm.current_medications,
          medical_conditions: intakeForm.medical_conditions,
          insurance_provider: intakeForm.insurance_provider,
          insurance_number: intakeForm.insurance_number,
        })
        .select()
        .single()

      if (patientError) throw patientError

      // Update the intake form to mark it as processed
      const { error: updateError } = await supabase
        .from('patient_intake_forms')
        .update({
          is_processed: true,
          patient_id: patient.id,
        })
        .eq('id', intakeForm.id)

      if (updateError) throw updateError

      // Redirect to the new patient record
      router.push(`/patients/${patient.id}`)
    } catch (error) {
      console.error('Error processing intake form:', error)
      alert('Failed to process intake form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>A new patient record will be created with all the information above</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>The intake form will be marked as processed</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>You can add medical records and visit notes after creating the patient</span>
          </li>
        </ul>
      </div>

      <Button
        onClick={handleProcess}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Create Patient Record
          </>
        )}
      </Button>
    </div>
  )
}
