import { CursorEffects } from '@/react/components/visuals/CursorEffects'
// The site's default (in a page's layout, behind sections without a ground of their own; here the box isolates it): flick a mouse across empty page (768 wide and up) and a dashed trail of the light follows it.

export default function Trail() {
  return (
    <div className="relative isolate flex h-80 items-center justify-center rounded-container bg-surface inset-ring inset-ring-edge">
      <CursorEffects mode="trail" />
      <p className="type-body text-fg-muted">Flick the pointer across the empty space.</p>
    </div>
  )
}
