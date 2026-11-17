'use client'
import { useState } from 'react'
import { Checkbox } from '@/react/components/ui/Checkbox'
// A filter group: the parent is on when every format is, a bar when some are, and turns them all on or off.
const formats = ['Video', 'Carousel', 'Static image']

export default function Group() {
  const [picked, setPicked] = useState<string[]>(['Video'])
  const all = picked.length === formats.length
  return (
    <fieldset className="flex flex-col">
      <legend className="mb-2 type-label text-fg-muted">Format</legend>
      <Checkbox label="All formats" checked={all} indeterminate={!all && picked.length > 0} onCheckedChange={(on) => setPicked(on ? formats : [])} />
      <div className="flex flex-col pl-7">
        {formats.map((f) => (
          <Checkbox key={f} label={f} checked={picked.includes(f)} onCheckedChange={(on) => setPicked(on ? [...picked, f] : picked.filter((p) => p !== f))} />
        ))}
      </div>
    </fieldset>
  )
}
