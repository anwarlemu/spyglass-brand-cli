'use client'
import { useState } from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Drawer } from '@/react/components/ui/Drawer'
// A choice on a phone, from the bottom edge: which format to search. The rows are 44px to land a thumb on.
const formats = ['All formats', 'Video', 'Image', 'Carousel', 'UGC']

export default function Format() {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState('All formats')
  return (
    <div className="flex min-h-72 items-center justify-center">
      <Button variant="secondary" onClick={() => setOpen(true)}><SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />{format}</Button>
      <Drawer open={open} onOpenChange={setOpen} title="Format" description="Search one format, or all of them.">
        {(close) => (
          <ul className="flex flex-col gap-1">
            {formats.map((f) => (
              <li key={f}>
                <button type="button" aria-pressed={format === f} data-autofocus={format === f || undefined} className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-ds-sm px-3 text-left type-body text-fg outline-none transition-[background-color] duration-160 ease-standard hover:bg-ds-neutral-4 focus-visible:bg-ds-neutral-4" onClick={() => { setFormat(f); close() }}>
                  <span className="min-w-0 flex-1">{f}</span>
                  {format === f && <Check size={16} strokeWidth={1.5} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  )
}
