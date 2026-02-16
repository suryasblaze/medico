'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Doctor } from '@/types'
import { Upload } from 'lucide-react'

interface ProfileFormProps {
  doctor: Doctor
}

export function ProfileForm({ doctor }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: doctor.full_name,
    specialty: doctor.specialty || '',
    clinic_name: doctor.clinic_name || '',
    phone: doctor.phone || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('doctors')
        .update(formData)
        .eq('id', doctor.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${doctor.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // Update doctor profile with avatar URL
      const { error: updateError } = await supabase
        .from('doctors')
        .update({ avatar_url: publicUrl })
        .eq('id', doctor.id)

      if (updateError) throw updateError

      router.refresh()
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={doctor.avatar_url || ''} alt={doctor.full_name} />
          <AvatarFallback>{getInitials(doctor.full_name)}</AvatarFallback>
        </Avatar>
        <div>
          <Label
            htmlFor="avatar-upload"
            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </Label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or GIF. Max 2MB.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
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
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialty"
            value={formData.specialty}
            onChange={(e) =>
              setFormData({ ...formData, specialty: e.target.value })
            }
            placeholder="e.g., General Practice"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinic_name">Clinic Name</Label>
          <Input
            id="clinic_name"
            value={formData.clinic_name}
            onChange={(e) =>
              setFormData({ ...formData, clinic_name: e.target.value })
            }
            placeholder="e.g., City Medical Center"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="e.g., +1 (555) 123-4567"
            disabled={loading}
          />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          Profile updated successfully!
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
