'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, User } from 'lucide-react'
import type { Prescription } from '@/types'

interface PrescriptionsListProps {
  prescriptions: Prescription[]
}

export function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-fuchsia-700 dark:text-fuchsia-400">
          <FileText className="h-5 w-5" />
          Recent Prescriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="flex items-center justify-between p-4 rounded-lg border border-fuchsia-100 dark:border-fuchsia-900/30 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-950/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-100 to-orange-100 dark:from-fuchsia-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {prescription.patient_name}
                    </span>
                    {prescription.patient_age && (
                      <Badge variant="secondary" className="text-xs">
                        {prescription.patient_age} yrs
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                    {prescription.prescription_text.substring(0, 100)}
                    {prescription.prescription_text.length > 100 ? '...' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                {formatDate(prescription.prescription_date)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
