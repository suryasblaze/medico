import { createClient } from '@/lib/supabase/server'
import { dentalTemplates } from '@/lib/constants/dental-templates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TemplatePatientSelector } from '@/components/templates/TemplatePatientSelector'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface TemplateUsePageProps {
  params: {
    id: string
  }
}

export default async function TemplateUsePage({ params }: TemplateUsePageProps) {
  const template = dentalTemplates.find(t => t.id === params.id)

  if (!template) {
    notFound()
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Fetch all patients
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, email, phone, date_of_birth')
    .eq('doctor_id', doctor?.id)
    .order('full_name', { ascending: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/templates/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Template
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Use Template: {template.title}
        </h2>
        <p className="text-muted-foreground mt-1">
          Select a patient to fill out this template for
        </p>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Select Patient
          </CardTitle>
          <CardDescription>
            Choose which patient you want to fill out this template for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients && patients.length > 0 ? (
            <TemplatePatientSelector
              patients={patients}
              templateId={template.id}
              templateTitle={template.title}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No patients found</p>
              <Link href="/patients">
                <Button>Add Your First Patient</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
