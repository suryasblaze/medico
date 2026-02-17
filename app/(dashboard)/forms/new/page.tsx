import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FormBuilderWrapper } from '@/components/forms/FormBuilderWrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewFormPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!doctor) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/forms">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Form</h2>
        <p className="text-muted-foreground">
          Build a custom form for your patients to fill out
        </p>
      </div>

      <FormBuilderWrapper doctorId={doctor.id} />
    </div>
  )
}
