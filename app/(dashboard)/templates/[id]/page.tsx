import { dentalTemplates } from '@/lib/constants/dental-templates'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface TemplateDetailPageProps {
  params: {
    id: string
  }
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const template = dentalTemplates.find(t => t.id === params.id)

  if (!template) {
    notFound()
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>
      </div>

      {/* Template Info */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {template.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {template.description}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
      </div>

      {/* Preview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Template Preview
              </CardTitle>
              <CardDescription>
                This is a read-only preview. Use the template to create a fillable form for patients.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Link href={`/templates/${template.id}/use`}>
                <Button size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Use with Patient
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {template.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {field.label}
                  {field.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </label>

                {/* Field preview based on type */}
                {field.field_type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    disabled
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                )}

                {field.field_type === 'textarea' && (
                  <textarea
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    disabled
                    rows={3}
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                )}

                {field.field_type === 'select' && field.options && (
                  <select
                    disabled
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 text-sm"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.field_type === 'checkbox' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      disabled
                      className="h-4 w-4 border-gray-300 rounded"
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.placeholder || field.label}
                    </span>
                  </div>
                )}

                {field.field_type === 'radio' && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.label}
                          disabled
                          className="h-4 w-4 border-gray-300"
                        />
                        <span className="text-sm text-muted-foreground">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {field.field_type === 'date' && (
                  <input
                    type="date"
                    disabled
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                )}

                {field.field_type === 'number' && (
                  <input
                    type="number"
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    disabled
                    className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">How to Use This Template</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Click "Use with Patient" to create a fillable form for a specific patient</li>
                <li>You can customize the fields before assigning it to a patient</li>
                <li>Export as PDF to print and use as a paper form</li>
                <li>All filled forms are stored in the patient's medical records</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
