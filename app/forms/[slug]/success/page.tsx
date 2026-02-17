import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FormSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { message?: string }
}) {
  const supabase = createClient()

  // Fetch form to get success message
  const { data: form } = await supabase
    .from('forms')
    .select('title, success_message, allow_multiple_submissions')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!form) {
    notFound()
  }

  const successMessage =
    searchParams.message || form.success_message || 'Thank you for your submission!'

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

      {/* Success Content */}
      <main className="container max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Submission Successful!</CardTitle>
            <CardDescription className="text-base">
              {form.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{successMessage}</p>

            {form.allow_multiple_submissions && (
              <div className="mt-6">
                <Link href={`/forms/${params.slug}`}>
                  <Button>Submit Another Response</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
