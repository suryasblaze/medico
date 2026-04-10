'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

interface DateInputDMYProps {
  id?: string
  name?: string
  value?: string // expected as yyyy-mm-dd (or empty)
  onChange?: (isoValue: string) => void
  required?: boolean
  disabled?: boolean
  className?: string
  min?: string // yyyy-mm-dd
  max?: string // yyyy-mm-dd
}

function isoToDmy(iso?: string): string {
  if (!iso) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return ''
  return `${m[3]}/${m[2]}/${m[1]}`
}

function dmyToIso(dmy: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy)
  if (!m) return ''
  const day = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  const year = parseInt(m[3], 10)
  if (month < 1 || month > 12) return ''
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) return ''
  return `${m[3]}-${m[2]}-${m[1]}`
}

export function DateInputDMY({
  id,
  name,
  value,
  onChange,
  required,
  disabled,
  className,
  min,
  max,
}: DateInputDMYProps) {
  const [text, setText] = React.useState<string>(isoToDmy(value))

  React.useEffect(() => {
    setText(isoToDmy(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only digits, then re-insert slashes
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    setText(formatted)

    const iso = dmyToIso(formatted)
    if (onChange) {
      if (iso) {
        // Range check
        if (min && iso < min) return onChange('')
        if (max && iso > max) return onChange('')
        onChange(iso)
      } else {
        onChange('')
      }
    }
  }

  const handleBlur = () => {
    if (text && !dmyToIso(text)) {
      setText('')
      onChange?.('')
    }
  }

  return (
    <Input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      required={required}
      disabled={disabled}
      className={className}
      maxLength={10}
      autoComplete="bday"
    />
  )
}
