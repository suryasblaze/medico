import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IntakeFormClient } from '@/components/intake/IntakeFormClient'
import { User } from 'lucide-react'
import { notFound } from 'next/navigation'

interface IntakeFormPageProps {
  params: {
    doctorId: string
  }
}

export default async function IntakeFormPage({ params }: IntakeFormPageProps) {
  const supabase = createClient()

  // Fetch doctor information
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, full_name, clinic_name, specialty, email, phone')
    .eq('id', params.doctorId)
    .maybeSingle()

  if (!doctor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-orange-50/40 dark:from-gray-950 dark:via-fuchsia-950/10 dark:to-gray-950">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative h-20 w-48 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="VR Dental Care"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">
            New Patient Intake Form
          </h1>
          <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70 mt-2">
            {doctor.clinic_name || `${doctor.full_name.toLowerCase().startsWith('dr.') || doctor.full_name.toLowerCase().startsWith('dr ') ? '' : 'Dr. '}${doctor.full_name}'s Practice`}
          </p>
        </div>

        {/* Doctor Info Card */}
        <Card className="mb-6 border-fuchsia-200 dark:border-fuchsia-900/50 bg-gradient-to-r from-fuchsia-50/50 to-orange-50/30 dark:from-fuchsia-950/20 dark:to-orange-950/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-fuchsia-700 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-fuchsia-800 dark:text-fuchsia-200">{doctor.full_name.toLowerCase().startsWith('dr.') || doctor.full_name.toLowerCase().startsWith('dr ') ? '' : 'Dr. '}{doctor.full_name}</h3>
                <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">{doctor.specialty || 'General Dentistry'}</p>
                {doctor.phone && (
                  <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70 mt-1">
                    📞 {doctor.phone}
                  </p>
                )}
                {doctor.email && (
                  <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">
                    ✉️ {doctor.email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intake Form */}
        <Card className="border-fuchsia-100 dark:border-fuchsia-900/30 shadow-lg shadow-fuchsia-500/5">
          <CardHeader>
            <CardTitle className="text-fuchsia-800 dark:text-fuchsia-200">Patient Information</CardTitle>
            <CardDescription className="text-fuchsia-600/70 dark:text-fuchsia-400/70">
              Please fill out all required fields. This information will be kept confidential and used only for your dental care.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntakeFormClient doctorId={doctor.id} />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-fuchsia-600/60 dark:text-fuchsia-400/50">
          <p>Your information is protected and will only be shared with your healthcare provider.</p>
          <p className="mt-2">
            Have questions? Contact us at {doctor.phone || doctor.email}
          </p>
          <p className="mt-4 font-medium text-fuchsia-700/60 dark:text-fuchsia-400/60">
            VR Dental Care - Your Smile, Our Priority
          </p>
        </div>
      </div>
    </div>
  )
}
