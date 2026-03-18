import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm'
import { PrescriptionsList } from '@/components/prescriptions/PrescriptionsList'

export default async function PrescriptionsPage() {
  const doctor = await getCurrentDoctor()

  const supabase = createClient()

  // Fetch patients for dropdown
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('doctor_id', doctor?.id)
    .order('full_name')

  // Fetch recent prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*, patient:patients(id, full_name)')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
          Prescriptions
        </h2>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">
          Write and manage patient prescriptions
        </p>
      </div>

      <PrescriptionForm
        doctorId={doctor?.id || ''}
        patients={patients || []}
      />

      {prescriptions && prescriptions.length > 0 && (
        <PrescriptionsList prescriptions={prescriptions} />
      )}
    </div>
  )
}
