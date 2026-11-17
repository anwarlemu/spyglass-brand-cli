import { Kbd } from '@/react/components/ui/Kbd'
import { KbdGroup } from '@/react/components/ui/KbdGroup'
// The shortcuts beside what they do, and a key inside a sentence.

const ROWS = [
  { label: 'Search creatives', keys: ['⌘', 'K'] },
  { label: 'Save to a board', keys: ['⌘', 'S'] },
  { label: 'Next result', keys: ['J'] },
  { label: 'Previous result', keys: ['K'] },
]

export default function Shortcuts() {
  return (
    <div className="flex w-72 max-w-full flex-col gap-6">
      <dl className="flex flex-col gap-3">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="type-ui text-fg-soft">{row.label}</dt>
            <dd>
              <KbdGroup>{row.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</KbdGroup>
            </dd>
          </div>
        ))}
      </dl>
      <p className="type-caption text-fg-muted">Press <Kbd>Esc</Kbd> to close any panel.</p>
    </div>
  )
}
