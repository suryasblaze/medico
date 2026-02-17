import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicFormRenderer } from '@/components/forms/PublicFormRenderer'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export default async function PublicFormPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()

  // Fetch form by slug
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!form) {
    notFound()
  }

  // Fetch form fields
  const { data: fields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', form.id)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MediCore</span>
          </Link>
        </div>
      </header>

      {/* Form Content */}
      <main className="container max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-muted-foreground">{form.description}</p>
          )}
        </div>

        <PublicFormRenderer form={form} fields={fields || []} />
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          Powered by <span className="font-medium">MediCore</span>
        </div>
      </footer>
    </div>
  )
}
