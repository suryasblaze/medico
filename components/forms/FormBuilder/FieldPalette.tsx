'use client'

import { FieldType } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FIELD_TYPES } from '@/lib/constants/field-types'
import { Plus } from 'lucide-react'

interface FieldPaletteProps {
  onAddField: (fieldType: FieldType) => void
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold">Field Types</h3>
        <p className="text-sm text-muted-foreground">
          Click to add a field to your form
        </p>
      </div>
      <div className="space-y-2">
        {FIELD_TYPES.map((fieldType) => {
          const Icon = fieldType.icon
          return (
            <Button
              key={fieldType.type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onAddField(fieldType.type)}
            >
              <Icon className="mr-2 h-4 w-4" />
              <div className="flex-1 text-left">
                <div className="font-medium">{fieldType.label}</div>
                <div className="text-xs text-muted-foreground">
                  {fieldType.description}
                </div>
              </div>
              <Plus className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </Card>
  )
}
