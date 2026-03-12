'use client'

import { Patient, MedicalRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Activity,
} from 'lucide-react'

interface PatientViewDetailsProps {
  patient: Patient
  medicalRecords: MedicalRecord[]
}

export function PatientViewDetails({ patient, medicalRecords }: PatientViewDetailsProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return '-'
    return gender.charAt(0).toUpperCase() + gender.slice(1).replace('_', ' ')
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-fuchsia-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base font-semibold">{patient.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Medical Record Number</p>
              <p className="text-base font-mono">{patient.medical_record_number || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-base">{formatDate(patient.date_of_birth)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <Badge variant="outline">{formatGender(patient.gender)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-fuchsia-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </p>
              <p className="text-base">{patient.email || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Numbers
              </p>
              <div className="space-y-1">
                {patient.phone_numbers && patient.phone_numbers.length > 0 ? (
                  patient.phone_numbers.map((phone, index) => (
                    <p key={index} className="text-base">
                      {phone}
                      {index === 0 && <span className="text-xs text-muted-foreground ml-2">(Primary)</span>}
                    </p>
                  ))
                ) : patient.phone ? (
                  <p className="text-base">{patient.phone}</p>
                ) : (
                  <p className="text-base">-</p>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </p>
              <p className="text-base">
                {[patient.address, patient.city, patient.state, patient.postal_code]
                  .filter(Boolean)
                  .join(', ') || '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
              <p className="text-base">{patient.emergency_contact_name || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
              <p className="text-base">{patient.emergency_contact_phone || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-fuchsia-600" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{patient.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Medical Records Summary */}
      {medicalRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-green-600" />
              Recent Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicalRecords.slice(0, 3).map((record) => {
                // Get preview text (strip HTML and truncate)
                const previewText = record.notes
                  ?.replace(/<[^>]*>/g, '')
                  .replace(/&nbsp;/g, ' ')
                  .trim()
                  .slice(0, 150)

                return (
                  <div
                    key={record.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {formatDate(record.visit_date)}
                        </span>
                      </div>
                      {previewText && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {previewText}...
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
              {medicalRecords.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  + {medicalRecords.length - 3} more records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Patient since: {formatDate(patient.created_at)}</span>
            {patient.updated_at && (
              <span>Last updated: {formatDate(patient.updated_at)}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
