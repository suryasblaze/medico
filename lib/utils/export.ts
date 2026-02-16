import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}

/**
 * Export data to Excel
 */
export function exportToExcel(data: any[], filename: string, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetmlsheet;charset=UTF-8',
  })
  saveAs(blob, `${filename}.xlsx`)
}

/**
 * Flatten form submission responses for export
 */
export function flattenSubmissionForExport(submission: any, formFields: any[]) {
  const flattened: any = {
    'Submission ID': submission.id.slice(0, 8),
    'Submitted At': new Date(submission.submitted_at).toLocaleString(),
    'Patient Name': submission.patient_name || 'N/A',
    'Patient Email': submission.patient_email || 'N/A',
    'Patient Phone': submission.patient_phone || 'N/A',
  }

  // Add form field responses
  formFields.forEach((field) => {
    const response = submission.responses?.[field.id]
    if (Array.isArray(response)) {
      flattened[field.label] = response.join(', ')
    } else {
      flattened[field.label] = response || ''
    }
  })

  // Add file attachments
  if (submission.attachments && submission.attachments.length > 0) {
    flattened['Files'] = submission.attachments
      .map((a: any) => a.file_name)
      .join(', ')
  }

  return flattened
}
