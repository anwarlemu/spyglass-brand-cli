import { Bookmark, Grid2x2, Play } from 'lucide-react'
import { Toggle } from '@/react/components/ui/Toggle'
// Filters over a grid of creatives: each stays on until pressed again.

export default function Toolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle defaultPressed><Play size={16} strokeWidth={1.5} aria-hidden="true" />Video</Toggle>
      <Toggle><Grid2x2 size={16} strokeWidth={1.5} aria-hidden="true" />Carousel</Toggle>
      <Toggle variant="outline" icon aria-label="Saved only"><Bookmark size={16} strokeWidth={1.5} aria-hidden="true" /></Toggle>
      <Toggle variant="outline" disabled>UGC</Toggle>
    </div>
  )
}
