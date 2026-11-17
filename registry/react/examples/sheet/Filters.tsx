'use client'
import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Input } from '@/react/components/ui/Input'
import { Sheet } from '@/react/components/ui/Sheet'
// A search's filters in a sheet at the right edge: two fields and the buttons at the foot. Escape, Close or the dimmed
// page closes it.

export default function Filters() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Button variant="secondary" onClick={() => setOpen(true)}><SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />Filters</Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Filter creatives"
        description="Narrow this search to the brands and dates you care about."
        foot={(
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Reset</Button>
            <Button onClick={() => setOpen(false)}>Show results</Button>
          </>
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="sheet-brand" className="type-label text-fg-soft">Brand</label>
            <Input id="sheet-brand" name="brand" defaultValue="Acme Studio" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sheet-days" className="type-label text-fg-soft">Running for at least</label>
            <Input id="sheet-days" name="days" defaultValue="30 days" />
            <p className="type-caption text-fg-muted">Ads that run longer are the ones that work.</p>
          </div>
        </div>
      </Sheet>
    </div>
  )
}
