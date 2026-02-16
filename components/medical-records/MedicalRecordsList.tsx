'use client'

import { useState } from 'react'
import { MedicalRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, FileText, Pill, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/formatters'

interface MedicalRecordsListProps {
  records: MedicalRecord[]
}

export function MedicalRecordsList({ records }: MedicalRecordsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const visitTypeColors = {
    consultation: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
    follow_up: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
    emergency: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
    routine_checkup: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
    procedure: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No medical records yet. Add the first visit record.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {records.map((record) => {
        const isExpanded = expandedId === record.id
        const visitType = record.visit_type || 'other'

        return (
          <Card key={record.id} className="overflow-hidden">
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {formatDateShort(record.visit_date)}
                    </CardTitle>
                    <Badge className={visitTypeColors[visitType as keyof typeof visitTypeColors]}>
                      {visitType.replace('_', ' ')}
                    </Badge>
                  </div>
                  {record.chief_complaint && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {record.chief_complaint}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Quick Vitals Preview */}
              {!isExpanded && (
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  {record.temperature && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{record.temperature}°F</span>
                    </div>
                  )}
                  {record.blood_pressure_systolic && record.blood_pressure_diastolic && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{record.blood_pressure_systolic}/{record.blood_pressure_diastolic}</span>
                    </div>
                  )}
                  {record.heart_rate && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{record.heart_rate} bpm</span>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-6 pt-6 border-t">
                {/* Vitals Section */}
                {(record.temperature || record.blood_pressure_systolic || record.heart_rate || record.weight) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {record.temperature && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Temperature</p>
                          <p className="text-sm font-medium">{record.temperature}°F</p>
                        </div>
                      )}
                      {record.blood_pressure_systolic && record.blood_pressure_diastolic && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="text-sm font-medium">
                            {record.blood_pressure_systolic}/{record.blood_pressure_diastolic}
                          </p>
                        </div>
                      )}
                      {record.heart_rate && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="text-sm font-medium">{record.heart_rate} bpm</p>
                        </div>
                      )}
                      {record.oxygen_saturation && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">O₂ Saturation</p>
                          <p className="text-sm font-medium">{record.oxygen_saturation}%</p>
                        </div>
                      )}
                      {record.weight && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="text-sm font-medium">{record.weight} kg</p>
                        </div>
                      )}
                      {record.height && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Height</p>
                          <p className="text-sm font-medium">{record.height} cm</p>
                        </div>
                      )}
                      {record.bmi && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">BMI</p>
                          <p className="text-sm font-medium">{record.bmi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinical Information */}
                <div className="space-y-4">
                  {record.symptoms && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Symptoms</p>
                      <p className="text-sm">{record.symptoms}</p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Diagnosis</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.clinical_notes && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Clinical Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{record.clinical_notes}</p>
                    </div>
                  )}
                </div>

                {/* Treatment */}
                {(record.treatment_plan || record.medications_prescribed) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-600" />
                      Treatment
                    </h4>
                    {record.treatment_plan && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Treatment Plan</p>
                        <p className="text-sm whitespace-pre-wrap">{record.treatment_plan}</p>
                      </div>
                    )}
                    {record.medications_prescribed && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Medications</p>
                        <p className="text-sm whitespace-pre-wrap">{record.medications_prescribed}</p>
                      </div>
                    )}
                    {record.lab_tests_ordered && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Lab Tests</p>
                        <p className="text-sm whitespace-pre-wrap">{record.lab_tests_ordered}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up */}
                {(record.follow_up_date || record.follow_up_instructions) && (
                  <div className="space-y-2 bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm">Follow-up</h4>
                    {record.follow_up_date && (
                      <p className="text-sm">
                        <span className="font-medium">Next Visit:</span>{' '}
                        {formatDateShort(record.follow_up_date)}
                      </p>
                    )}
                    {record.follow_up_instructions && (
                      <p className="text-sm whitespace-pre-wrap">{record.follow_up_instructions}</p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
