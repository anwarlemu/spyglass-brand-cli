'use client'
import { useState } from 'react'
import { Bookmark, Building2, Menu, Search, Settings } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Drawer } from '@/react/components/ui/Drawer'
// Navigation on a phone: the menu button slides the pages in from the left. Pick one, press the scrim or Escape to close.
const pages = [
  { label: 'Search', icon: Search },
  { label: 'Boards', icon: Bookmark },
  { label: 'Brands', icon: Building2 },
  { label: 'Settings', icon: Settings },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState('Search')
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3">
      <Button variant="secondary" icon aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      <p className="type-caption text-fg-muted" aria-live="polite">On {page}.</p>
      <Drawer open={open} onOpenChange={setOpen} title="Spyglass" side="left">
        <nav className="flex flex-col gap-1" aria-label="Pages">
          {pages.map(({ label, icon: Icon }) => (
            <a key={label} href="#" aria-current={page === label ? 'page' : undefined} className="flex h-10 items-center gap-3 rounded-ds-sm px-3 type-ui text-fg-soft outline-none transition-[background-color,color] duration-150 ease-standard hover:bg-ds-neutral-4 hover:text-fg focus-visible:bg-ds-neutral-4 aria-[current=page]:bg-ds-neutral-4 aria-[current=page]:text-fg" onClick={(e) => { e.preventDefault(); setPage(label); setOpen(false) }}>
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />{label}
            </a>
          ))}
        </nav>
      </Drawer>
    </div>
  )
}
