'use client'

import { useState, useRef, useEffect } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { Camera, CheckCircle, Loader2, Phone, Plus, X } from 'lucide-react'

interface IntakeFormClientProps {
  doctorId: string
}

export function IntakeFormClient({ doctorId }: IntakeFormClientProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([''])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [isUnder18, setIsUnder18] = useState(false)
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Set video stream after video element renders
  useEffect(() => {
    if (showCamera && pendingStream && videoRef.current) {
      videoRef.current.srcObject = pendingStream
      videoRef.current.play().catch(console.error)
      streamRef.current = pendingStream
      setPendingStream(null)
    }
  }, [showCamera, pendingStream])
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    parent_guardian_name: '',
    parent_guardian_phone: '',
    notes: '',
  })

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
    const age = calculateAge(formData.date_of_birth)
    setIsUnder18(age > 0 && age < 18)
  }, [formData.date_of_birth])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ''])
  }

  const removePhoneNumber = (index: number) => {
    const newPhones = [...phoneNumbers]
    newPhones.splice(index, 1)
    setPhoneNumbers(newPhones.length ? newPhones : [''])
  }

  const updatePhoneNumber = (index: number, value: string) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    const newPhones = [...phoneNumbers]
    newPhones[index] = digitsOnly
    setPhoneNumbers(newPhones)
    setFormData({ ...formData, phone: newPhones[0] || '' })
  }

  // Check if a phone number is duplicate
  const isDuplicatePhone = (phone: string, index: number): boolean => {
    if (!phone.trim()) return false
    return phoneNumbers.some((p, i) => i !== index && p.trim() === phone.trim())
  }

  // Check if phone number is valid (exactly 10 digits)
  const isInvalidPhone = (phone: string): boolean => {
    if (!phone) return false
    return phone.length > 0 && phone.length !== 10
  }

  // Check if there are any duplicate phone numbers
  const hasDuplicatePhones = (): boolean => {
    const phones = phoneNumbers.filter(p => p.trim())
    const uniquePhones = new Set(phones.map(p => p.trim()))
    return phones.length !== uniquePhones.size
  }

  // Check if all phone numbers are valid (10 digits)
  const hasInvalidPhones = (): boolean => {
    const phones = phoneNumbers.filter(p => p.trim())
    return phones.some(p => p.length !== 10)
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const supabase = createClient()
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${doctorId}/intake/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('patient-avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('patient-avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(urlData.publicUrl)
    } catch (err: any) {
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      setPendingStream(stream)
      setShowCamera(true)
    } catch (err) {
      console.error('Camera error:', err)
      alert('Unable to access camera. Please check permissions.')
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
          await handleAvatarUpload(file)
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
    } catch (err) {
      console.error('Failed to remove avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for duplicate phone numbers
    if (hasDuplicatePhones()) {
      alert('Please remove duplicate phone numbers before submitting')
      return
    }

    // Check for invalid phone numbers (must be exactly 10 digits)
    if (hasInvalidPhones()) {
      alert('All phone numbers must be exactly 10 digits')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Directly create patient record
      const { error } = await supabase
        .from('patients')
        .insert({
          doctor_id: doctorId,
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          email: formData.email,
          phone: phoneNumbers[0] || formData.phone,
          phone_numbers: phoneNumbers.filter(p => p),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          parent_guardian_name: isUnder18 ? formData.parent_guardian_name : null,
          parent_guardian_phone: isUnder18 ? formData.parent_guardian_phone : null,
          avatar_url: avatarUrl,
          notes: formData.notes,
        })

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-fuchsia-800 dark:text-fuchsia-200">Form Submitted Successfully!</h3>
        <p className="text-fuchsia-600/70 dark:text-fuchsia-400/70 mb-4">
          Thank you for submitting your information. Your dental care provider will review it shortly.
        </p>
        <p className="text-sm text-fuchsia-600/60 dark:text-fuchsia-400/50">
          You will be contacted to schedule your appointment.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Profile Photo
        </h3>

        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="h-24 w-24 rounded-full bg-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => !showCamera && !avatarUrl && startCamera()}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8" />
              )}
            </div>
            {avatarUrl && !uploadingAvatar && (
              <button
                type="button"
                onClick={removeAvatar}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-fuchsia-600/70 dark:text-fuchsia-400/70">
              Take a photo with camera
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startCamera}
              disabled={uploadingAvatar || loading || showCamera}
              className="border-fuchsia-200 dark:border-fuchsia-800"
            >
              <Camera className="h-4 w-4 mr-1" />
              Open Camera
            </Button>
          </div>
        </div>

        {/* Camera View */}
        {showCamera && (
          <div className="space-y-3 p-4 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                onClick={capturePhoto}
                className="bg-fuchsia-600 hover:bg-fuchsia-700"
              >
                <Camera className="h-4 w-4 mr-1" />
                Capture
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Basic Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-fuchsia-700 dark:text-fuchsia-300">
              Full Name <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-fuchsia-700 dark:text-fuchsia-300">
              Date of Birth <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {isUnder18 && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Patient is under 18 - Parent/Guardian information required below
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-fuchsia-700 dark:text-fuchsia-300">
              Gender <span className="text-orange-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-fuchsia-700 dark:text-fuchsia-300">
              Email <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Contact Information
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-fuchsia-700 dark:text-fuchsia-300">
                Phone Numbers <span className="text-orange-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhoneNumber}
                disabled={loading}
                className="border-fuchsia-200 dark:border-fuchsia-800 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {phoneNumbers.map((phone, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDuplicatePhone(phone, index) || isInvalidPhone(phone) ? 'text-red-500' : 'text-fuchsia-400'}`} />
                      <Input
                        type="tel"
                        placeholder={index === 0 ? '10-digit phone number' : 'Additional phone (10 digits)'}
                        value={phone}
                        onChange={(e) => updatePhoneNumber(index, e.target.value)}
                        disabled={loading}
                        required={index === 0}
                        maxLength={10}
                        className={`pl-9 pr-12 ${isDuplicatePhone(phone, index) || isInvalidPhone(phone) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fuchsia-400">{phone.length}/10</span>
                    </div>
                  {phoneNumbers.length > 1 && (
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
            <Label htmlFor="address" className="text-fuchsia-700 dark:text-fuchsia-300">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-fuchsia-700 dark:text-fuchsia-300">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-fuchsia-700 dark:text-fuchsia-300">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-fuchsia-700 dark:text-fuchsia-300">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="ZIP / Postal code"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Parent/Guardian Information - Only for patients under 18 */}
      {isUnder18 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
            Parent/Guardian Information <span className="text-orange-500">*</span>
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="parent_guardian_name" className="text-fuchsia-700 dark:text-fuchsia-300">
                Parent/Guardian Name <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="parent_guardian_name"
                name="parent_guardian_name"
                value={formData.parent_guardian_name}
                onChange={handleChange}
                placeholder="Parent or Guardian Name"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_guardian_phone" className="text-fuchsia-700 dark:text-fuchsia-300">
                Parent/Guardian Phone <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="parent_guardian_phone"
                name="parent_guardian_phone"
                type="tel"
                value={formData.parent_guardian_phone}
                onChange={handleChange}
                placeholder="+1 (555) 987-6543"
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Reason for Visit */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fuchsia-800 dark:text-fuchsia-200 border-b border-fuchsia-100 dark:border-fuchsia-900/30 pb-2">
          Reason for Visit
        </h3>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-fuchsia-700 dark:text-fuchsia-300">Reason for Visit</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Please describe your reason for visiting"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 shadow-lg shadow-fuchsia-500/25"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Form'
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-fuchsia-600/60 dark:text-fuchsia-400/50">
        By submitting this form, you consent to the collection and use of this information for dental care purposes.
      </p>
    </form>
  )
}
