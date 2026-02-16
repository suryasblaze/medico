import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import { Share2, Users, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function IntakeFormsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Generate shareable link
  const intakeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/intake/${doctor?.id}`

  // Get recent patients (last 10)
  const { data: recentPatients } = await supabase
    .from('patients')
    .select('id, full_name, email, phone, created_at')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get today's patients count
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctor?.id)
    .gte('created_at', today.toISOString())

  // Get this week's patients count
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: weekCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', doctor?.id)
    .gte('created_at', weekAgo.toISOString())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patient Intake Form</h2>
        <p className="text-muted-foreground">
          Share this link with new patients to automatically create their records
        </p>
      </div>

      {/* Shareable Link Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Your Intake Form Link
          </CardTitle>
          <CardDescription>
            Share this link with new patients - they fill it out and are automatically added to your patient list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg font-mono text-sm">
                {intakeUrl}
              </div>
              <CopyButton text={intakeUrl} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-white dark:bg-gray-950 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{todayCount || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">New Today</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-950 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{weekCount || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">This Week</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-950 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{recentPatients?.length || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Recent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Automatic patient registration - no manual review needed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col items-center text-center p-4 bg-blue-50 dark:bg-blue-950/10 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h4 className="font-semibold mb-2">Share Link</h4>
              <p className="text-sm text-muted-foreground">
                Send the link via SMS, email, or WhatsApp
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-green-50 dark:bg-green-950/10 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h4 className="font-semibold mb-2">Patient Fills Form</h4>
              <p className="text-sm text-muted-foreground">
                They enter their information (no login required)
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-purple-50 dark:bg-purple-950/10 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h4 className="font-semibold mb-2">Auto-Created</h4>
              <p className="text-sm text-muted-foreground">
                Patient record created instantly
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-orange-50 dark:bg-orange-950/10 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold mb-3">
                4
              </div>
              <h4 className="font-semibold mb-2">Ready to Use</h4>
              <p className="text-sm text-muted-foreground">
                Appears in your Patients list immediately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Patients */}
      {recentPatients && recentPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Recent Patients
            </CardTitle>
            <CardDescription>Last 10 patients added to your practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{patient.full_name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {patient.email && <span>{patient.email}</span>}
                      {patient.phone && <span>{patient.phone}</span>}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(patient.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">💡 Tips for Using Intake Forms</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Add the intake form link to your website or online booking system</li>
            <li>• Send it to patients before their first appointment</li>
            <li>• Include it in appointment confirmation emails</li>
            <li>• Share on social media for new patient inquiries</li>
            <li>• All patient data is instantly available in the Patients page with real-time updates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
