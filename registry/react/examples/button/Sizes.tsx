import { Search } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// sm, md and lg, and the square icon button (named with aria-label).

export default function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Search</Button>
      <Button size="md">Search</Button>
      <Button size="lg">Search</Button>
      <Button icon variant="secondary" aria-label="Search"><Search size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
    </div>
  )
}
