'use client'
import { useState } from 'react'
import { Slider } from '@/react/components/ui/Slider'
// A filter over a search: only ads that have run at least this many days, the count beside it.

export default function Filter() {
  const [days, setDays] = useState(30)
  return (
    <div className="flex w-96 max-w-full flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="type-label text-fg-soft">Running for at least</p>
        <p className="type-ui text-fg tabular-nums">{days} days</p>
      </div>
      <Slider label="Running for at least" min={0} max={90} value={days} onValueChange={setDays} valueText={`${days} days`} />
      <p className="type-caption text-fg-muted">Ads that run longer are the ones that work.</p>
    </div>
  )
}
