import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { PatientsList } from '@/components/patients/PatientsList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PatientsPage() {
  // Use cached doctor - already fetched in layout
  const doctor = await getCurrentDoctor()

  // Fetch patients
  const supabase = createClient()
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })

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
