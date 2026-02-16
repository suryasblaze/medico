import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProcessIntakeForm } from '@/components/intake/ProcessIntakeForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Phone, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface IntakeFormDetailPageProps {
  params: {
    id: string
  }
}

export default async function IntakeFormDetailPage({ params }: IntakeFormDetailPageProps) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Fetch the intake form
  const { data: intakeForm } = await supabase
    .from('patient_intake_forms')
    .select('*')
    .eq('id', params.id)
    .eq('doctor_id', doctor?.id)
    .single()

  if (!intakeForm) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/intake-forms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Intake Forms
            </Button>
          </Link>
        </div>
        {intakeForm.is_processed ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950/20">
            Processed
          </Badge>
        ) : (
          <Badge variant="secondary">Pending Review</Badge>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Review Patient Submission</h2>
        <p className="text-muted-foreground">
          Review the information and convert to a patient record
        </p>
      </div>

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Patient Information
          </CardTitle>
          <CardDescription>
            Submitted on {new Date(intakeForm.submitted_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg font-semibold">{intakeForm.full_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{new Date(intakeForm.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="capitalize">{intakeForm.gender}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p>{intakeForm.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{intakeForm.phone}</p>
                </div>
              </div>

              {intakeForm.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p>{intakeForm.address}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {intakeForm.emergency_contact_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                  <p>{intakeForm.emergency_contact_name}</p>
                  {intakeForm.emergency_contact_phone && (
                    <p className="text-sm text-muted-foreground">{intakeForm.emergency_contact_phone}</p>
                  )}
                </div>
              )}

              {intakeForm.insurance_provider && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Insurance Provider</label>
                  <p>{intakeForm.insurance_provider}</p>
                  {intakeForm.insurance_number && (
                    <p className="text-sm text-muted-foreground font-mono">{intakeForm.insurance_number}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason for Visit</label>
                <p className="text-sm bg-blue-50 dark:bg-blue-950/10 p-3 rounded-lg">
                  {intakeForm.reason_for_visit}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      {(intakeForm.allergies || intakeForm.current_medications || intakeForm.medical_conditions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Medical History
            </CardTitle>
            <CardDescription>Important medical information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intakeForm.allergies && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                  <p className="text-sm bg-red-50 dark:bg-red-950/10 p-3 rounded-lg border border-red-200 dark:border-red-900">
                    {intakeForm.allergies}
                  </p>
                </div>
              )}

              {intakeForm.current_medications && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
                  <p className="text-sm bg-blue-50 dark:bg-blue-950/10 p-3 rounded-lg whitespace-pre-wrap">
                    {intakeForm.current_medications}
                  </p>
                </div>
              )}

              {intakeForm.medical_conditions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medical Conditions</label>
                  <p className="text-sm bg-yellow-50 dark:bg-yellow-950/10 p-3 rounded-lg whitespace-pre-wrap">
                    {intakeForm.medical_conditions}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Form */}
      {!intakeForm.is_processed ? (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle>Convert to Patient Record</CardTitle>
            <CardDescription>
              This will create a new patient record with the information above
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProcessIntakeForm intakeForm={intakeForm} doctorId={doctor?.id} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 dark:border-green-900 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Already Processed</h3>
                <p className="text-sm text-muted-foreground">
                  This intake form has been converted to a patient record
                </p>
              </div>
              {intakeForm.patient_id && (
                <Link href={`/patients/${intakeForm.patient_id}`}>
                  <Button>View Patient Record</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
