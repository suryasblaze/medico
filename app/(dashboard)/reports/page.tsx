import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportDownloader } from '@/components/reports/ReportDownloader'
import { FileText, Calendar, TrendingUp, Users, Activity } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .maybeSingle()

  // Fetch data for reports
  const [
    { count: totalPatients },
    { count: totalVisits },
    { data: recentVisits }
  ] = await Promise.all([
    supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctor?.id),
    supabase
      .from('medical_records')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctor?.id),
    supabase
      .from('medical_records')
      .select('*, patients(full_name)')
      .eq('doctor_id', doctor?.id)
      .order('visit_date', { ascending: false })
      .limit(10)
  ])

  // Calculate this month stats
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const thisMonthVisits = recentVisits?.filter(v =>
    new Date(v.visit_date) >= thisMonthStart
  ).length || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Download monthly reports and view practice analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold mt-2">{totalPatients || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-3xl font-bold mt-2">{totalVisits || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold mt-2">{thisMonthVisits}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg/Month</p>
                <p className="text-3xl font-bold mt-2">
                  {Math.round((totalVisits || 0) / 6)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Download Monthly Reports</CardTitle>
          <CardDescription>
            Select a month and report type, then click Excel/CSV to download the file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/10 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📥 <strong>Note:</strong> After selecting your options, click the "Excel/CSV" button below to download your report file.
            </p>
          </div>
          <ReportDownloader doctorId={doctor?.id || ''} />

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Patient Visits</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Complete visit records
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Patient List</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All patient details
                  </p>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Statistics</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monthly analytics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Medical Records</CardTitle>
          <CardDescription>Latest patient visits and consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentVisits?.map((visit: any) => (
              <div
                key={visit.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{visit.patients?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {visit.diagnosis || visit.chief_complaint || 'Regular checkup'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {visit.visit_type?.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
