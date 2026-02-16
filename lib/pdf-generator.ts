// PDF Generator utility
// Creates professional-looking PDFs for reports and patient records

export interface PDFHeader {
  clinicName: string
  doctorName: string
  date: string
}

export interface PatientData {
  full_name: string
  medical_record_number?: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
  blood_type?: string
  insurance_provider?: string
  insurance_number?: string
}

export interface MedicalRecord {
  visit_date: string
  visit_type?: string
  chief_complaint?: string
  diagnosis?: string
  treatment_plan?: string
  medications_prescribed?: string
  vitals?: {
    temperature?: number
    blood_pressure?: string
    heart_rate?: number
    weight?: number
    height?: number
  }
}

export function generatePatientListPDF(
  patients: any[],
  header: PDFHeader
): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Patient List Report</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #333;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1e40af;
          font-size: 24pt;
          margin-bottom: 5px;
        }
        .header .clinic-name {
          font-size: 14pt;
          color: #6b7280;
          margin-bottom: 3px;
        }
        .header .date {
          font-size: 10pt;
          color: #9ca3af;
        }
        .report-title {
          font-size: 18pt;
          color: #1f2937;
          margin-bottom: 20px;
          text-align: center;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          padding: 15px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 24pt;
          font-weight: bold;
          color: #2563eb;
        }
        .stat-label {
          font-size: 10pt;
          color: #6b7280;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #2563eb;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10pt;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 9pt;
        }
        tr:hover {
          background: #f9fafb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 9pt;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Patient List Report</h1>
        <div class="clinic-name">${header.clinicName}</div>
        <div class="clinic-name">Dr. ${header.doctorName}</div>
        <div class="date">Generated on ${header.date}</div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${patients.length}</div>
          <div class="stat-label">Total Patients</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>MRN</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>DOB</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map(p => `
            <tr>
              <td>${p.medical_record_number || 'N/A'}</td>
              <td><strong>${p.full_name}</strong></td>
              <td>${p.email || 'N/A'}</td>
              <td>${p.phone || 'N/A'}</td>
              <td>${p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : 'N/A'}</td>
              <td>${p.gender || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This document is confidential and intended for authorized use only.</p>
        <p>${header.clinicName} | Dr. ${header.doctorName}</p>
      </div>
    </body>
    </html>
  `
  return html
}

export function generatePatientRecordPDF(
  patient: PatientData,
  medicalRecords: MedicalRecord[],
  header: PDFHeader
): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Patient Record - ${patient.full_name}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 3px solid #2563eb;
          margin-bottom: 25px;
        }
        .header h1 {
          color: #1e40af;
          font-size: 20pt;
          margin-bottom: 5px;
        }
        .header .clinic-name {
          font-size: 12pt;
          color: #6b7280;
        }
        .patient-header {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        .patient-header h2 {
          font-size: 18pt;
          margin-bottom: 8px;
        }
        .patient-header .mrn {
          font-size: 11pt;
          opacity: 0.9;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 14pt;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .info-item {
          padding: 10px;
          background: #f9fafb;
          border-radius: 6px;
        }
        .info-label {
          font-size: 9pt;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 11pt;
          color: #1f2937;
        }
        .alert-box {
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .alert-title {
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 5px;
        }
        .medical-record {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          background: white;
        }
        .record-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .record-date {
          font-weight: 600;
          color: #2563eb;
        }
        .record-type {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 9pt;
          text-transform: uppercase;
        }
        .record-content {
          font-size: 10pt;
        }
        .record-section {
          margin-bottom: 10px;
        }
        .record-section strong {
          color: #1f2937;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 9pt;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${header.clinicName}</h1>
        <div class="clinic-name">Dr. ${header.doctorName}</div>
        <div class="clinic-name">Generated on ${header.date}</div>
      </div>

      <div class="patient-header">
        <h2>${patient.full_name}</h2>
        <div class="mrn">MRN: ${patient.medical_record_number || 'Not Assigned'}</div>
      </div>

      <!-- Patient Information -->
      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${patient.email || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${patient.phone || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date of Birth</div>
            <div class="info-value">${patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Gender</div>
            <div class="info-value">${patient.gender || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Blood Type</div>
            <div class="info-value">${patient.blood_type || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Insurance</div>
            <div class="info-value">${patient.insurance_provider || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Medical History -->
      ${patient.allergies || patient.current_medications || patient.medical_conditions ? `
        <div class="section">
          <div class="section-title">Medical History</div>
          ${patient.allergies ? `
            <div class="alert-box">
              <div class="alert-title">Allergies</div>
              <div>${patient.allergies}</div>
            </div>
          ` : ''}
          ${patient.current_medications ? `
            <div class="info-item" style="margin-bottom: 10px;">
              <div class="info-label">Current Medications</div>
              <div class="info-value">${patient.current_medications}</div>
            </div>
          ` : ''}
          ${patient.medical_conditions ? `
            <div class="info-item">
              <div class="info-label">Medical Conditions</div>
              <div class="info-value">${patient.medical_conditions}</div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Medical Records -->
      ${medicalRecords.length > 0 ? `
        <div class="section">
          <div class="section-title">Medical Records (${medicalRecords.length} visits)</div>
          ${medicalRecords.map(record => `
            <div class="medical-record">
              <div class="record-header">
                <div class="record-date">${new Date(record.visit_date).toLocaleDateString()}</div>
                <div class="record-type">${record.visit_type || 'Visit'}</div>
              </div>
              <div class="record-content">
                ${record.chief_complaint ? `
                  <div class="record-section">
                    <strong>Chief Complaint:</strong> ${record.chief_complaint}
                  </div>
                ` : ''}
                ${record.diagnosis ? `
                  <div class="record-section">
                    <strong>Diagnosis:</strong> ${record.diagnosis}
                  </div>
                ` : ''}
                ${record.treatment_plan ? `
                  <div class="record-section">
                    <strong>Treatment Plan:</strong> ${record.treatment_plan}
                  </div>
                ` : ''}
                ${record.medications_prescribed ? `
                  <div class="record-section">
                    <strong>Medications:</strong> ${record.medications_prescribed}
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="footer">
        <p>This document contains confidential patient information.</p>
        <p>${header.clinicName} | Dr. ${header.doctorName}</p>
      </div>
    </body>
    </html>
  `
  return html
}
