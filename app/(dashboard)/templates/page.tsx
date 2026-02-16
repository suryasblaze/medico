import { createClient } from '@/lib/supabase/server'
import { dentalTemplates } from '@/lib/constants/dental-templates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import { FileText, Plus, Stethoscope, AlertCircle, Sparkles, Smile, Share2 } from 'lucide-react'
import Link from 'next/link'

const categoryIcons = {
  examination: Stethoscope,
  treatment: Plus,
  emergency: AlertCircle,
  orthodontics: Sparkles,
  hygiene: Smile,
}

const categoryColors = {
  examination: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
  treatment: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400',
  emergency: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400',
  orthodontics: 'bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
  hygiene: 'bg-teal-100 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400',
}

export default async function TemplatesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dental Form Templates
        </h2>
        <p className="text-muted-foreground mt-1">
          Pre-built dental forms you can use and customize
        </p>
      </div>

      {/* Header Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Professional Dental Forms</h3>
              <p className="text-sm text-muted-foreground mt-1">
                These templates are designed for dental practices. Click on any template to preview and use it with your patients.
                All templates are fully editable to match your practice needs.
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {dentalTemplates.length} Templates
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dentalTemplates.map((template) => {
          const Icon = categoryIcons[template.category as keyof typeof categoryIcons]
          const colorClass = categoryColors[template.category as keyof typeof categoryColors]
          const templateUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/template-form/${doctor?.id}/${template.id}`

          return (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg">
                  {template.title}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{template.fields.length} fields</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      Shareable Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-xs truncate">
                        {templateUrl}
                      </div>
                      <CopyButton text={templateUrl} label="Copy" />
                    </div>
                  </div>

                  <Link href={`/templates/${template.id}`}>
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Preview Template →
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Custom Form CTA */}
      <Card className="border-dashed">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Need a custom form?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your own form from scratch or modify these templates
              </p>
            </div>
            <Link href="/forms/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Form
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
