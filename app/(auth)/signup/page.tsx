import Image from 'next/image'
import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      {/* Modern glassmorphism card */}
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl dark:bg-gray-900/80 dark:border-fuchsia-800/30">
        <div className="space-y-6">
          {/* Header with logo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-xl shadow-fuchsia-500/25 ring-4 ring-white/60 dark:ring-gray-800/60">
              <Image
                src="/logo.jpeg"
                alt="VR Dental Care"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
                Join VR Dental Care
              </h1>
              <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">
                Create your account to get started
              </p>
            </div>
          </div>

          {/* Signup form */}
          <SignupForm />

          {/* Sign in link */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-fuchsia-200 dark:border-fuchsia-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 dark:bg-gray-900/80 px-3 text-fuchsia-600/70 dark:text-fuchsia-400/70">
                Already have an account?
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 bg-white/50 dark:bg-gray-950/50 px-4 py-3 text-center text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300 transition-all hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 hover:shadow-md"
          >
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Features list */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
        <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">Free Trial</div>
          <div className="text-fuchsia-600/60 dark:text-fuchsia-400/60">No credit card</div>
        </div>
        <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">Full Access</div>
          <div className="text-fuchsia-600/60 dark:text-fuchsia-400/60">All features</div>
        </div>
        <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <div className="font-semibold text-fuchsia-700 dark:text-fuchsia-300">Support</div>
          <div className="text-fuchsia-600/60 dark:text-fuchsia-400/60">24/7 help</div>
        </div>
      </div>
    </div>
  )
}
