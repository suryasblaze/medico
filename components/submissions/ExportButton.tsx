'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportToCSV, exportToExcel, flattenSubmissionForExport } from '@/lib/utils/export'

interface ExportButtonProps {
  submissions: any[]
}

export function ExportButton({ submissions }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true)

    try {
      // Get all unique form fields from submissions
      const allFieldIds = new Set<string>()
      const fieldMap = new Map()

      submissions.forEach((sub) => {
        if (sub.responses) {
          Object.keys(sub.responses).forEach((fieldId) => {
            allFieldIds.add(fieldId)
          })
        }
      })

      // Flatten submissions for export
      const exportData = submissions.map((submission) => {
        // Create a simple flattened version
        const flattened: any = {
          'Submission ID': submission.id.slice(0, 8),
          'Form': submission.forms?.title || 'Unknown',
          'Submitted At': new Date(submission.submitted_at).toLocaleString(),
          'Patient Name': submission.patient_name || 'N/A',
          'Patient Email': submission.patient_email || 'N/A',
          'Patient Phone': submission.patient_phone || 'N/A',
          'Status': submission.is_read ? 'Read' : 'Unread',
        }

        // Add responses
        if (submission.responses) {
          Object.entries(submission.responses).forEach(([fieldId, value]: [string, any]) => {
            const key = `Response_${fieldId.slice(0, 8)}`
            if (Array.isArray(value)) {
              flattened[key] = value.join(', ')
            } else {
              flattened[key] = value
            }
          })
        }

        // Add file count
        if (submission.attachments && submission.attachments.length > 0) {
          flattened['Files Attached'] = submission.attachments.length
        }

        return flattened
      })

      // Export based on format
      const filename = `submissions_${new Date().toISOString().split('T')[0]}`

      if (format === 'csv') {
        exportToCSV(exportData, filename)
      } else {
        exportToExcel(exportData, filename, 'Submissions')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
