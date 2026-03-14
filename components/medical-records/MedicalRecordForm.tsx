'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DocumentType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Highlighter,
  Paperclip,
  X,
  FileText,
  FileImage,
  File,
  Loader2,
  Calendar,
} from 'lucide-react'

interface MedicalRecordFormProps {
  patientId: string
  doctorId: string
  onSuccess?: () => void
  record?: {
    id: string
    visit_date: string
    notes: string
  }
  onCancel?: () => void
}

interface PendingFile {
  file: File
  documentType: DocumentType
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'other', label: 'Other' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4 text-blue-600" />
  if (fileType === 'application/pdf') return <FileText className="h-4 w-4 text-red-600" />
  return <File className="h-4 w-4 text-gray-600" />
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function MedicalRecordForm({ patientId, doctorId, onSuccess, record, onCancel }: MedicalRecordFormProps) {
  const router = useRouter()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [visitDate, setVisitDate] = useState(record?.visit_date || new Date().toISOString().split('T')[0])
  const isEditing = !!record

  // Set initial content when editing
  useEffect(() => {
    if (record && editorRef.current) {
      editorRef.current.innerHTML = record.notes || ''
    }
  }, [record])

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: PendingFile[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large. Max size is 10MB.`)
        continue
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`File "${file.name}" type not supported.`)
        continue
      }
      newFiles.push({ file, documentType: 'other' })
    }

    setPendingFiles([...pendingFiles, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== index))
  }

  const updateFileType = (index: number, type: DocumentType) => {
    const updated = [...pendingFiles]
    updated[index].documentType = type
    setPendingFiles(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const notes = editorRef.current?.innerHTML || ''

    if (!notes.trim() || notes === '<br>') {
      setError('Please add some notes')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      let recordId = record?.id

      if (isEditing && record) {
        // Update existing medical record
        const { error: updateError } = await supabase
          .from('medical_records')
          .update({
            visit_date: visitDate,
            notes: notes,
          })
          .eq('id', record.id)

        if (updateError) throw updateError
      } else {
        // Insert new medical record
        const { data: newRecord, error: insertError } = await supabase
          .from('medical_records')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            visit_date: visitDate,
            notes: notes,
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        recordId = newRecord?.id
      }

      // Upload files (only for new records or new files added during edit)
      if (pendingFiles.length > 0 && recordId) {
        for (const pending of pendingFiles) {
          const fileName = `${Date.now()}_${pending.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          const filePath = `${doctorId}/${patientId}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('patient-documents')
            .upload(filePath, pending.file)

          if (uploadError) continue

          const { data: urlData } = supabase.storage
            .from('patient-documents')
            .getPublicUrl(filePath)

          await supabase.from('patient_documents').insert({
            patient_id: patientId,
            doctor_id: doctorId,
            medical_record_id: recordId,
            file_name: pending.file.name,
            file_url: urlData.publicUrl,
            file_size: pending.file.size,
            file_type: pending.file.type,
            document_type: pending.documentType,
          })
        }
      }

      if (onSuccess) {
        onSuccess()
        // Hard refresh to show new record immediately
        window.location.reload()
      } else {
        router.push(`/patients/${patientId}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save medical record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div className="space-y-1">
          <Label htmlFor="visit_date">Visit Date</Label>
          <Input
            id="visit_date"
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-48"
            required
          />
        </div>
      </div>

      {/* Rich Text Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Medical Notes</CardTitle>
          <CardDescription>Write your clinical notes with formatting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('bold')}
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('italic')}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('underline')}
              className="h-8 w-8 p-0"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('insertUnorderedList')}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('insertOrderedList')}
              className="h-8 w-8 p-0"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('backColor', '#fef08a')}
              className="h-8 w-8 p-0"
              title="Highlight"
            >
              <Highlighter className="h-4 w-4 text-yellow-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('backColor', '#bbf7d0')}
              className="h-8 w-8 p-0"
              title="Highlight Green"
            >
              <Highlighter className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('backColor', '#fecaca')}
              className="h-8 w-8 p-0"
              title="Highlight Red"
            >
              <Highlighter className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => execCommand('removeFormat')}
              className="h-8 px-2 text-xs"
              title="Clear Formatting"
            >
              Clear
            </Button>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[300px] p-4 border rounded-lg bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm dark:prose-invert max-w-none"
            style={{ whiteSpace: 'pre-wrap' }}
            onPaste={(e) => {
              e.preventDefault()
              const text = e.clipboardData.getData('text/plain')
              document.execCommand('insertText', false, text)
            }}
          />
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments
          </CardTitle>
          <CardDescription>Upload lab reports, imaging, or other documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              ref={fileInputRef}
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              multiple
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              {pendingFiles.map((pending, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  {getFileIcon(pending.file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pending.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(pending.file.size)}</p>
                  </div>
                  <Select
                    value={pending.documentType}
                    onValueChange={(v) => updateFileType(index, v as DocumentType)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            'Update Record'
          ) : (
            'Save Record'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
