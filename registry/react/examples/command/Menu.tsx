'use client'
import { useState } from 'react'
import { Bookmark, Building2, CreditCard, Search, Users } from 'lucide-react'
import { Command, type CommandGroup } from '@/react/components/ui/Command'
// The command menu on the page: type to filter, arrows to move, Enter to run. The line under says what ran.
const groups: CommandGroup[] = [
  { heading: 'Go to', items: [
    { id: 'search', label: 'Search creatives', icon: <Search size={16} strokeWidth={1.5} />, shortcut: '/' },
    { id: 'brands', label: 'Track a brand', keywords: ['creator', 'follow'], icon: <Building2 size={16} strokeWidth={1.5} /> },
    { id: 'boards', label: 'Boards', icon: <Bookmark size={16} strokeWidth={1.5} /> },
  ] },
  { heading: 'Boards', items: [
    { id: 'summer', label: 'Acme summer ads' },
    { id: 'serum', label: 'Acme serum launch' },
  ] },
  { heading: 'Settings', items: [
    { id: 'billing', label: 'Billing', keywords: ['plan', 'invoice'], icon: <CreditCard size={16} strokeWidth={1.5} />, shortcut: '⌘B' },
    { id: 'team', label: 'Team', icon: <Users size={16} strokeWidth={1.5} />, disabled: true },
  ] },
]

export default function Menu() {
  const [ran, setRan] = useState('')
  return (
    <div className="flex w-120 max-w-full flex-col gap-3">
      <Command groups={groups} label="Commands" placeholder="Type a command or search" onSelect={(item) => setRan(item.label)} />
      <p className="type-caption text-fg-muted" aria-live="polite">{ran ? `Ran: ${ran}.` : 'Team needs an admin.'}</p>
    </div>
  )
}
