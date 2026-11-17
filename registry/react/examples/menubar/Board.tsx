'use client'
import { useState } from 'react'
import { Copy, Download, FolderPlus, Link, Trash2, UserPlus } from 'lucide-react'
import { Menubar } from '@/react/components/ui/Menubar'
import { MenubarItem } from '@/react/components/ui/MenubarItem'
import { MenubarLabel } from '@/react/components/ui/MenubarLabel'
import { MenubarMenu } from '@/react/components/ui/MenubarMenu'
import { MenubarSeparator } from '@/react/components/ui/MenubarSeparator'
// A board's tools as a menubar: the board itself, how its creatives are sorted, and who sees it. Open one, then point
// at the next or press Right.
const sorts = [{ id: 'newest', label: 'Newest first' }, { id: 'longest', label: 'Longest running' }, { id: 'saved', label: 'Most saved' }] as const

export default function Board() {
  const [sort, setSort] = useState<'newest' | 'longest' | 'saved'>('newest')
  return (
    <div className="min-h-72">
      <Menubar label="Board">
        <MenubarMenu label="Board">
          <MenubarItem shortcut="⌘N"><FolderPlus size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />New board</MenubarItem>
          <MenubarItem><Copy size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Duplicate</MenubarItem>
          <MenubarItem><Download size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Export as PDF</MenubarItem>
          <MenubarSeparator />
          <MenubarItem danger><Trash2 size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />Delete board</MenubarItem>
        </MenubarMenu>
        <MenubarMenu label="View">
          <MenubarLabel>Sort creatives</MenubarLabel>
          {sorts.map((s) => (
            <MenubarItem key={s.id} role="menuitemradio" checked={sort === s.id} onSelect={() => setSort(s.id)}>{s.label}</MenubarItem>
          ))}
        </MenubarMenu>
        <MenubarMenu label="Share">
          <MenubarItem><Link size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Copy link</MenubarItem>
          <MenubarItem><UserPlus size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Invite a teammate</MenubarItem>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}
