import { Bookmark, Download, Ellipsis, Flag, Link } from 'lucide-react'
import { DropdownMenu } from '@/react/components/ui/DropdownMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { MenuLabel } from '@/react/components/ui/MenuLabel'
import { MenuSeparator } from '@/react/components/ui/MenuSeparator'
// A creative's actions, open with the page: save, copy, download, then report on its own.

export default function Actions() {
  return (
    <div className="flex h-72 w-full items-start justify-center pt-2">
      <DropdownMenu label="Creative actions" defaultOpen trigger={<><Ellipsis size={16} strokeWidth={1.5} aria-hidden="true" />Actions</>}>
        <MenuLabel>Acme summer UGC</MenuLabel>
        <MenuItem><Bookmark size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Save to board</MenuItem>
        <MenuItem><Link size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Copy link</MenuItem>
        <MenuItem><Download size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />Download</MenuItem>
        <MenuSeparator />
        <MenuItem danger><Flag size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />Report</MenuItem>
      </DropdownMenu>
    </div>
  )
}
