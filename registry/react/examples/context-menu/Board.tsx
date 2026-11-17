'use client'
import { useState } from 'react'
import { Bookmark, Copy, ExternalLink, Image, Trash2 } from 'lucide-react'
import { ContextMenu } from '@/react/components/ui/ContextMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
// A board's saved creatives: right-click a row, or focus it and press Shift+F10, for what you can do with it.
const creatives = [
  { id: 'cr_8f2k1', title: 'Acme summer UGC, before and after', format: 'Video' },
  { id: 'cr_3m9q7', title: 'Acme serum launch, carousel', format: 'Carousel' },
  { id: 'cr_5t0x2', title: 'Acme founder story, 30 seconds', format: 'Video' },
]

export default function Board() {
  const [picked, setPicked] = useState<string>()
  const [last, setLast] = useState('')
  const creative = creatives.find((c) => c.id === picked)
  const act = (what: string) => () => setLast(`${what}: ${creative?.title ?? ''}`)
  return (
    <div className="min-h-80 w-full max-w-120">
      <ContextMenu
        label="Creative"
        onOpen={setPicked}
        menu={(
          <>
            <MenuLabel><span className="truncate">{creative?.format}</span></MenuLabel>
            <MenuItem onSelect={act('Opened')}><ExternalLink size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Open</MenuItem>
            <MenuItem onSelect={act('Copied link')}><Copy size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Copy link</MenuItem>
            <MenuItem onSelect={act('Saved')}><Bookmark size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Save to another board</MenuItem>
            <MenuSeparator />
            <MenuItem danger onSelect={act('Removed')}><Trash2 size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />Remove from board</MenuItem>
          </>
        )}
      >
        <ul className="flex flex-col gap-1">
          {creatives.map((c) => (
            <li key={c.id} data-context={c.id} tabIndex={0} className="flex h-row items-center gap-3 rounded-control px-3 outline-none transition-[background-color] duration-150 ease-standard hover:bg-surface-raised focus-visible:bg-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus">
              <Image size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate type-ui">{c.title}</span>
              <span className="type-caption text-fg-muted max-sm:hidden">{c.format}</span>
            </li>
          ))}
        </ul>
      </ContextMenu>
      <p className="mt-3 type-caption text-fg-muted" aria-live="polite">{last || 'Right-click a creative, or focus it and press Shift+F10.'}</p>
    </div>
  )
}
