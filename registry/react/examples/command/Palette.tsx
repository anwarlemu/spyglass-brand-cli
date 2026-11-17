'use client'
import { useState } from 'react'
import { Bookmark, Building2, CreditCard, Search, Users } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { CommandDialog } from '@/react/components/ui/CommandDialog'
import type { CommandGroup } from '@/react/components/ui/Command'
// The command menu in a window: the button or Cmd+K opens it at once, Escape closes it, a row runs and closes it.
const groups: CommandGroup[] = [
  { heading: 'Go to', items: [
    { id: 'search', label: 'Search creatives', icon: <Search size={16} strokeWidth={1.5} />, shortcut: '/' },
    { id: 'brands', label: 'Track a brand', keywords: ['creator', 'follow'], icon: <Building2 size={16} strokeWidth={1.5} /> },
    { id: 'boards', label: 'Boards', icon: <Bookmark size={16} strokeWidth={1.5} /> },
  ] },
  { heading: 'Settings', items: [
    { id: 'billing', label: 'Billing', keywords: ['plan', 'invoice'], icon: <CreditCard size={16} strokeWidth={1.5} />, shortcut: '⌘B' },
    { id: 'team', label: 'Team', icon: <Users size={16} strokeWidth={1.5} /> },
  ] },
]

export default function Palette() {
  const [open, setOpen] = useState(false)
  const [ran, setRan] = useState('')
  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}><Search size={16} strokeWidth={1.5} aria-hidden="true" />Search Spyglass<span className="type-caption text-fg-muted">⌘K</span></Button>
      <p className="type-caption text-fg-muted" aria-live="polite">{ran ? `Ran: ${ran}.` : 'Press Cmd+K anywhere on the page.'}</p>
      <CommandDialog open={open} onOpenChange={setOpen} groups={groups} onSelect={(item) => setRan(item.label)} />
    </div>
  )
}
