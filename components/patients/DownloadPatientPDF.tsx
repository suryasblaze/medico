'use client'

import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface DownloadPatientPDFProps {
  patientId: string
  patientName: string
}

export function DownloadPatientPDF({ patientId, patientName }: DownloadPatientPDFProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/patients/${patientId}/pdf`)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const html = await response.text()
      const printWindow = window.open('', '_blank')

      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()

        // Wait for content to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  )
}
