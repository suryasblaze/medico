import { Shield } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sky-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400 opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-sky-400 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="container flex h-16 items-center px-4">
          <Link href="/login" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              MediCore
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer accent */}
      <div className="relative z-10 py-4">
        <p className="text-center text-sm text-muted-foreground">
          Secure healthcare form management
        </p>
      </div>
    </div>
  )
}
