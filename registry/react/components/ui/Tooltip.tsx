'use client'
import { useEffect, useId, useRef, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { usePopover, type Align, type Side } from '@/react/hooks/usePopover'

// When the last tooltip closed: one opened right after it shows at once, so moving along a toolbar reads fast.
let lastClosed = 0

// A control's name, for icon buttons: a White fill with Black DM Sans caption text and the small corner, 4px from its
// trigger. Under the pointer it waits 300ms, then fades and moves 2px in over 150ms; on keyboard focus it shows at
// once, without motion; a press, Escape or leaving hides it. Right after another tooltip it shows at once, so moving
// along a toolbar reads fast. It never shows on touch (a tap presses the button). Wrap one focusable trigger; it gets
// aria-describedby.
export interface TooltipProps {
  /** The control's name. */
  text: string
  /** The side it shows on (it flips when there is no room). */
  side?: Side
  align?: Align
  /** One focusable trigger. */
  children?: ReactNode
}

const WAIT = 300

export function Tooltip({ text, side = 'bottom', align = 'center', children }: TooltipProps) {
  const pop = usePopover({ side, align, gap: 4, sticky: true })
  const id = `tip-${useId()}`
  const root = useRef<HTMLSpanElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const trigger = root.current?.firstElementChild as HTMLElement | null
    pop.anchor.current = trigger
    trigger?.setAttribute('aria-describedby', id)
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  const was = useRef(false)
  useEffect(() => {
    if (was.current && !pop.open) lastClosed = Date.now()
    was.current = pop.open
  }, [pop.open])
  useEffect(() => () => clearTimeout(timer.current), [])

  function enter(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || pop.open) return
    clearTimeout(timer.current)
    if (Date.now() - lastClosed < WAIT) return void pop.show({ keyboard: true })
    // ds-latency: the wait is the point; a pass of the pointer shows nothing.
    timer.current = setTimeout(() => void pop.show(), WAIT)
  }
  function leave() {
    clearTimeout(timer.current)
    // Closed now, not after the next render: the pointer entering the next button lands in the same moment.
    if (pop.open) lastClosed = Date.now()
    pop.hide()
  }
  function focus(event: FocusEvent) {
    if ((event.target as HTMLElement).matches(':focus-visible')) void pop.show({ keyboard: true })
  }
  return (
    <>
      <span data-ds="tooltip" ref={root} className="inline-flex" onPointerEnter={enter} onPointerLeave={leave} onPointerDown={leave} onFocus={focus} onBlur={leave}>
        {children}
      </span>
      <PopoverPanel data-ds="tooltip" id={id} pop={pop} tip role="tooltip">{text}</PopoverPanel>
    </>
  )
}

export default Tooltip
