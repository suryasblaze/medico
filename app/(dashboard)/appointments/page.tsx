import { createClient } from '@/lib/supabase/server'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import { AppointmentsCalendar } from '@/components/appointments/AppointmentsCalendar'

export default async function AppointmentsPage() {
  // Use cached doctor - already fetched in layout
  const doctorData = await getCurrentDoctor()
  const supabase = createClient()

  if (!doctorData) {
    return <div>Doctor profile not found</div>
  }

  // Fetch patients for selection
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, phone')
    .eq('doctor_id', doctorData.id)
    .order('full_name')

  // Fetch appointments with patient info
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, full_name, phone)
    `)
    .eq('doctor_id', doctorData.id)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">Appointments</h1>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70">Schedule and manage patient appointments</p>
      </div>

      <AppointmentsCalendar
        appointments={appointments || []}
        patients={patients || []}
        doctorId={doctorData.id}
      />
    </div>
  )
}
