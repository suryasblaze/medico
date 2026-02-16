import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generatePatientRecordPDF } from '@/lib/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, full_name, clinic_name')
      .eq('user_id', user?.id)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Fetch patient
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', params.id)
      .eq('doctor_id', doctor.id)
      .single()

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Fetch medical records
    const { data: medicalRecords } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', params.id)
      .order('visit_date', { ascending: false })

    const header = {
      clinicName: doctor.clinic_name || `${doctor.full_name}'s Practice`,
      doctorName: doctor.full_name,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const htmlContent = generatePatientRecordPDF(
      patient,
      medicalRecords || [],
      header
    )

    // Return HTML that will be printed to PDF by the browser
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating patient PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
