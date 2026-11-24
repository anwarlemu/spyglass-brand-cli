import { CursorEffects } from '@/react/components/visuals/CursorEffects'
// Move a mouse over empty page and a soft circle of ASCII characters follows it.

export default function Lens() {
  return (
    <div className="relative isolate flex h-80 items-center justify-center rounded-container bg-surface inset-ring inset-ring-edge">
      <CursorEffects mode="lens" />
      <p className="type-body text-fg-muted">Move the pointer through the empty space.</p>
    </div>
  )
}
