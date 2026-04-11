import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { PatientsList } from '@/components/patients/PatientsList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PatientsPage() {
  // Use cached doctor - already fetched in layout
  const doctor = await getCurrentDoctor()

  // Fetch patients with their medical records to compute last visit date
  const supabase = createClient()
  const { data: patientsData } = await supabase
    .from('patients')
    .select('*, medical_records(visit_date)')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })

  const patients = (patientsData || []).map((p: any) => {
    const records = (p.medical_records || []) as { visit_date: string }[]
    const lastVisit = records
      .map((r) => r.visit_date)
      .filter(Boolean)
      .sort()
      .pop() || null
    const { medical_records, ...rest } = p
    return { ...rest, last_visit_date: lastVisit }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">Patients</h2>
          <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">
            Manage your patient records and information
          </p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>

      <PatientsList patients={patients || []} doctorId={doctor?.id || ''} />
    </div>
  )
}
