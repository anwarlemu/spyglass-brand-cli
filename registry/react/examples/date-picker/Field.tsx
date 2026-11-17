'use client'
import { useState } from 'react'
import { DatePicker } from '@/react/components/ui/DatePicker'
// A report's start date in a form: a label over the field, a hint under it.

export default function Field() {
  const [day, setDay] = useState<Date | null>(null)
  return (
    <div className="flex h-110 w-full max-w-80 flex-col gap-2">
      <label htmlFor="report-start" className="type-label text-fg-muted">Report starts</label>
      <DatePicker id="report-start" value={day} onValueChange={setDay} aria-describedby="report-start-hint" />
      <p id="report-start-hint" className="type-caption text-fg-muted">{day ? `Creatives running since ${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.` : 'Creatives running since this day.'}</p>
    </div>
  )
}
