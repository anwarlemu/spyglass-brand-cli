'use client'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { Toast } from '@/react/components/ui/Toast'
import { getToasts, subscribeToasts, toast, TOAST_MOST, type ToastData } from '@/lib/sonner'

export { toast } from '@/lib/sonner'

// The corner where notes from toast() show (shadcn's sonner): the bottom right, full width on a phone. The newest is in
// front; the two before it peek out above, 12px apart and a little smaller. Pointing at the stack (or tabbing into it)
// spreads it out and stops every note's time, as does a hidden tab, so none leaves unread. A note rises in from below
// over 360ms on the strong ease-out and leaves faster, 160ms, fading as it drops; the others move to their new places
// as one goes. Each has a close button; an action closes it after it runs. Reduced motion keeps only the fades. Mount
// one per app, then call toast('Saved to board', { description, action }) from anywhere.
export interface ToasterProps {
  /** The region's name for assistive tech. */
  label?: string
}

const STEP = 100
const PEEK = 12
const GAP = 12

type Item = ToastData & { mounted: boolean, removed: boolean }

export function Toaster({ label = 'Notifications' }: ToasterProps) {
  const store = useSyncExternalStore(subscribeToasts, getToasts, getToasts)
  const [items, setItems] = useState<Item[]>([])
  // Spread while pointed at or while focus is inside: two reasons, kept apart so losing one keeps the other.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const expanded = hovered || focused
  const [heights, setHeights] = useState<Record<number, number>>({})
  const nodes = useRef(new Map<number, HTMLElement>())
  const left = useRef(new Map<number, { left: number, shown: number }>())
  const last = useRef(new Map<number, string>())
  const exits = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const list = useRef<HTMLOListElement | null>(null)
  const held = useRef(false)
  held.current = expanded

  // The store's notes, with those still leaving kept in their places.
  useEffect(() => {
    setItems((prev) => {
      const next: Item[] = prev.map((p) => {
        const t = store.find((s) => s.id === p.id)
        return t ? { ...t, mounted: p.mounted, removed: false } : { ...p, removed: true }
      })
      for (const t of store) if (!prev.some((p) => p.id === t.id)) next.push({ ...t, mounted: false, removed: false })
      return next
    })
  }, [store])

  // A new note starts below, out of sight, for one frame, then rises; a leaving one goes once its exit has played. A note
  // that leaves with focus in it takes the focus away without a blur: the stack is no longer focused then.
  useEffect(() => {
    if (focused && !list.current?.contains(document.activeElement)) setFocused(false)
    let frame = 0
    if (items.some((i) => !i.mounted && !i.removed)) {
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setItems((p) => p.map((i) => (i.removed ? i : { ...i, mounted: true }))))
      })
    }
    for (const i of items) {
      if (!i.removed || exits.current.has(i.id)) continue
      // ds-latency: the note stays in the page until its exit has played.
      exits.current.set(i.id, setTimeout(() => {
        exits.current.delete(i.id)
        setItems((p) => p.filter((x) => x.id !== i.id))
      }, 160))
    }
    return () => cancelAnimationFrame(frame)
  }, [items])
  useEffect(() => () => { for (const t of exits.current.values()) clearTimeout(t) }, [])

  // One clock for every note, only while there are any; it stops while the stack is pointed at or the tab is hidden.
  const count = store.length
  useEffect(() => {
    if (!count) return
    // ds-latency: the notes' own clock, off the input path; nothing waits on it.
    const timer = setInterval(() => {
      if (held.current || document.hidden) return
      for (const t of getToasts()) {
        const l = left.current.get(t.id)
        const now = !l || l.shown !== t.shown ? t.duration : l.left - STEP
        if (now <= 0) {
          left.current.delete(t.id)
          toast.dismiss(t.id)
        }
        else left.current.set(t.id, { left: now, shown: t.shown })
      }
    }, STEP)
    return () => clearInterval(timer)
  }, [count > 0]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!count) {
      setHovered(false)
      setFocused(false)
    }
  }, [count])

  // Each note's own height, for spreading the stack out.
  useLayoutEffect(() => {
    const next: Record<number, number> = {}
    for (const [id, node] of nodes.current) next[id] = (node.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0
    if (Object.keys(next).length !== Object.keys(heights).length || Object.entries(next).some(([id, h]) => heights[Number(id)] !== h)) setHeights(next)
  })

  const showing = items.filter((i) => !i.removed).reverse()
  const front = showing[0] ? heights[showing[0].id] ?? 0 : 0
  const spread = showing.reduce((sum, i) => sum + (heights[i.id] ?? 0), 0) + Math.max(0, showing.length - 1) * GAP
  const height = !showing.length ? 0 : expanded ? spread : front + (Math.min(showing.length, TOAST_MOST) - 1) * PEEK

  function style(item: Item): CSSProperties {
    const i = showing.indexOf(item)
    if (item.removed || i < 0) return { transform: `${last.current.get(item.id) ?? 'translateY(0)'} translateY(50%)`, opacity: 0, zIndex: 0 }
    if (!item.mounted) return { transform: 'translateY(100%)', opacity: 0, zIndex: showing.length - i }
    const y = expanded ? -(showing.slice(0, i).reduce((sum, x) => sum + (heights[x.id] ?? 0), 0) + i * GAP) : -i * PEEK
    const transform = `translateY(${y}px) scale(${expanded ? 1 : 1 - i * 0.05})`
    last.current.set(item.id, transform)
    return { transform, opacity: i < TOAST_MOST ? 1 : 0, zIndex: showing.length - i, height: !expanded && i > 0 && front ? `${front}px` : undefined }
  }

  return (
    <>
      <style href="ds-sonner" precedence="ds">{css}</style>
      <section data-ds="sonner" aria-label={label} aria-live="polite">
        <ol
          ref={list}
          className="ds-sonner"
          style={{ height: `${height}px` }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false) }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              ref={(el) => { if (el) nodes.current.set(item.id, el); else nodes.current.delete(item.id) }}
              className="ds-sonner-toast"
              data-removed={item.removed || undefined}
              style={style(item)}
            >
              <Toast
                title={item.title}
                description={item.description}
                action={item.action && { label: item.action.label, onClick: () => { item.action?.onClick?.(); toast.dismiss(item.id) } }}
                onDismiss={() => toast.dismiss(item.id)}
              />
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}

export default Toaster

const css = `
.ds-sonner { position: fixed; right: var(--ds-space-lg); bottom: calc(var(--ds-space-lg) + env(safe-area-inset-bottom)); z-index: 70; width: min(22.5rem, calc(100vw - 2 * var(--ds-space-lg))); margin: 0; padding: 0; list-style: none; }
.ds-sonner-toast { position: absolute; right: 0; bottom: 0; left: 0; overflow: hidden; border-radius: var(--ds-radius-container); transform-origin: 50% 100%; transition: transform var(--ds-duration-entrance) var(--ds-easing-out), opacity var(--ds-duration-entrance) var(--ds-easing-out); }
.ds-sonner-toast[data-removed] { pointer-events: none; transition-duration: var(--ds-duration-exit); }
@media (prefers-reduced-motion: reduce) {
  .ds-sonner-toast { transition: opacity var(--ds-duration-enter) var(--ds-easing-out); }
}
`
