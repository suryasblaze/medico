import { createClient } from '@/lib/supabase/server'
import { SubmissionsList } from '@/components/submissions/SubmissionsList'

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { form?: string; status?: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get doctor profile
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Build query
  let query = supabase
    .from('form_submissions')
    .select('*, forms(title, slug)')
    .eq('doctor_id', doctor?.id)
    .order('submitted_at', { ascending: false })

  // Filter by form if specified
  if (searchParams.form) {
    query = query.eq('form_id', searchParams.form)
  }

  // Filter by status if specified
  if (searchParams.status === 'read') {
    query = query.eq('is_read', true)
  } else if (searchParams.status === 'unread') {
    query = query.eq('is_read', false)
  }

  const { data: submissions } = await query

  // Fetch all forms for filter dropdown
  const { data: forms } = await supabase
    .from('forms')
    .select('id, title')
    .eq('doctor_id', doctor?.id)
    .order('title')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
        <p className="text-muted-foreground">
          View and manage all form submissions from your patients
        </p>
      </div>

      <SubmissionsList
        submissions={submissions || []}
        forms={forms || []}
        currentFilters={{
          form: searchParams.form,
          status: searchParams.status,
        }}
      />
    </div>
  )
}
