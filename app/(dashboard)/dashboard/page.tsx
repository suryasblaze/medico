import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()

  // Get user and doctor info
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, full_name')
    .eq('user_id', user?.id)
    .single()

  // Fetch only necessary data for dashboard - optimized queries
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

  const [
    { count: patientsCount },
    { count: medicalRecordsCount },
    { data: recentRecords },
    { data: recentPatients }
  ] = await Promise.all([
    // Count only
    supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctor?.id),
    // Count only
    supabase
      .from('medical_records')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctor?.id),
    // Only recent records for charts (last 6 months)
    supabase
      .from('medical_records')
      .select('visit_date, visit_type')
      .eq('doctor_id', doctor?.id)
      .gte('visit_date', sixMonthsAgo.toISOString())
      .order('visit_date', { ascending: false })
      .limit(200),
    // Only recent patients for growth chart (last 6 months)
    supabase
      .from('patients')
      .select('created_at')
      .eq('doctor_id', doctor?.id)
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: false })
  ])

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, Dr. {doctor?.full_name}
        </p>
      </div>

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
      />
    </div>
  )
}
