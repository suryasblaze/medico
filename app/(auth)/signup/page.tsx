import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      {/* Glassmorphism card */}
      <div className="rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/70 dark:border-gray-800/50">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start your free trial
            </h1>
            <p className="text-sm text-muted-foreground">
              Create your account and get started in minutes
            </p>
          </div>

          {/* Signup form */}
          <SignupForm />

          {/* Sign in link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/70 dark:bg-gray-900/70 px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 px-4 py-2.5 text-center text-sm font-medium transition-all hover:bg-white dark:hover:bg-gray-900 hover:shadow-md"
          >
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Features list */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
        <div>
          <div className="font-semibold text-foreground">14 Days Free</div>
          <div>No credit card</div>
        </div>
        <div>
          <div className="font-semibold text-foreground">Full Access</div>
          <div>All features</div>
        </div>
        <div>
          <div className="font-semibold text-foreground">Cancel Anytime</div>
          <div>No commitment</div>
        </div>
      </div>
    </div>
  )
}
