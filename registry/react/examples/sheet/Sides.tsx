'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Sheet, type SheetSide } from '@/react/components/ui/Sheet'
// The four edges a sheet comes from: right and left for details beside the page, top and bottom for a short row.
const sides: SheetSide[] = ['top', 'right', 'bottom', 'left']

export default function Sides() {
  const [side, setSide] = useState<SheetSide | null>(null)
  return (
    <div className="flex min-h-40 flex-wrap items-center justify-center gap-2">
      {sides.map((s) => <Button key={s} variant="secondary" onClick={() => setSide(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>)}
      {sides.map((s) => (
        <Sheet key={s} side={s} open={side === s} onOpenChange={(o) => { if (!o) setSide(null) }} title="Acme Studio" description="128 active ads on Meta and TikTok, 14 new this week.">
          <p className="type-ui text-fg-soft">Save the brand to a board to follow every new ad it launches.</p>
        </Sheet>
      ))}
    </div>
  )
}
