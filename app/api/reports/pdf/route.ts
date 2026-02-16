import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { generatePatientListPDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { month, reportType, doctorId } = await request.json()

    const supabase = createClient()

    // Get doctor info
    const { data: doctor } = await supabase
      .from('doctors')
      .select('full_name, clinic_name')
      .eq('id', doctorId)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const header = {
      clinicName: doctor.clinic_name || `${doctor.full_name}'s Practice`,
      doctorName: doctor.full_name,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    let htmlContent = ''

    if (reportType === 'patient-list') {
      // Fetch all patients
      const { data: patients } = await supabase
        .from('patients')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('full_name', { ascending: true })

      htmlContent = generatePatientListPDF(patients || [], header)
    }

    // Return HTML that will be printed to PDF by the browser
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
