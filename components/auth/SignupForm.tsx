'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Lock, Building2, AlertCircle } from 'lucide-react'

export function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            clinic_name: clinicName,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Redirect to dashboard after successful signup
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </Label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
          <Input
            id="fullName"
            type="text"
            placeholder="Dr. John Doe"
            className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
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

      {/* Clinic Name field */}
      <div className="space-y-2">
        <Label htmlFor="clinicName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Clinic Name <span className="text-fuchsia-500/60">(Optional)</span>
        </Label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
          <Input
            id="clinicName"
            type="text"
            placeholder="VR Dental Care"
            className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fuchsia-400" />
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="pl-11 h-12 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </div>
        <p className="text-xs text-fuchsia-600/60 dark:text-fuchsia-400/60">
          Must be at least 6 characters long
        </p>
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
        className="w-full h-12 rounded-xl bg-gradient-to-r from-fuchsia-600 via-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-700 hover:via-fuchsia-800 hover:to-fuchsia-900 text-white font-semibold shadow-lg shadow-fuchsia-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/40 hover:scale-[1.02]"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Creating account...</span>
          </div>
        ) : (
          'Create your account'
        )}
      </Button>

      {/* Terms text */}
      <p className="text-xs text-center text-fuchsia-600/60 dark:text-fuchsia-400/60">
        By creating an account, you agree to our{' '}
        <button type="button" className="text-orange-500 hover:underline">
          Terms of Service
        </button>{' '}
        and{' '}
        <button type="button" className="text-orange-500 hover:underline">
          Privacy Policy
        </button>
      </p>
    </form>
  )
}
