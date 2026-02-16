'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FormFormData } from '@/lib/validations/form'

interface FormSettingsProps {
  formData: FormFormData
  onFormDataChange: (data: FormFormData) => void
  onTitleChange: (title: string) => void
}

export function FormSettings({
  formData,
  onFormDataChange,
  onTitleChange,
}: FormSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Configure the basic settings for your form
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            Form Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Patient Intake Form"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Form URL Slug <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/forms/</span>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                onFormDataChange({ ...formData, slug: e.target.value })
              }
              placeholder="patient-intake-form"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and hyphens only
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              onFormDataChange({ ...formData, description: e.target.value })
            }
            placeholder="Describe what this form is used for..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="success_message">Success Message</Label>
          <Textarea
            id="success_message"
            value={formData.success_message}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                success_message: e.target.value,
              })
            }
            placeholder="Thank you for your submission!"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification_email">Notification Email</Label>
          <Input
            id="notification_email"
            type="email"
            value={formData.notification_email}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                notification_email: e.target.value,
              })
            }
            placeholder="doctor@example.com"
          />
          <p className="text-xs text-muted-foreground">
            Receive an email when someone submits this form (optional)
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold">Form Options</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Form Active</Label>
            <p className="text-sm text-muted-foreground">
              Allow patients to submit this form
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, is_active: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requires_patient_info">
              Require Patient Information
            </Label>
            <p className="text-sm text-muted-foreground">
              Collect patient name, email, and phone
            </p>
          </div>
          <Switch
            id="requires_patient_info"
            checked={formData.requires_patient_info}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, requires_patient_info: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow_multiple_submissions">
              Allow Multiple Submissions
            </Label>
            <p className="text-sm text-muted-foreground">
              Same patient can submit multiple times
            </p>
          </div>
          <Switch
            id="allow_multiple_submissions"
            checked={formData.allow_multiple_submissions}
            onCheckedChange={(checked) =>
              onFormDataChange({
                ...formData,
                allow_multiple_submissions: checked,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
