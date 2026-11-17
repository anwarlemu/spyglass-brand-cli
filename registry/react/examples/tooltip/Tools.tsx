import { Bookmark, Download, Link, EyeOff } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Tooltip } from '@/react/components/ui/Tooltip'
// A creative's tools as icon buttons, each named by its tooltip. Point at one and wait, then move along: the next shows
// at once. Tab to one and its name shows without a wait.
const tools = [
  { label: 'Save to board', icon: Bookmark },
  { label: 'Copy link', icon: Link },
  { label: 'Download', icon: Download },
  { label: 'Hide', icon: EyeOff },
]

export default function Tools() {
  return (
    <div className="flex min-h-24 items-start justify-center gap-1">
      {tools.map((t) => (
        <Tooltip key={t.label} text={t.label}>
          <Button variant="ghost" icon aria-label={t.label}><t.icon size={16} strokeWidth={1.5} /></Button>
        </Tooltip>
      ))}
    </div>
  )
}
