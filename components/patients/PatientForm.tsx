'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Patient } from '@/types'
import { patientSchema, type PatientFormData } from '@/lib/validations/patient'
import { Camera, Loader2, X, Plus, Phone, Upload } from 'lucide-react'
import { AvatarImage } from '@/components/ui/optimized-image'

interface PatientFormProps {
  doctorId: string
  patient?: Patient
}

export function PatientForm({ doctorId, patient }: PatientFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null)
  const [isUnder18, setIsUnder18] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(patient?.avatar_url || null)
  const [loadingMrn, setLoadingMrn] = useState(!patient)

  const [formData, setFormData] = useState<PatientFormData>({
    full_name: patient?.full_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    phone_numbers: patient?.phone_numbers || [''],
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || undefined,
    address: patient?.address || '',
    city: patient?.city || '',
    state: patient?.state || '',
    postal_code: patient?.postal_code || '',
    parent_guardian_name: (patient as any)?.parent_guardian_name || '',
    parent_guardian_phone: (patient as any)?.parent_guardian_phone || '',
    medical_record_number: patient?.medical_record_number || '',
    notes: patient?.notes || '',
  })

  const addPhoneNumber = () => {
    setFormData({
      ...formData,
      phone_numbers: [...(formData.phone_numbers || []), ''],
    })
  }

  const removePhoneNumber = (index: number) => {
    const newPhones = [...(formData.phone_numbers || [])]
    newPhones.splice(index, 1)
    setFormData({ ...formData, phone_numbers: newPhones.length ? newPhones : [''] })
  }

  const updatePhoneNumber = (index: number, value: string) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    const newPhones = [...(formData.phone_numbers || [])]
    newPhones[index] = digitsOnly
    setFormData({ ...formData, phone_numbers: newPhones, phone: newPhones[0] || '' })
  }

  // Check if a phone number is duplicate
  const isDuplicatePhone = (phone: string, index: number): boolean => {
    if (!phone.trim()) return false
    const phones = formData.phone_numbers || []
    return phones.some((p, i) => i !== index && p.trim() === phone.trim())
  }

  // Check if phone number is valid (exactly 10 digits)
  const isInvalidPhone = (phone: string): boolean => {
    if (!phone) return false
    return phone.length > 0 && phone.length !== 10
  }

  // Check if there are any duplicate phone numbers
  const hasDuplicatePhones = (): boolean => {
    const phones = (formData.phone_numbers || []).filter(p => p.trim())
    const uniquePhones = new Set(phones.map(p => p.trim()))
    return phones.length !== uniquePhones.size
  }

  // Check if all phone numbers are valid (10 digits)
  const hasInvalidPhones = (): boolean => {
    const phones = (formData.phone_numbers || []).filter(p => p.trim())
    return phones.some(p => p.length !== 10)
  }

  const calculateAge = (dob: string): number => {
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

  useEffect(() => {
    const age = calculateAge(formData.date_of_birth || '')
    setIsUnder18(age > 0 && age < 18)
  }, [formData.date_of_birth])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Set video stream after video element renders
  useEffect(() => {
    if (showCamera && pendingStream && videoRef.current) {
      videoRef.current.srcObject = pendingStream
      videoRef.current.play().catch(console.error)
      streamRef.current = pendingStream
      setPendingStream(null)
    }
  }, [showCamera, pendingStream])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      setPendingStream(stream)
      setShowCamera(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
          await handleAvatarUploadFile(file)
        }
      }, 'image/jpeg', 0.9)
    }
    stopCamera()
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (pendingStream) {
      pendingStream.getTracks().forEach(track => track.stop())
      setPendingStream(null)
    }
    setShowCamera(false)
  }

  const handleAvatarUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${doctorId}/${patient?.id || 'new'}/${fileName}`

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/patient-avatars/')[1]
        if (oldPath) {
          await supabase.storage.from('patient-avatars').remove([oldPath])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('patient-avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('patient-avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(urlData.publicUrl)

      if (patient) {
        await supabase
          .from('patients')
          .update({ avatar_url: urlData.publicUrl })
          .eq('id', patient.id)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Auto-generate VRN for new patients
  useEffect(() => {
    if (patient) return // Skip for existing patients

    const generateVrn = async () => {
      try {
        const supabase = createClient()

        // Get the highest VRN number for this doctor
        const { data, error } = await supabase
          .from('patients')
          .select('medical_record_number')
          .eq('doctor_id', doctorId)
          .not('medical_record_number', 'is', null)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Find the highest number from existing VRNs
        let maxNumber = 0
        if (data) {
          for (const p of data) {
            const vrn = p.medical_record_number
            if (vrn) {
              // Extract number from VRN (handles both "VRN-0001" and "1" formats)
              const match = vrn.match(/(\d+)/)
              if (match) {
                const num = parseInt(match[1], 10)
                if (num > maxNumber) maxNumber = num
              }
            }
          }
        }

        // Generate next VRN with padding (e.g., VRN-0001)
        const nextNumber = maxNumber + 1
        const newVrn = `VRN-${nextNumber.toString().padStart(4, '0')}`

        setFormData(prev => ({ ...prev, medical_record_number: newVrn }))
      } catch (err) {
        console.error('Failed to generate VRN:', err)
        // Fallback to simple number
        setFormData(prev => ({ ...prev, medical_record_number: 'VRN-0001' }))
      } finally {
        setLoadingMrn(false)
      }
    }

    generateVrn()
  }, [doctorId, patient])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleAvatarUploadFile(file)
  }

  const removeAvatar = async () => {
    if (!avatarUrl) return

    setUploadingAvatar(true)
    try {
      const supabase = createClient()
      const oldPath = avatarUrl.split('/patient-avatars/')[1]
      if (oldPath) {
        await supabase.storage.from('patient-avatars').remove([oldPath])
      }
      setAvatarUrl(null)

      if (patient) {
        await supabase
          .from('patients')
          .update({ avatar_url: null })
          .eq('id', patient.id)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for duplicate phone numbers
    if (hasDuplicatePhones()) {
      setError('Please remove duplicate phone numbers before submitting')
      return
    }

    // Check for invalid phone numbers (not 10 digits)
    if (hasInvalidPhones()) {
      setError('All phone numbers must be exactly 10 digits')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const validatedData = patientSchema.parse(formData)
      const supabase = createClient()

      if (patient) {
        const { error } = await supabase
          .from('patients')
          .update({ ...validatedData, avatar_url: avatarUrl })
          .eq('id', patient.id)

        if (error) throw error

        // Stay on page and hard refresh to show updated data
        window.location.reload()
      } else {
        const { error } = await supabase
          .from('patients')
          .insert({
            ...validatedData,
            doctor_id: doctorId,
            avatar_url: avatarUrl,
          })

        if (error) throw error

        router.push('/patients')
        router.refresh()
      }
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message)
      } else {
        setError(err.message || 'Failed to save patient')
      }
    } finally {
      setLoading(false)
    }
  }

  const initials = formData.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => !showCamera && fileInputRef.current?.click()}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={formData.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || <Camera className="h-8 w-8" />
              )}
            </div>
            {avatarUrl && !uploadingAvatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Upload or take a photo (max 5MB)
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar || showCamera}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                disabled={uploadingAvatar || showCamera}
              >
                <Camera className="h-4 w-4 mr-1" />
                Camera
              </Button>
            </div>
          </div>
        </div>

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center gap-2">
              <Button type="button" onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-1" />
                Capture
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_record_number">
              VR Number (VRN)
            </Label>
            <Input
              id="medical_record_number"
              value={loadingMrn ? 'Generating...' : formData.medical_record_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medical_record_number: e.target.value,
                })
              }
              disabled={loading || loadingMrn || !patient}
              readOnly={!patient}
              className={!patient ? 'bg-muted' : ''}
            />
            {!patient && (
              <p className="text-xs text-muted-foreground">Auto-generated</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              disabled={loading}
            />
            {isUnder18 && (
              <p className="text-xs text-orange-600">
                Patient is under 18 - Parent/Guardian information required below
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: any) =>
                setFormData({ ...formData, gender: value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Phone Numbers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhoneNumber}
                disabled={loading}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.phone_numbers || ['']).map((phone, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDuplicatePhone(phone, index) || isInvalidPhone(phone) ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <Input
                        type="tel"
                        placeholder={index === 0 ? '10-digit phone number' : 'Additional phone (10 digits)'}
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        disabled={loading}
                        maxLength={10}
                        className={`pl-9 ${isDuplicatePhone(phone, index) || isInvalidPhone(phone) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{phone.length}/10</span>
                    </div>
                  {(formData.phone_numbers?.length || 0) > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  </div>
                  {isDuplicatePhone(phone, index) && (
                    <p className="text-xs text-red-500 pl-9">This phone number is already added</p>
                  )}
                  {!isDuplicatePhone(phone, index) && isInvalidPhone(phone) && (
                    <p className="text-xs text-red-500 pl-9">Phone number must be exactly 10 digits</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) =>
                setFormData({ ...formData, postal_code: e.target.value })
              }
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information - Only for patients under 18 */}
      {isUnder18 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Parent/Guardian Information <span className="text-destructive">*</span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parent_guardian_name">
                Parent/Guardian Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="parent_guardian_name"
                value={formData.parent_guardian_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_guardian_name: e.target.value,
                  })
                }
                placeholder="Parent or Guardian Name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_guardian_phone">
                Parent/Guardian Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="parent_guardian_phone"
                type="tel"
                value={formData.parent_guardian_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_guardian_phone: e.target.value,
                  })
                }
                placeholder="+1 (555) 987-6543"
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Reason for Visit */}
      <div className="space-y-2">
        <Label htmlFor="notes">Reason for Visit</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="Please describe your reason for visiting..."
          rows={4}
          disabled={loading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : patient ? 'Update Patient' : 'Add Patient'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
