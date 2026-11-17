'use client'
import { useState } from 'react'
import { Calendar } from '@/react/components/ui/Calendar'
// The day a campaign goes live; the picked day reads under the month.

export default function Single() {
  const [day, setDay] = useState<Date | null>(new Date(2026, 10, 20))
  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar label="Launch day" value={day} onValueChange={setDay} />
      <p className="type-caption text-fg-muted" aria-live="polite">{day ? `Goes live ${day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.` : 'Pick a day.'}</p>
    </div>
  )
}
