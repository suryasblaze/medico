import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { month, reportType, doctorId } = await request.json()

    const supabase = createClient()

    // Get doctor info
    const { data: doctor } = await supabase
      .from('doctors')
      .select('full_name, clinic_name')
      .eq('id', doctorId)
      .maybeSingle()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    // Parse month (format: YYYY-MM)
    const [year, monthNum] = month.split('-')
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0)

    let csvContent = ''
    let filename = ''

    switch (reportType) {
      case 'patient-visits':
        // Fetch medical records for the month
        const { data: visits } = await supabase
          .from('medical_records')
          .select('*, patients(full_name, email, phone, medical_record_number)')
          .eq('doctor_id', doctorId)
          .gte('visit_date', startDate.toISOString())
          .lte('visit_date', endDate.toISOString())
          .order('visit_date', { ascending: false })

        csvContent = 'Date,Patient Name,MRN,Visit Type,Diagnosis,Treatment\n'
        visits?.forEach((visit: any) => {
          csvContent += `${new Date(visit.visit_date).toLocaleDateString()},${visit.patients?.full_name || 'N/A'},${visit.patients?.medical_record_number || 'N/A'},${visit.visit_type || 'N/A'},${visit.diagnosis || 'N/A'},${visit.treatment_plan || 'N/A'}\n`
        })
        filename = `patient-visits-${month}.csv`
        break

      case 'patient-list':
        // Fetch all patients
        const { data: patients } = await supabase
          .from('patients')
          .select('*')
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false })

        csvContent = 'MRN,Name,Email,Phone,DOB,Gender,Created Date\n'
        patients?.forEach((patient: any) => {
          csvContent += `${patient.medical_record_number || 'N/A'},${patient.full_name},${patient.email || 'N/A'},${patient.phone || 'N/A'},${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'},${patient.gender || 'N/A'},${new Date(patient.created_at).toLocaleDateString()}\n`
        })
        filename = `patient-list-${month}.csv`
        break

      case 'medical-records':
        // Fetch medical records summary
        const { data: records } = await supabase
          .from('medical_records')
          .select('*, patients(full_name, medical_record_number)')
          .eq('doctor_id', doctorId)
          .gte('visit_date', startDate.toISOString())
          .lte('visit_date', endDate.toISOString())
          .order('visit_date', { ascending: false })

        csvContent = 'Date,Patient,MRN,Chief Complaint,Diagnosis,Medications Prescribed\n'
        records?.forEach((record: any) => {
          csvContent += `${new Date(record.visit_date).toLocaleDateString()},${record.patients?.full_name || 'N/A'},${record.patients?.medical_record_number || 'N/A'},${record.chief_complaint || 'N/A'},${record.diagnosis || 'N/A'},${record.medications_prescribed || 'N/A'}\n`
        })
        filename = `medical-records-${month}.csv`
        break

      case 'statistics':
        // Fetch statistics
        const { count: totalPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)

        const { count: monthVisits } = await supabase
          .from('medical_records')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .gte('visit_date', startDate.toISOString())
          .lte('visit_date', endDate.toISOString())

        const { data: visitsByType } = await supabase
          .from('medical_records')
          .select('visit_type')
          .eq('doctor_id', doctorId)
          .gte('visit_date', startDate.toISOString())
          .lte('visit_date', endDate.toISOString())

        const visitTypeCounts: Record<string, number> = {}
        visitsByType?.forEach((v: any) => {
          visitTypeCounts[v.visit_type || 'other'] = (visitTypeCounts[v.visit_type || 'other'] || 0) + 1
        })

        csvContent = `Monthly Statistics for ${doctor.clinic_name || doctor.full_name}\n`
        csvContent += `Month: ${new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n\n`
        csvContent += 'Metric,Value\n'
        csvContent += `Total Patients,${totalPatients || 0}\n`
        csvContent += `Visits This Month,${monthVisits || 0}\n`
        csvContent += `\nVisit Types:\n`
        Object.entries(visitTypeCounts).forEach(([type, count]) => {
          csvContent += `${type},${count}\n`
        })
        filename = `statistics-${month}.csv`
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
