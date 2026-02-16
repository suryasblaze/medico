import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Glassmorphism card */}
      <div className="rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/70 dark:border-gray-800/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login form */}
          <LoginForm />

          {/* Sign up link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/70 dark:bg-gray-900/70 px-2 text-muted-foreground">
                New to MediCore?
              </span>
            </div>
          </div>

          <Link
            href="/signup"
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 px-4 py-2.5 text-center text-sm font-medium transition-all hover:bg-white dark:hover:bg-gray-900 hover:shadow-md"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Secure SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>HIPAA Ready</span>
        </div>
      </div>
    </div>
  )
}
