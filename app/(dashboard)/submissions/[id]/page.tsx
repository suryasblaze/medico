import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { SubmissionDetail } from '@/components/submissions/SubmissionDetail'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
    .single()

  if (!doctor) {
    redirect('/login')
  }

  // Fetch submission
  const { data: submission } = await supabase
    .from('form_submissions')
    .select('*, forms(title, slug)')
    .eq('id', params.id)
    .eq('doctor_id', doctor.id)
    .single()

  if (!submission) {
    notFound()
  }

  // Fetch form fields to display labels
  const { data: formFields } = await supabase
    .from('form_fields')
    .select('*')
    .eq('form_id', submission.form_id)
    .order('order_index', { ascending: true })

  // Mark as read if not already
  if (!submission.is_read) {
    await supabase
      .from('form_submissions')
      .update({ is_read: true, viewed_at: new Date().toISOString() })
      .eq('id', params.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/submissions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Button>
        </Link>
      </div>

      <SubmissionDetail
        submission={submission}
        formFields={formFields || []}
        doctorId={doctor.id}
      />
    </div>
  )
}
