import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { redirect, notFound } from 'next/navigation'
import { PatientDetailTabs } from '@/components/patients/PatientDetailTabs'
import { DownloadPatientPDF } from '@/components/patients/DownloadPatientPDF'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeletePatientButton } from '@/components/patients/DeletePatientButton'

export default async function PatientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Use cached doctor - already fetched in layout
  const doctor = await getCurrentDoctor()
  const supabase = createClient()

  if (!doctor) {
    redirect('/login')
  }

  // Fetch patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', doctor.id)
    .maybeSingle()

  if (!patient) {
    notFound()
  }

  // Fetch medical records
  const { data: medicalRecords } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patient.id)
    .order('visit_date', { ascending: false })

  // Fetch patient documents
  const { data: documents } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('patient_id', patient.id)
    .order('uploaded_at', { ascending: false })

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

      {/* Tabs Section */}
      <PatientDetailTabs
        patient={patient}
        doctorId={doctor.id}
        doctorEmail={doctor.email}
        medicalRecords={medicalRecords || []}
        documents={documents || []}
      />
    </div>
  )
}
