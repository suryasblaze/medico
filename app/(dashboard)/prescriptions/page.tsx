import { getCurrentDoctor } from '@/lib/supabase/queries'
import { PrescriptionForm } from '@/components/prescriptions/PrescriptionForm'

export default async function PrescriptionsPage() {
  const doctor = await getCurrentDoctor()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
          Prescriptions
        </h2>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">
          Write and print patient prescriptions
        </p>
      </div>

      <PrescriptionForm doctorId={doctor?.id || ''} />
    </div>
  )
}
