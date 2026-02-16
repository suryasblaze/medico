'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormSettings } from './FormSettings'
import { FormBuilder } from './FormBuilder/FormBuilder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormFormData } from '@/lib/validations/form'
import { FormField } from '@/types'
import { generateSlug } from '@/lib/utils/formatters'

interface FormBuilderWrapperProps {
  doctorId: string
}

export function FormBuilderWrapper({ doctorId }: FormBuilderWrapperProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('settings')

  const [formData, setFormData] = useState<FormFormData>({
    title: '',
    description: '',
    slug: '',
    is_active: true,
    requires_patient_info: true,
    success_message: 'Thank you for your submission!',
    notification_email: '',
    allow_multiple_submissions: false,
  })

  const [fields, setFields] = useState<
    Omit<FormField, 'id' | 'form_id' | 'created_at'>[]
  >([])

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const handleSaveForm = async () => {
    if (!formData.title) {
      setError('Form title is required')
      return
    }

    if (fields.length === 0) {
      setError('Please add at least one field to the form')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create form
      const { data: newForm, error: formError } = await supabase
        .from('forms')
        .insert({
          ...formData,
          doctor_id: doctorId,
        })
        .select()
        .single()

      if (formError) throw formError

      // Create form fields
      const fieldsToInsert = fields.map((field, index) => ({
        ...field,
        form_id: newForm.id,
        order_index: index,
      }))

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(fieldsToInsert)

      if (fieldsError) throw fieldsError

      router.push('/forms')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to save form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Form Settings</TabsTrigger>
          <TabsTrigger value="builder">Form Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card className="p-6">
            <FormSettings
              formData={formData}
              onFormDataChange={setFormData}
              onTitleChange={handleTitleChange}
            />
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <FormBuilder fields={fields} onFieldsChange={setFields} />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {fields.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {fields.length} field{fields.length !== 1 ? 's' : ''} added
            </p>
          )}
          <Button onClick={handleSaveForm} disabled={loading}>
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>
    </div>
  )
}
