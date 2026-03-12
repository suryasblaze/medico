'use client'

import { useState } from 'react'
import { Patient, MedicalRecord, PatientDocument } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientForm } from './PatientForm'
import { PatientViewDetails } from './PatientViewDetails'
import { PatientDocuments } from './PatientDocuments'
import { MedicalRecordsList } from '@/components/medical-records/MedicalRecordsList'
import { MedicalRecordForm } from '@/components/medical-records/MedicalRecordForm'
import { User, Activity, Plus, Pencil, Eye } from 'lucide-react'

interface PatientDetailTabsProps {
  patient: Patient
  doctorId: string
  medicalRecords: MedicalRecord[]
  documents: PatientDocument[]
}

export function PatientDetailTabs({ patient, doctorId, medicalRecords, documents }: PatientDetailTabsProps) {
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // Filter documents by type
  const patientDocs = documents.filter(d => !d.medical_record_id)
  const recordDocs = documents.filter(d => d.medical_record_id)

  return (
    <Tabs defaultValue="info" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="info" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Patient Info
        </TabsTrigger>
        <TabsTrigger value="records" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Medical Records ({medicalRecords.length})
        </TabsTrigger>
      </TabsList>

      {/* Patient Info Tab */}
      <TabsContent value="info" className="space-y-6">
        {!isEditMode ? (
          /* View Mode */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-fuchsia-600" />
                    Patient Details
                  </CardTitle>
                  <CardDescription>View patient information and contact details</CardDescription>
                </div>
                <Button onClick={() => setIsEditMode(true)} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Patient
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PatientViewDetails patient={patient} medicalRecords={medicalRecords} />
            </CardContent>
          </Card>
        ) : (
          /* Edit Mode */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-fuchsia-600" />
                    Edit Patient
                  </CardTitle>
                  <CardDescription>Update patient details and contact information</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PatientForm doctorId={doctorId} patient={patient} />
            </CardContent>
          </Card>
        )}

        {/* Patient Documents Section - Always visible */}
        <PatientDocuments
          patientId={patient.id}
          doctorId={doctorId}
          documents={patientDocs}
        />
      </TabsContent>

      {/* Medical Records Tab */}
      <TabsContent value="records" className="space-y-4">
        {!showRecordForm ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Visit Records</h3>
                <p className="text-sm text-muted-foreground">Complete medical history of patient visits</p>
              </div>
              <Button onClick={() => setShowRecordForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Visit Record
              </Button>
            </div>
            <MedicalRecordsList records={medicalRecords} documents={recordDocs} />
          </>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>New Medical Record</CardTitle>
                  <CardDescription>Record a new patient visit</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowRecordForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <MedicalRecordForm
                patientId={patient.id}
                doctorId={doctorId}
                onSuccess={() => setShowRecordForm(false)}
              />
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
