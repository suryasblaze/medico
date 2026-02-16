import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import type { Doctor } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Middleware already handles auth, so we can trust user is authenticated
  // Just fetch the data we need
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch doctor profile - middleware ensures user exists
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, user_id, full_name, email, phone, specialty, avatar_url, clinic_name, updated_at')
    .eq('user_id', user?.id)
    .maybeSingle() as { data: Partial<Doctor> | null }

  // If no doctor profile, show error message instead of redirecting
  if (!doctor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg dark:border-red-900 dark:bg-gray-950">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Profile Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your doctor profile could not be found. Please contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header doctor={doctor} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
