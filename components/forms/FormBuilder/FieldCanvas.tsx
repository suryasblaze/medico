'use client'

import { FormField } from '@/types'
import { Button } from '@/components/ui/button'
import { getFieldTypeDefinition } from '@/lib/constants/field-types'
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FieldCanvasProps {
  fields: Omit<FormField, 'id' | 'form_id' | 'created_at'>[]
  selectedFieldIndex: number | null
  onSelectField: (index: number) => void
  onMoveField: (fromIndex: number, toIndex: number) => void
  onDeleteField: (index: number) => void
  onDuplicateField: (index: number) => void
}

export function FieldCanvas({
  fields,
  selectedFieldIndex,
  onSelectField,
  onMoveField,
  onDeleteField,
  onDuplicateField,
}: FieldCanvasProps) {
  if (fields.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
        <div>
          <p className="text-sm font-medium">No fields yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add fields from the palette to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {fields.map((field, index) => {
        const fieldDef = getFieldTypeDefinition(field.field_type)
        const Icon = fieldDef.icon
        const isSelected = selectedFieldIndex === index

        return (
          <div
            key={index}
            className={cn(
              'group rounded-lg border p-3 transition-colors cursor-pointer',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelectField(index)}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {field.label || `Untitled ${fieldDef.label}`}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fieldDef.label}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index > 0) onMoveField(index, index - 1)
                  }}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index < fields.length - 1) onMoveField(index, index + 1)
                  }}
                  disabled={index === fields.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicateField(index)
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteField(index)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
