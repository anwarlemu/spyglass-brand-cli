import { CursorEffects } from '@/react/components/visuals/CursorEffects'
// Throw a mouse and stop: a small burst of light chips scatters where it stops.

export default function Burst() {
  return (
    <div className="relative isolate flex h-80 items-center justify-center rounded-container bg-surface inset-ring inset-ring-edge">
      <CursorEffects mode="burst" />
      <p className="type-body text-fg-muted">Move the pointer through the empty space.</p>
    </div>
  )
}
