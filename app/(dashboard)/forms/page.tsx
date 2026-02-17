import { createClient } from '@/lib/supabase/server'
import { FormsList } from '@/components/forms/FormsList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function FormsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .maybeSingle()

  // Fetch all forms for this doctor
  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('doctor_id', doctor?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Forms</h2>
          <p className="text-muted-foreground">
            Create and manage custom forms for your patients
          </p>
        </div>
        <Link href="/forms/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>

      <FormsList forms={forms || []} />
    </div>
  )
}
