'use client'
import { useEffect, useId, useRef, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { usePopover, type Align, type Side } from '@/react/hooks/usePopover'

// More about a link, shown while the pointer rests on it: the card's #171717 fill on Black with a hairline and the
// brand corner, 16px in, opened after the tooltip's 300ms wait and, on keyboard focus, at once. The pointer can cross
// into the card to select or follow what is in it; leaving both closes it after a short grace. It is a preview, never
// the only way to the content: on touch the link just works. Wrap one link; the card is the `card` prop.
export interface HoverCardProps {
  /** The side it opens on (it flips when there is no room). */
  side?: Side
  align?: Align
  /** The card's width (a CSS length). */
  width?: string
  /** What the card shows. */
  card?: ReactNode
  /** One link. */
  children?: ReactNode
}

const WAIT = 300
const GRACE = 120

export function HoverCard({ side = 'bottom', align = 'start', width = '288px', card, children }: HoverCardProps) {
  const pop = usePopover({ side, align, gap: 8, sticky: true })
  const id = `card-${useId()}`
  const root = useRef<HTMLSpanElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const trigger = root.current?.firstElementChild as HTMLElement | null
    pop.anchor.current = trigger
    trigger?.setAttribute('aria-describedby', id)
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), [])

  function enter(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    clearTimeout(timer.current)
    // ds-latency: the wait keeps a passing pointer from opening it.
    if (!pop.open) timer.current = setTimeout(() => void pop.show(), WAIT)
  }
  function leave(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    clearTimeout(timer.current)
    // ds-latency: a grace to cross the gap into the card.
    timer.current = setTimeout(() => pop.hide(), GRACE)
  }
  function focus(event: FocusEvent) {
    if ((event.target as HTMLElement).matches(':focus-visible')) void pop.show({ keyboard: true })
  }
  function blur(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (!next || !pop.panel.current?.contains(next)) pop.hide()
  }
  return (
    <>
      <span data-ds="hover-card" ref={root} className="inline-flex" onPointerEnter={enter} onPointerLeave={leave} onFocus={focus} onBlur={blur}>
        {children}
      </span>
      <PopoverPanel data-ds="hover-card" id={id} pop={pop} className="p-4" style={{ width }} onPointerEnter={enter} onPointerLeave={leave}>
        {card}
      </PopoverPanel>
    </>
  )
}

export default HoverCard
