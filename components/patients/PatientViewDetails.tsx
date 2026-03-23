'use client'

import { Patient, MedicalRecord } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
import { AvatarImage } from '@/components/ui/optimized-image'

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

  const calculateAge = (dob: string | null | undefined): number => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const isUnder18 = calculateAge(patient.date_of_birth) > 0 && calculateAge(patient.date_of_birth) < 18

  const initials = patient.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

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
          <div className="flex gap-6 mb-6">
            {/* Profile Photo with Hover Popup */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                  <AvatarImage
                    src={patient.avatar_url}
                    alt={patient.full_name}
                    size={80}
                    fallback={initials}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="right">
                <div className="flex flex-col items-center gap-2">
                  <AvatarImage
                    src={patient.avatar_url}
                    alt={patient.full_name}
                    size={192}
                    fallback={initials}
                    className="rounded-lg"
                  />
                  <p className="text-sm font-medium">{patient.full_name}</p>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{patient.full_name}</h2>
              <p className="text-sm text-muted-foreground">VRN: {patient.medical_record_number || '-'}</p>
              {isUnder18 && (
                <Badge variant="outline" className="mt-1 text-orange-600 border-orange-600">
                  Under 18
                </Badge>
              )}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base font-semibold">{patient.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">VR Number (VRN)</p>
              <div className="flex items-center gap-3">
                <p className="text-base font-mono">{patient.medical_record_number || '-'}</p>
                <span className="text-xs text-muted-foreground">|</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-muted-foreground">Last Visit:</span>
                  <span className="font-semibold">
                    {medicalRecords?.[0] ? formatDate(medicalRecords[0].visit_date) : 'No visits yet'}
                  </span>
                </div>
              </div>
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

      {/* Parent/Guardian Information - Only for patients under 18 */}
      {isUnder18 && (patient.parent_guardian_name || patient.parent_guardian_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Parent/Guardian Name</p>
                <p className="text-base">{patient.parent_guardian_name || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Parent/Guardian Phone</p>
                <p className="text-base">{patient.parent_guardian_phone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reason for Visit */}
      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-fuchsia-600" />
              Reason for Visit
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
