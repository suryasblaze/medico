import { createClient } from '@/lib/supabase/server'
import { dentalTemplates } from '@/lib/constants/dental-templates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TemplateFormClient } from '@/components/templates/TemplateFormClient'
import { Building2, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

interface TemplateFormPageProps {
  params: {
    doctorId: string
    templateId: string
  }
}

export default async function TemplateFormPage({ params }: TemplateFormPageProps) {
  const supabase = createClient()

  // Fetch doctor information
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, full_name, clinic_name, specialty, email, phone')
    .eq('id', params.doctorId)
    .single()

  if (!doctor) {
    notFound()
  }

  // Find template
  const template = dentalTemplates.find(t => t.id === params.templateId)

  if (!template) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 text-white mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {template.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {doctor.clinic_name || `Dr. ${doctor.full_name}'s Practice`}
          </p>
        </div>

        {/* Doctor Info Card */}
        <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dr. {doctor.full_name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty || 'General Dentistry'}</p>
                {doctor.phone && (
                  <p className="text-sm text-muted-foreground mt-1">
                    📞 {doctor.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Form */}
        <Card>
          <CardHeader>
            <CardTitle>{template.title}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateFormClient
              doctorId={doctor.id}
              template={template}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Your information is protected and will only be shared with your healthcare provider.</p>
        </div>
      </div>
    </div>
  )
}
