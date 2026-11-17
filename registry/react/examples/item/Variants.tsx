import { Bookmark, Sparkles } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Item } from '@/react/components/ui/Item'
// A board in a hairline box with its action, a tighter row on the card's fill, and a plain row.

export default function Variants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item variant="outline" title="Acme hooks" description="48 creatives from 12 brands, updated today." media={<Bookmark size={20} strokeWidth={1.5} aria-hidden="true" />} actions={<Button variant="secondary" size="sm">Open</Button>} />
      <Item variant="muted" size="sm" title="New creatives found" description="12 since your last visit." media={<Sparkles size={16} strokeWidth={1.5} aria-hidden="true" />} actions={<Button variant="ghost" size="sm">Review</Button>} />
      <Item title="Weekly digest" description="Every Monday, the ads your rivals started running." actions={<Button variant="secondary" size="sm">Turn on</Button>} />
    </div>
  )
}
