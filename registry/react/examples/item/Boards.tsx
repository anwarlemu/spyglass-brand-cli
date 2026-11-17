import { Item } from '@/react/components/ui/Item'
import { ItemGroup } from '@/react/components/ui/ItemGroup'
// Boards in a card, each row a link with a chevron, a hairline between them.

const BOARDS = [
  { name: 'Acme hooks', count: '48 creatives' },
  { name: 'Acme summer launch', count: '112 creatives' },
  { name: 'UGC openers', count: '36 creatives' },
]

export default function Boards() {
  return (
    <div className="w-full max-w-md rounded-container bg-surface-raised p-2">
      <ItemGroup>
        {BOARDS.map((b) => (
          <li key={b.name}><Item href="#boards" arrow size="sm" title={b.name} description={b.count} /></li>
        ))}
      </ItemGroup>
    </div>
  )
}
