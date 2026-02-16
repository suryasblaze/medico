import { createClient } from '@/lib/supabase/server'
import { PatientsList } from '@/components/patients/PatientsList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PatientsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Fetch all patients for this doctor
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
          <p className="text-muted-foreground">
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
