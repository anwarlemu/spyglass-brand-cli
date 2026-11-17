'use client'
import { Collapsible } from '@/react/components/ui/Collapsible'
// A list that shows its first boards and opens to the rest, open with the page.
const boards = ['Acme skincare', 'Acme summer UGC', 'Acme founder stories']

export default function Boards() {
  return (
    <div className="w-100 max-w-full">
      <p className="py-2 type-ui text-fg">Acme hooks that work</p>
      <Collapsible defaultOpen trigger={(open) => <span className="text-fg-muted">{open ? 'Show fewer boards' : 'Show 3 more boards'}</span>}>
        <ul className="flex flex-col">
          {boards.map((b) => <li key={b} className="py-2 type-ui text-fg">{b}</li>)}
        </ul>
      </Collapsible>
    </div>
  )
}
