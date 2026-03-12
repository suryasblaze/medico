import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Modern glassmorphism card */}
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl dark:bg-gray-900/80 dark:border-fuchsia-800/30">
        <div className="space-y-8">
          {/* Header with logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-24 w-56">
              <Image
                src="/logo.png"
                alt="VR Dental Care"
                fill
                priority
                className="object-contain"
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-fuchsia-800 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">
                Sign in to manage your dental practice
              </p>
            </div>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent dark:via-fuchsia-800/50"></div>
            <svg className="h-5 w-5 text-fuchsia-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-200 to-transparent dark:via-fuchsia-800/50"></div>
          </div>

          {/* Login form */}
          <LoginForm />
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex items-center justify-center gap-8 text-xs">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">Secure & Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-fuchsia-600 dark:text-fuchsia-400">
          <div className="h-8 w-8 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/50 flex items-center justify-center">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">HIPAA Compliant</span>
        </div>
      </div>
    </div>
  )
}
