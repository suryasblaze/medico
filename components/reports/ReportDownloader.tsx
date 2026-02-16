'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Loader2 } from 'lucide-react'

interface ReportDownloaderProps {
  doctorId: string
}

export function ReportDownloader({ doctorId }: ReportDownloaderProps) {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  )
  const [selectedReportType, setSelectedReportType] = useState('patient-visits')
  const [loading, setLoading] = useState(false)

  const handleDownload = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true)

      if (format === 'pdf') {
        // Generate PDF by opening in new window and triggering print
        const response = await fetch('/api/reports/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            month: selectedMonth,
            reportType: selectedReportType,
            doctorId: doctorId,
          }),
        })

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
      } else {
        // CSV download
        const response = await fetch('/api/reports/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            month: selectedMonth,
            reportType: selectedReportType,
            doctorId: doctorId,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate report')
        }

        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedReportType}-${selectedMonth}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Select Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, i) => {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
                const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Report Type</label>
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient-visits">Patient Visits Report</SelectItem>
              <SelectItem value="patient-list">Patient List</SelectItem>
              <SelectItem value="medical-records">Medical Records Summary</SelectItem>
              <SelectItem value="statistics">Monthly Statistics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={() => handleDownload('excel')} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Excel/CSV
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => handleDownload('pdf')} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
