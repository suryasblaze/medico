'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PatientDocument, DocumentType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileText,
  FileImage,
  File,
  Download,
  Trash2,
  Plus,
  X,
  Eye,
  Loader2,
} from 'lucide-react'

interface PatientDocumentsProps {
  patientId: string
  doctorId: string
  documents: PatientDocument[]
  medicalRecordId?: string
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'imaging', label: 'Imaging (X-Ray, MRI, etc.)' },
  { value: 'referral', label: 'Referral Letter' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'consent_form', label: 'Consent Form' },
  { value: 'medical_history', label: 'Medical History' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'other', label: 'Other' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <FileImage className="h-4 w-4 text-blue-600" />
  }
  if (fileType === 'application/pdf') {
    return <FileText className="h-4 w-4 text-red-600" />
  }
  return <File className="h-4 w-4 text-gray-600" />
}

function getDocumentTypeBadge(type: DocumentType) {
  const colors: Record<DocumentType, string> = {
    lab_report: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
    prescription: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    imaging: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    referral: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    insurance: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    consent_form: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    medical_history: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    discharge_summary: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }

  const label = DOCUMENT_TYPES.find((t) => t.value === type)?.label || type

  return <Badge className={colors[type]}>{label}</Badge>
}

export function PatientDocuments({
  patientId,
  doctorId,
  documents,
  medicalRecordId,
}: PatientDocumentsProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('other')
  const [description, setDescription] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB')
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only images, PDFs, and Word documents are allowed')
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique file path
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${doctorId}/${patientId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('patient-documents')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('patient-documents')
        .getPublicUrl(filePath)

      // Save document record
      const { error: insertError } = await supabase.from('patient_documents').insert({
        patient_id: patientId,
        doctor_id: doctorId,
        medical_record_id: medicalRecordId || null,
        file_name: selectedFile.name,
        file_url: urlData.publicUrl,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        document_type: documentType,
        description: description || null,
      })

      if (insertError) throw insertError

      // Reset form and close dialog
      setSelectedFile(null)
      setDocumentType('other')
      setDescription('')
      setShowUploadDialog(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Hard refresh to show new document immediately
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (document: PatientDocument) => {
    if (!confirm(`Are you sure you want to delete "${document.file_name}"?`)) return

    setDeleting(document.id)

    try {
      const supabase = createClient()

      // Extract file path from URL
      const urlParts = document.file_url.split('/patient-documents/')
      const filePath = urlParts[1]

      if (filePath) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('patient-documents')
          .remove([filePath])

        if (storageError) {
          console.error('Storage delete error:', storageError)
        }
      }

      // Delete record
      const { error: deleteError } = await supabase
        .from('patient_documents')
        .delete()
        .eq('id', document.id)

      if (deleteError) throw deleteError

      // Hard refresh to show changes immediately
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (document: PatientDocument) => {
    try {
      const supabase = createClient()

      // Extract file path from URL
      const urlParts = document.file_url.split('/patient-documents/')
      const filePath = urlParts[1]

      if (filePath) {
        // Get signed URL (works for private buckets)
        const { data, error } = await supabase.storage
          .from('patient-documents')
          .createSignedUrl(filePath, 3600) // 1 hour expiry

        if (error) throw error
        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank')
          return
        }
      }

      // Fallback to direct URL
      window.open(document.file_url, '_blank')
    } catch (err) {
      console.error('Error getting signed URL:', err)
      // Fallback to direct URL
      window.open(document.file_url, '_blank')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Upload and manage patient documents, reports, and files
            </CardDescription>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a document for this patient. Supported formats: Images, PDF, Word
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      accept={ALLOWED_TYPES.join(',')}
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getFileIcon(selectedFile.type)}
                      <span>{selectedFile.name}</span>
                      <span>({formatFileSize(selectedFile.size)})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ''
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add notes about this document..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">No documents yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Upload documents to keep patient records organized
            </p>
            <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.file_type)}
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getDocumentTypeBadge(doc.document_type)}</TableCell>
                  <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                  <TableCell>
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        title="View/Download"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        disabled={deleting === doc.id}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {error && documents.length > 0 && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
