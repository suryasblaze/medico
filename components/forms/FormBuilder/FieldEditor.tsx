'use client'

import { FormField } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getFieldTypeDefinition } from '@/lib/constants/field-types'
import { Plus, X } from 'lucide-react'

interface FieldEditorProps {
  field: Omit<FormField, 'id' | 'form_id' | 'created_at'>
  onUpdate: (updates: Partial<Omit<FormField, 'id' | 'form_id' | 'created_at'>>) => void
}

export function FieldEditor({ field, onUpdate }: FieldEditorProps) {
  const fieldDef = getFieldTypeDefinition(field.field_type)

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index)
    onUpdate({ options: newOptions })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field-label">
          Field Label <span className="text-destructive">*</span>
        </Label>
        <Input
          id="field-label"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Enter field label"
        />
      </div>

      {fieldDef.type !== 'checkbox' && fieldDef.type !== 'radio' && (
        <div className="space-y-2">
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder={fieldDef.defaultPlaceholder}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="field-help">Help Text</Label>
        <Textarea
          id="field-help"
          value={field.help_text}
          onChange={(e) => onUpdate({ help_text: e.target.value })}
          placeholder="Additional instructions for this field"
          rows={2}
        />
      </div>

      {fieldDef.supportsOptions && (
        <div className="space-y-2">
          <Label>Options</Label>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={(field.options?.length || 0) <= 2}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addOption}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
      )}

      {fieldDef.supportsValidation && (
        <div className="space-y-4 border-t pt-4">
          <Label>Validation</Label>

          {(field.field_type === 'text' || field.field_type === 'textarea') && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="field-min">Min Length</Label>
                  <Input
                    id="field-min"
                    type="number"
                    value={field.validation_rules?.min || ''}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          min: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-max">Max Length</Label>
                  <Input
                    id="field-max"
                    type="number"
                    value={field.validation_rules?.max || ''}
                    onChange={(e) =>
                      onUpdate({
                        validation_rules: {
                          ...field.validation_rules,
                          max: e.target.value ? parseInt(e.target.value) : undefined,
                        },
                      })
                    }
                    placeholder="100"
                  />
                </div>
              </div>
            </>
          )}

          {field.field_type === 'number' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="field-min">Min Value</Label>
                <Input
                  id="field-min"
                  type="number"
                  value={field.validation_rules?.min || ''}
                  onChange={(e) =>
                    onUpdate({
                      validation_rules: {
                        ...field.validation_rules,
                        min: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-max">Max Value</Label>
                <Input
                  id="field-max"
                  type="number"
                  value={field.validation_rules?.max || ''}
                  onChange={(e) =>
                    onUpdate({
                      validation_rules: {
                        ...field.validation_rules,
                        max: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  placeholder="100"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="space-y-0.5">
          <Label htmlFor="field-required">Required Field</Label>
          <p className="text-xs text-muted-foreground">
            Patient must fill this field
          </p>
        </div>
        <Switch
          id="field-required"
          checked={field.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  )
}
