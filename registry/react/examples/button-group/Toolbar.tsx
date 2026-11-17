import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, Rows3 } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { ButtonGroup } from '@/react/components/ui/ButtonGroup'
// A results toolbar: paging, the two views, and a save button with its menu arrow, each set joined into one block.

export default function Toolbar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ButtonGroup label="Pages">
        <Button variant="secondary" icon aria-label="Previous page"><ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
        <Button variant="secondary" icon aria-label="Next page"><ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      </ButtonGroup>
      <ButtonGroup label="View">
        <Button variant="secondary"><LayoutGrid size={16} strokeWidth={1.5} aria-hidden="true" />Grid</Button>
        <Button variant="secondary"><Rows3 size={16} strokeWidth={1.5} aria-hidden="true" />Rows</Button>
      </ButtonGroup>
      <ButtonGroup label="Save">
        <Button variant="secondary">Save to board</Button>
        <Button variant="secondary" icon aria-label="Choose a board"><ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      </ButtonGroup>
    </div>
  )
}
