'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils/formatters'
import { Download, FileText, Mail, Phone, User } from 'lucide-react'
import { getFieldTypeDefinition } from '@/lib/constants/field-types'

interface SubmissionDetailProps {
  submission: any
  formFields: any[]
  doctorId: string
}

export function SubmissionDetail({
  submission,
  formFields,
  doctorId,
}: SubmissionDetailProps) {
  const renderFieldResponse = (field: any) => {
    const response = submission.responses?.[field.id]

    if (!response && response !== 0 && response !== false) {
      return <span className="text-muted-foreground italic">No response</span>
    }

    // Handle arrays (checkboxes)
    if (Array.isArray(response)) {
      return (
        <div className="flex flex-wrap gap-2">
          {response.map((item, index) => (
            <Badge key={index} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      )
    }

    // Handle boolean
    if (typeof response === 'boolean') {
      return <Badge variant={response ? 'default' : 'secondary'}>{response ? 'Yes' : 'No'}</Badge>
    }

    // Handle dates
    if (field.field_type === 'date') {
      return formatDate(response)
    }

    // Default text response
    return <p className="whitespace-pre-wrap">{response}</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submission Details</h2>
          <p className="text-muted-foreground">{submission.forms?.title}</p>
        </div>
        {submission.is_read ? (
          <Badge variant="secondary">Read</Badge>
        ) : (
          <Badge>New</Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submission Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Info */}
            {submission.patient_name && (
              <div className="space-y-4">
                <h3 className="font-semibold">Patient Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{submission.patient_name}</p>
                    </div>
                  </div>
                  {submission.patient_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{submission.patient_email}</p>
                      </div>
                    </div>
                  )}
                  {submission.patient_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{submission.patient_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
              </div>
            )}

            {/* Form Responses */}
            <div className="space-y-4">
              <h3 className="font-semibold">Form Responses</h3>
              {formFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No fields in this form</p>
              ) : (
                <div className="space-y-6">
                  {formFields.map((field) => {
                    const fieldDef = getFieldTypeDefinition(field.field_type)
                    const Icon = fieldDef.icon

                    return (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{field.label}</p>
                          {field.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="pl-6">{renderFieldResponse(field)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* File Attachments */}
            {submission.attachments && submission.attachments.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold">Attachments</h3>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment: any, index: number) => {
                      const field = formFields.find((f) => f.id === attachment.field_id)
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{attachment.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {field?.label || 'Unknown field'} •{' '}
                                {(attachment.file_size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Button variant="ghost" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submission ID</p>
              <p className="font-mono text-sm">{submission.id.slice(0, 8)}...</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Form</p>
              <p className="text-sm">{submission.forms?.title}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
              <p className="text-sm">{formatDate(submission.submitted_at)}</p>
            </div>

            {submission.viewed_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Viewed At</p>
                <p className="text-sm">{formatDate(submission.viewed_at)}</p>
              </div>
            )}

            {submission.user_agent && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Browser</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {submission.user_agent}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
