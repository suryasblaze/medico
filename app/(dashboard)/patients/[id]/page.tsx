import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PatientDetailTabs } from '@/components/patients/PatientDetailTabs'
import { DownloadPatientPDF } from '@/components/patients/DownloadPatientPDF'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, User, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeletePatientButton } from '@/components/patients/DeletePatientButton'
import { Badge } from '@/components/ui/badge'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctor) {
    redirect('/login')
  }

  // Fetch patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', doctor.id)
    .single()

  if (!patient) {
    notFound()
  }

  // Fetch medical records
  const { data: medicalRecords } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patient.id)
    .order('visit_date', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <DownloadPatientPDF patientId={patient.id} patientName={patient.full_name} />
          <DeletePatientButton patientId={patient.id} patientName={patient.full_name} />
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {patient.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {patient.full_name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    {patient.date_of_birth && (
                      <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                    )}
                    {patient.gender && (
                      <Badge variant="outline">{patient.gender}</Badge>
                    )}
                    {patient.medical_record_number && (
                      <span className="font-mono">MRN: {patient.medical_record_number}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{medicalRecords?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Medical Records</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {medicalRecords?.[0] ? new Date(medicalRecords[0].visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {patient.created_at ? Math.floor((Date.now() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <PatientDetailTabs
        patient={patient}
        doctorId={doctor.id}
        medicalRecords={medicalRecords || []}
      />
    </div>
  )
}
