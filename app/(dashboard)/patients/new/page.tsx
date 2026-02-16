import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PatientForm } from '@/components/patients/PatientForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewPatientPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
          <CardDescription>
            Enter patient information to create a new record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm doctorId={doctor.id} />
        </CardContent>
      </Card>
    </div>
  )
}
