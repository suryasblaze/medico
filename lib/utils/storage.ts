import { createClient } from '@/lib/supabase/client'

export interface UploadedFile {
  field_id: string
  file_url: string
  file_name: string
  file_size: number
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFormFile(
  doctorId: string,
  formId: string,
  submissionId: string,
  fieldId: string,
  file: File
): Promise<UploadedFile> {
  const supabase = createClient()

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB')
  }

  // Validate file type (images and PDFs only)
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ]
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only images and PDF files are allowed')
  }

  // Generate file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filePath = `${doctorId}/${formId}/${submissionId}/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('form-attachments')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('form-attachments').getPublicUrl(filePath)

  return {
    field_id: fieldId,
    file_url: publicUrl,
    file_name: file.name,
    file_size: file.size,
  }
}

/**
 * Upload multiple files for a form submission
 */
export async function uploadFormFiles(
  doctorId: string,
  formId: string,
  submissionId: string,
  files: { fieldId: string; file: File }[]
): Promise<UploadedFile[]> {
  const uploadPromises = files.map((f) =>
    uploadFormFile(doctorId, formId, submissionId, f.fieldId, f.file)
  )

  return Promise.all(uploadPromises)
}
