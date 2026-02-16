'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Heart, Thermometer, Weight } from 'lucide-react'

interface MedicalRecordFormProps {
  patientId: string
  doctorId: string
  onSuccess?: () => void
}

export function MedicalRecordForm({ patientId, doctorId, onSuccess }: MedicalRecordFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    visit_type: 'consultation',
    // Vitals
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    height: '',
    // Clinical
    chief_complaint: '',
    symptoms: '',
    diagnosis: '',
    clinical_notes: '',
    treatment_plan: '',
    medications_prescribed: '',
    lab_tests_ordered: '',
    follow_up_date: '',
    follow_up_instructions: '',
  })

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    if (weight && height) {
      const heightInMeters = height / 100
      return (weight / (heightInMeters * heightInMeters)).toFixed(2)
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const bmi = calculateBMI()

      const recordData = {
        patient_id: patientId,
        doctor_id: doctorId,
        visit_date: formData.visit_date,
        visit_type: formData.visit_type,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate) : null,
        oxygen_saturation: formData.oxygen_saturation ? parseInt(formData.oxygen_saturation) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        chief_complaint: formData.chief_complaint || null,
        symptoms: formData.symptoms || null,
        diagnosis: formData.diagnosis || null,
        clinical_notes: formData.clinical_notes || null,
        treatment_plan: formData.treatment_plan || null,
        medications_prescribed: formData.medications_prescribed || null,
        lab_tests_ordered: formData.lab_tests_ordered || null,
        follow_up_date: formData.follow_up_date || null,
        follow_up_instructions: formData.follow_up_instructions || null,
      }

      const { error: insertError } = await supabase
        .from('medical_records')
        .insert(recordData)

      if (insertError) throw insertError

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
        router.push(`/patients/${patientId}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save medical record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Visit Information */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Information</CardTitle>
          <CardDescription>Basic visit details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date *</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_type">Visit Type *</Label>
              <Select value={formData.visit_type} onValueChange={(value) => setFormData({ ...formData, visit_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Vital Signs
          </CardTitle>
          <CardDescription>Patient vital measurements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature (°F)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="98.6"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heart_rate" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Heart Rate (bpm)
              </Label>
              <Input
                id="heart_rate"
                type="number"
                placeholder="72"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygen_saturation">O₂ Saturation (%)</Label>
              <Input
                id="oxygen_saturation"
                type="number"
                placeholder="98"
                value={formData.oxygen_saturation}
                onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="blood_pressure_systolic">BP Systolic</Label>
              <Input
                id="blood_pressure_systolic"
                type="number"
                placeholder="120"
                value={formData.blood_pressure_systolic}
                onChange={(e) => setFormData({ ...formData, blood_pressure_systolic: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_pressure_diastolic">BP Diastolic</Label>
              <Input
                id="blood_pressure_diastolic"
                type="number"
                placeholder="80"
                value={formData.blood_pressure_diastolic}
                onChange={(e) => setFormData({ ...formData, blood_pressure_diastolic: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
              <Input
                id="respiratory_rate"
                type="number"
                placeholder="16"
                value={formData.respiratory_rate}
                onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="175"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>BMI</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
                {calculateBMI() || '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Assessment</CardTitle>
          <CardDescription>Diagnosis and treatment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chief_complaint">Chief Complaint *</Label>
            <Textarea
              id="chief_complaint"
              placeholder="Main reason for visit..."
              rows={2}
              value={formData.chief_complaint}
              onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              placeholder="Patient reported symptoms..."
              rows={3}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              placeholder="Clinical diagnosis..."
              rows={3}
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinical_notes">Clinical Notes</Label>
            <Textarea
              id="clinical_notes"
              placeholder="Additional clinical observations..."
              rows={4}
              value={formData.clinical_notes}
              onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Treatment */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Plan</CardTitle>
          <CardDescription>Medications and procedures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="treatment_plan">Treatment Plan</Label>
            <Textarea
              id="treatment_plan"
              placeholder="Recommended treatment approach..."
              rows={3}
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications_prescribed">Medications Prescribed</Label>
            <Textarea
              id="medications_prescribed"
              placeholder="List medications with dosage..."
              rows={3}
              value={formData.medications_prescribed}
              onChange={(e) => setFormData({ ...formData, medications_prescribed: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lab_tests_ordered">Lab Tests Ordered</Label>
            <Textarea
              id="lab_tests_ordered"
              placeholder="Laboratory tests and investigations..."
              rows={2}
              value={formData.lab_tests_ordered}
              onChange={(e) => setFormData({ ...formData, lab_tests_ordered: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up</CardTitle>
          <CardDescription>Next visit and instructions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input
              id="follow_up_date"
              type="date"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_instructions">Follow-up Instructions</Label>
            <Textarea
              id="follow_up_instructions"
              placeholder="Post-visit care instructions..."
              rows={3}
              value={formData.follow_up_instructions}
              onChange={(e) => setFormData({ ...formData, follow_up_instructions: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Medical Record'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
