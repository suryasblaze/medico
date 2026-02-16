'use client'

import { useState } from 'react'
import { Patient, MedicalRecord } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientForm } from './PatientForm'
import { MedicalRecordsList } from '@/components/medical-records/MedicalRecordsList'
import { MedicalRecordForm } from '@/components/medical-records/MedicalRecordForm'
import { User, Activity, History, Plus } from 'lucide-react'

interface PatientDetailTabsProps {
  patient: Patient
  doctorId: string
  medicalRecords: MedicalRecord[]
}

export function PatientDetailTabs({ patient, doctorId, medicalRecords }: PatientDetailTabsProps) {
  const [showRecordForm, setShowRecordForm] = useState(false)

  return (
    <Tabs defaultValue="info" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="info" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Patient Info
        </TabsTrigger>
        <TabsTrigger value="records" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Medical Records ({medicalRecords.length})
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Medical History
        </TabsTrigger>
      </TabsList>

      {/* Patient Info Tab */}
      <TabsContent value="info">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Update patient details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientForm doctorId={doctorId} patient={patient} />
          </CardContent>
        </Card>
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
            <MedicalRecordsList records={medicalRecords} />
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

      {/* Medical History Tab */}
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Long-term medical conditions and allergies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Allergies</h4>
                  {patient.allergies ? (
                    <p className="text-sm bg-red-50 dark:bg-red-950/10 p-3 rounded-lg border border-red-200 dark:border-red-900">
                      {patient.allergies}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No allergies recorded</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Current Medications</h4>
                  {patient.current_medications ? (
                    <p className="text-sm bg-blue-50 dark:bg-blue-950/10 p-3 rounded-lg whitespace-pre-wrap">
                      {patient.current_medications}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No current medications</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Medical Conditions</h4>
                  {patient.medical_conditions ? (
                    <p className="text-sm bg-yellow-50 dark:bg-yellow-950/10 p-3 rounded-lg whitespace-pre-wrap">
                      {patient.medical_conditions}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No chronic conditions</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Blood Type</h4>
                  {patient.blood_type ? (
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      {patient.blood_type}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not recorded</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Insurance Provider</h4>
                  {patient.insurance_provider ? (
                    <p className="text-sm">{patient.insurance_provider}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No insurance info</p>
                  )}
                </div>

                {patient.insurance_number && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Insurance Number</h4>
                    <p className="text-sm font-mono">{patient.insurance_number}</p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Visits:</span>
                      <span className="font-semibold">{medicalRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">First Visit:</span>
                      <span className="font-semibold">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span className="font-semibold">
                        {medicalRecords[0] ? new Date(medicalRecords[0].visit_date).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>💡 Tip: Update medical history in the "Patient Info" tab to keep records current.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
