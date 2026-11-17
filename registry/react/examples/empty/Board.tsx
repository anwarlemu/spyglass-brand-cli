import { Bookmark, Search } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { Empty } from '@/react/components/ui/Empty'
// A new board with nothing saved yet, and the way to fill it.

export default function Board() {
  return (
    <Empty className="max-w-160" icon={<Bookmark size={20} strokeWidth={1.5} />} title="No creatives saved yet." description="Search for ads, product shots and UGC, then save the ones that work to this board.">
      <Button><Search size={16} strokeWidth={1.5} aria-hidden="true" />Search creatives</Button>
      <Button variant="secondary">Import from a link</Button>
    </Empty>
  )
}
