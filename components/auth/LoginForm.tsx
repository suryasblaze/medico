'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if email exists in doctors table first
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle()

      if (!doctor) {
        setError('No account found with this email address')
        setLoading(false)
        return
      }

      // Email exists, send reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setResetSent(true)
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Only proceed if login was successful
      if (data.user) {
        // Fast client-side navigation
        router.replace('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Forgot Password View
  if (showForgotPassword) {
    if (resetSent) {
      return (
        <div className="space-y-4 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 flex items-center justify-center shadow-lg shadow-green-500/20">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Check your email</h3>
            <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70 mt-2">
              We sent a password reset link to <strong className="text-fuchsia-700 dark:text-fuchsia-300">{email}</strong>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-fuchsia-200 dark:border-fuchsia-800 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 transition-all"
            onClick={() => {
              setShowForgotPassword(false)
              setResetSent(false)
              setError(null)
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>
      )
    }

    return (
      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Reset your password</h3>
          <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-500" />
            <Input
              id="reset-email"
              type="email"
              placeholder="doctor@vrdentalcare.com"
              className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-700 hover:via-fuchsia-800 hover:to-fuchsia-900 text-white font-semibold shadow-lg shadow-fuchsia-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/40 hover:scale-[1.02]"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full rounded-xl text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
          onClick={() => {
            setShowForgotPassword(false)
            setError(null)
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Button>
      </form>
    )
  }

  // Login View
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-500" />
          <Input
            id="email"
            type="email"
            placeholder="doctor@vrdentalcare.com"
            className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <button
            type="button"
            className="text-xs font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
            onClick={() => {
              setShowForgotPassword(true)
              setError(null)
            }}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-500" />
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-gradient-to-r from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-700 hover:via-fuchsia-800 hover:to-fuchsia-900 text-white font-semibold shadow-lg shadow-fuchsia-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-fuchsia-500/40 hover:scale-[1.02]"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign in to your account'
        )}
      </Button>
    </form>
  )
}
