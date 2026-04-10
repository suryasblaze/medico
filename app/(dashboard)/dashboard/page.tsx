import { getCurrentDoctor, getCachedDashboardStats } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { AppointmentsOverview } from '@/components/dashboard/AppointmentsOverview'
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  // Use cached doctor - already fetched in layout
  const doctor = await getCurrentDoctor()

  // Use persistent cached stats for faster loading
  const { patientsCount, medicalRecordsCount, recentRecords, recentPatients } =
    await getCachedDashboardStats(doctor?.id || '')

  const now = new Date()

  // Fetch appointment data (today's schedule + last 7 days trend)
  const supabase = createClient()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`

  const [{ data: todaysAppointments }, { data: weekAppointments }] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, start_time, end_time, title, status, patient:patients(full_name)')
      .eq('doctor_id', doctor?.id || '')
      .eq('appointment_date', todayStr)
      .order('start_time', { ascending: true }),
    supabase
      .from('appointments')
      .select('appointment_date, status')
      .eq('doctor_id', doctor?.id || '')
      .gte('appointment_date', sevenDaysAgoStr)
      .lte('appointment_date', todayStr),
  ])

  // Build last-7-days trend
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const appointmentTrend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo)
    d.setDate(d.getDate() + i)
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayAppts = (weekAppointments || []).filter((a: any) => a.appointment_date === ds)
    return {
      label: dayLabels[d.getDay()],
      scheduled: dayAppts.filter((a: any) => a.status === 'scheduled').length,
      completed: dayAppts.filter((a: any) => a.status === 'completed').length,
    }
  })

  const todaysList = (todaysAppointments || []).map((a: any) => ({
    ...a,
    patient: Array.isArray(a.patient) ? a.patient[0] : a.patient,
  }))

  // Calculate stats
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonthPatients = recentPatients?.filter(p =>
    new Date(p.created_at) >= lastMonth
  ).length || 0

  const lastMonthRecords = recentRecords?.filter(r =>
    new Date(r.visit_date) >= lastMonth
  ).length || 0

  // Prepare chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const visitData = months.slice(0, 6).map((month, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const monthRecords = recentRecords?.filter(r => {
      const recordDate = new Date(r.visit_date)
      return recordDate.getMonth() === monthDate.getMonth()
    }) || []

    const monthPatients = recentPatients?.filter(p => {
      const patientDate = new Date(p.created_at)
      return patientDate.getMonth() === monthDate.getMonth() &&
             patientDate.getFullYear() === monthDate.getFullYear()
    }) || []

    return {
      month,
      visits: monthRecords.length,
      newPatients: monthPatients.length
    }
  })

  // Simplified patient growth - just show monthly new patients
  const patientGrowth = months.slice(0, 6).map((month, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const monthNew = recentPatients?.filter(p => {
      const pd = new Date(p.created_at)
      return pd.getMonth() === monthDate.getMonth() && pd.getFullYear() === monthDate.getFullYear()
    }).length || 0
    // Cumulative approximation based on total
    const total = (patientsCount || 0) - (thisMonthPatients * (5 - index))
    return { month, total: Math.max(0, total) }
  })

  const visitTypes = [
    { name: 'Consultation', value: recentRecords?.filter(r => r.visit_type === 'consultation').length || 0 },
    { name: 'Follow-up', value: recentRecords?.filter(r => r.visit_type === 'follow_up').length || 0 },
    { name: 'Emergency', value: recentRecords?.filter(r => r.visit_type === 'emergency').length || 0 },
    { name: 'Checkup', value: recentRecords?.filter(r => r.visit_type === 'routine_checkup').length || 0 },
    { name: 'Procedure', value: recentRecords?.filter(r => r.visit_type === 'procedure').length || 0 },
  ].filter(v => v.value > 0)

  // Weekly activity - visits by day of week (from recent records)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyActivity = dayNames.map((day, dayIndex) => {
    const visitsOnDay = recentRecords?.filter(r => {
      const recordDate = new Date(r.visit_date)
      return recordDate.getDay() === dayIndex
    }).length || 0
    return { day, visits: visitsOnDay }
  })
  // Reorder to start from Monday
  const weeklyActivityOrdered = [
    weeklyActivity[1], // Mon
    weeklyActivity[2], // Tue
    weeklyActivity[3], // Wed
    weeklyActivity[4], // Thu
    weeklyActivity[5], // Fri
    weeklyActivity[6], // Sat
    weeklyActivity[0], // Sun
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">
          Welcome back, Dr. {doctor?.full_name}
        </p>
      </div>

      {/* Today's Schedule + Appointments Chart */}
      <AppointmentsOverview todays={todaysList} trend={appointmentTrend} />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={patientsCount || 0}
          icon={Users}
          change={{ value: `+${thisMonthPatients} this month`, isPositive: true }}
        />
        <StatsCard
          title="Total Visits"
          value={medicalRecordsCount || 0}
          icon={Activity}
          change={{ value: `+${lastMonthRecords} this month`, isPositive: true }}
        />
        <StatsCard
          title="New Patients"
          value={thisMonthPatients}
          icon={TrendingUp}
          change={{ value: "This month", isPositive: true }}
        />
        <StatsCard
          title="Avg. Visits/Day"
          value={Math.round((medicalRecordsCount || 0) / 30)}
          icon={Calendar}
          change={{ value: "Last 30 days", isPositive: true }}
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        visitData={visitData}
        patientGrowth={patientGrowth}
        visitTypes={visitTypes}
        weeklyActivity={weeklyActivityOrdered}
      />
    </div>
  )
}
