'use client'

import { useState } from 'react'
import { FormField, FieldType } from '@/types'
import { Card } from '@/components/ui/card'
import { FieldPalette } from './FieldPalette'
import { FieldCanvas } from './FieldCanvas'
import { FieldEditor } from './FieldEditor'

interface FormBuilderProps {
  fields: Omit<FormField, 'id' | 'form_id' | 'created_at'>[]
  onFieldsChange: (fields: Omit<FormField, 'id' | 'form_id' | 'created_at'>[]) => void
}

export function FormBuilder({ fields, onFieldsChange }: FormBuilderProps) {
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null
  )

  const addField = (fieldType: FieldType) => {
    const newField: Omit<FormField, 'id' | 'form_id' | 'created_at'> = {
      field_type: fieldType,
      label: '',
      placeholder: '',
      help_text: '',
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox'
        ? ['Option 1', 'Option 2']
        : undefined,
      validation_rules: {},
      order_index: fields.length,
    }

    onFieldsChange([...fields, newField])
    setSelectedFieldIndex(fields.length)
  }

  const updateField = (
    index: number,
    updates: Partial<Omit<FormField, 'id' | 'form_id' | 'created_at'>>
  ) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    onFieldsChange(newFields)
  }

  const deleteField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index)
    onFieldsChange(newFields)
    setSelectedFieldIndex(null)
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    onFieldsChange(newFields)
    setSelectedFieldIndex(toIndex)
  }

  const duplicateField = (index: number) => {
    const fieldToDuplicate = fields[index]
    const newField = {
      ...fieldToDuplicate,
      label: `${fieldToDuplicate.label} (Copy)`,
      order_index: fields.length,
    }
    onFieldsChange([...fields, newField])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Field Palette */}
      <div className="lg:col-span-1">
        <FieldPalette onAddField={addField} />
      </div>

      {/* Field Canvas */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Form Preview</h3>
            <p className="text-sm text-muted-foreground">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </p>
          </div>
          <FieldCanvas
            fields={fields}
            selectedFieldIndex={selectedFieldIndex}
            onSelectField={setSelectedFieldIndex}
            onMoveField={moveField}
            onDeleteField={deleteField}
            onDuplicateField={duplicateField}
          />
        </Card>
      </div>

      {/* Field Editor */}
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Field Properties</h3>
          {selectedFieldIndex !== null && fields[selectedFieldIndex] ? (
            <FieldEditor
              field={fields[selectedFieldIndex]}
              onUpdate={(updates) => updateField(selectedFieldIndex, updates)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a field to edit its properties
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}
