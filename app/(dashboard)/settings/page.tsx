import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function SettingsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!doctor) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal and professional details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm doctor={doctor} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Your account information and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{doctor.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono text-xs">{doctor.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscription Plan
                </p>
                <p className="text-sm capitalize">{doctor.subscription_plan || 'free'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subscription Status
                </p>
                <p className="text-sm capitalize">{doctor.subscription_status || 'active'}</p>
              </div>
              {doctor.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-sm">
                    {new Date(doctor.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {doctor.trial_ends_at && doctor.subscription_status === 'trial' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trial Ends
                  </p>
                  <p className="text-sm">
                    {new Date(doctor.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
