'use client'

import { useState } from 'react'
import { MedicalRecord, PatientDocument } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, FileText, ChevronDown, ChevronUp, Paperclip, Eye, FileImage, File, Pencil, Loader2, Lock } from 'lucide-react'
import { formatDateShort } from '@/lib/utils/formatters'

interface MedicalRecordsListProps {
  records: MedicalRecord[]
  documents?: PatientDocument[]
  onEditRecord?: (record: MedicalRecord) => void
  doctorEmail?: string
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-600" />
  if (fileType === 'application/pdf') return <FileText className="h-4 w-4 text-red-600" />
  return <File className="h-4 w-4 text-gray-600" />
}

export function MedicalRecordsList({ records, documents = [], onEditRecord, doctorEmail }: MedicalRecordsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [password, setPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const getRecordDocuments = (recordId: string) => {
    return documents.filter(d => d.medical_record_id === recordId)
  }

  const handleEditClick = (record: MedicalRecord, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRecord(record)
    setPassword('')
    setPasswordError(null)
    setShowPasswordDialog(true)
  }

  const verifyPassword = async () => {
    if (!password.trim()) {
      setPasswordError('Please enter your password')
      return
    }

    setVerifying(true)
    setPasswordError(null)

    try {
      const supabase = createClient()

      // Try to sign in with the current user's email and provided password
      const { error } = await supabase.auth.signInWithPassword({
        email: doctorEmail || '',
        password: password,
      })

      if (error) {
        setPasswordError('Incorrect password. Please try again.')
        return
      }

      // Password verified, proceed to edit
      setShowPasswordDialog(false)
      if (selectedRecord && onEditRecord) {
        onEditRecord(selectedRecord)
      }
    } catch (err) {
      setPasswordError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
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
        const recordDocs = getRecordDocuments(record.id)

        // Get preview text (strip HTML and truncate)
        const previewText = record.notes
          ?.replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim()
          .slice(0, 150)

        return (
          <Card key={record.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : record.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {formatDateShort(record.visit_date)}
                    </CardTitle>
                    {recordDocs.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        <Paperclip className="h-3 w-3" />
                        {recordDocs.length}
                      </span>
                    )}
                  </div>
                  {!isExpanded && previewText && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {previewText}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {onEditRecord && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(record, e)}
                      title="Edit Record"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 border-t">
                {/* Notes Content */}
                <div
                  className="prose prose-sm dark:prose-invert max-w-none py-4"
                  dangerouslySetInnerHTML={{ __html: record.notes || '' }}
                />

                {/* Attachments */}
                {recordDocs.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <Paperclip className="h-4 w-4 text-fuchsia-600" />
                      Attachments ({recordDocs.length})
                    </h4>
                    <div className="grid gap-2">
                      {recordDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.file_type)}
                            <div>
                              <p className="text-sm font-medium">{doc.file_name}</p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(doc.file_url, '_blank')
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-fuchsia-600" />
              Password Required
            </DialogTitle>
            <DialogDescription>
              Enter your login password to edit this medical record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    verifyPassword()
                  }
                }}
                disabled={verifying}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button onClick={verifyPassword} disabled={verifying}>
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Edit'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
