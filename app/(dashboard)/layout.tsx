import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { Header } from '@/components/dashboard/Header'
import { NotificationProvider } from '@/components/notifications/NotificationProvider'
import { PWAInstall } from '@/components/pwa/PWAInstall'
import { getCurrentDoctor } from '@/lib/supabase/queries'
import type { Doctor } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use cached function - reused across layout and children in the same request
  const doctorData = await getCurrentDoctor()

  // If no doctor profile, show error message instead of redirecting
  if (!doctorData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 via-white to-orange-50/30 dark:from-gray-950 dark:via-fuchsia-950/10 dark:to-gray-950 p-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-xl dark:border-red-900/50 dark:bg-gray-950/80">
          <h2 className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">Profile Not Found</h2>
          <p className="mt-2 text-sm md:text-base text-fuchsia-600/70 dark:text-fuchsia-400/70">
            Your profile could not be found. Please contact VR Dental Care support.
          </p>
        </div>
      </div>
    )
  }

  // Type-safe doctor object after null check
  const doctor = doctorData as Pick<Doctor, 'id' | 'full_name' | 'email' | 'avatar_url' | 'clinic_name' | 'specialty' | 'phone'>

  return (
    <NotificationProvider doctorId={doctorData.id}>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-fuchsia-50/50 via-white to-orange-50/30 dark:from-gray-950 dark:via-fuchsia-950/10 dark:to-gray-950">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header doctor={doctor} />

          {/* Page Content - responsive padding */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
            {children}
          </main>
        </div>

        {/* PWA Install Prompt */}
        <PWAInstall />
      </div>
    </NotificationProvider>
  )
}
