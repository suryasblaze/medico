'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Check, Edit2, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormSlugEditorProps {
  doctorId: string
  currentSlug: string
  baseUrl: string
}

export function FormSlugEditor({ doctorId, currentSlug, baseUrl }: FormSlugEditorProps) {
  const [editing, setEditing] = useState(false)
  const [slug, setSlug] = useState(currentSlug)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30)
  }

  const handleSlugChange = (value: string) => {
    setError('')
    setSlug(generateSlug(value))
  }

  const handleSave = async () => {
    if (!slug.trim()) {
      setError('Slug cannot be empty')
      return
    }

    if (slug.length < 3) {
      setError('Slug must be at least 3 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Check if slug is already taken
      const { data: existing } = await supabase
        .from('doctors')
        .select('id')
        .eq('form_slug', slug)
        .neq('id', doctorId)
        .maybeSingle()

      if (existing) {
        setError('This slug is already taken. Try another one.')
        setLoading(false)
        return
      }

      // Update slug
      const { error: updateError } = await supabase
        .from('doctors')
        .update({ form_slug: slug })
        .eq('id', doctorId)

      if (updateError) throw updateError

      setEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update slug')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSlug(currentSlug)
    setError('')
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-fuchsia-600/70 dark:text-fuchsia-400/70">Short URL:</span>
        <code className="px-2 py-1 bg-fuchsia-100 dark:bg-fuchsia-950/30 rounded text-fuchsia-700 dark:text-fuchsia-300">
          /form/{currentSlug || '...'}
        </code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing(true)}
          className="h-7 px-2 text-fuchsia-600 hover:text-fuchsia-700"
        >
          <Edit2 className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3 bg-fuchsia-50 dark:bg-fuchsia-950/20 rounded-lg border border-fuchsia-200 dark:border-fuchsia-900/50">
      <Label className="text-fuchsia-700 dark:text-fuchsia-300">
        Customize your form URL
      </Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-fuchsia-600/70 whitespace-nowrap">{baseUrl}/form/</span>
        <Input
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="your-clinic-name"
          className="flex-1"
          disabled={loading}
          maxLength={30}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading || !slug.trim()}
          className="bg-fuchsia-600 hover:bg-fuchsia-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <p className="text-xs text-fuchsia-600/60 dark:text-fuchsia-400/50">
        Use lowercase letters, numbers, and hyphens only. Max 30 characters.
      </p>
    </div>
  )
}
