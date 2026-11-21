'use client'
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Two panes and the #262626 hairline between them. The hairline is the handle, with a 12px reach either side (20px
// on touch); it turns White under the pointer, while dragged and when focused (150ms). `withHandle` adds a small grip
// on it in the card's fill. Drag it, or focus it and use the arrow keys (Shift for bigger steps, Home and End for the
// limits). The split follows the hand with no easing. The value is the first pane's share in percent, held between
// `min` and `max` (`value` with `onValueChange`, or `defaultValue` alone). The panes go in `first` and `second`.
export interface ResizableProps {
  /** horizontal (side by side) or vertical (one over the other). */
  direction?: 'horizontal' | 'vertical'
  /** The first pane's smallest share, in percent. */
  min?: number
  /** The first pane's largest share, in percent. */
  max?: number
  /** The handle's name for assistive tech. */
  label?: string
  /** The first pane's share, in percent. */
  value?: number
  defaultValue?: number
  onValueChange?: (size: number) => void
  /** A small grip on the hairline. */
  withHandle?: boolean
  /** The first pane (left, or top when vertical). */
  first?: ReactNode
  /** The second pane. */
  second?: ReactNode
  className?: string
}

export function Resizable({ direction = 'horizontal', min = 20, max = 80, label = 'Resize panes', value, defaultValue = 50, onValueChange, withHandle, first, second, className }: ResizableProps) {
  const [size, setSize] = useControllable(value, defaultValue, onValueChange)
  const root = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const firstId = `pane-${useId().replace(/:/g, '')}`
  const across = direction !== 'vertical'
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 10) / 10))

  function onDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging || !root.current) return
    const box = root.current.getBoundingClientRect()
    setSize(clamp(across ? ((e.clientX - box.left) / box.width) * 100 : ((e.clientY - box.top) / box.height) * 100))
  }
  function onUp(e: PointerEvent<HTMLDivElement>) {
    setDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 2
    const back = across ? 'ArrowLeft' : 'ArrowUp'
    const fwd = across ? 'ArrowRight' : 'ArrowDown'
    if (e.key === back) setSize(clamp(size - step))
    else if (e.key === fwd) setSize(clamp(size + step))
    else if (e.key === 'Home') setSize(min)
    else if (e.key === 'End') setSize(max)
    else return
    e.preventDefault()
  }

  return (
    <>
      <style href="ds-resizable" precedence="ds">{css}</style>
      <div data-ds="resizable" ref={root} className={cn('flex min-h-0 min-w-0', across ? 'flex-row' : 'flex-col', dragging && 'select-none', className)}>
        <div id={firstId} className="min-h-0 min-w-0 overflow-auto fade-y fade-x" style={{ flexBasis: `${size}%` }}>{first}</div>
        <div
          className="ds-resize-handle"
          data-direction={across ? 'horizontal' : 'vertical'}
          data-dragging={dragging || undefined}
          role="separator"
          tabIndex={0}
          aria-label={label}
          aria-orientation={across ? 'vertical' : 'horizontal'}
          aria-controls={firstId}
          aria-valuenow={size}
          aria-valuemin={min}
          aria-valuemax={max}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          {withHandle && <span className="ds-resize-grip" aria-hidden="true" />}
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-auto fade-y fade-x">{second}</div>
      </div>
    </>
  )
}

export default Resizable

const css = `
.ds-resize-handle { position: relative; display: flex; flex-shrink: 0; align-items: center; justify-content: center; background: var(--ds-color-edge); touch-action: none; transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-resize-handle[data-direction="horizontal"] { width: var(--ds-border-hairline); cursor: col-resize; }
.ds-resize-handle[data-direction="vertical"] { height: var(--ds-border-hairline); cursor: row-resize; }
/* The reach: 12px either side of the hairline, 20px on touch. */
.ds-resize-handle::before { position: absolute; content: ""; }
.ds-resize-handle[data-direction="horizontal"]::before { inset: 0 calc(var(--ds-space-md) * -1); }
.ds-resize-handle[data-direction="vertical"]::before { inset: calc(var(--ds-space-md) * -1) 0; }
@media (pointer: coarse) {
  .ds-resize-handle[data-direction="horizontal"]::before { inset: 0 -20px; }
  .ds-resize-handle[data-direction="vertical"]::before { inset: -20px 0; }
}
.ds-resize-handle[data-dragging], .ds-resize-handle:focus-visible { background: var(--ds-color-edge-focus); }
.ds-resize-handle:focus-visible { outline: none; }
@media (hover: hover) and (pointer: fine) { .ds-resize-handle:hover { background: var(--ds-color-edge-focus); } }
/* The grip: a small box on the hairline, the card's fill in a #363636 hairline that turns White with it. */
.ds-resize-grip { position: relative; z-index: 1; flex-shrink: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-resize-handle[data-direction="horizontal"] .ds-resize-grip { width: var(--ds-space-md); height: var(--ds-space-xl); }
.ds-resize-handle[data-direction="vertical"] .ds-resize-grip { width: var(--ds-space-xl); height: var(--ds-space-md); }
.ds-resize-handle[data-dragging] .ds-resize-grip, .ds-resize-handle:focus-visible .ds-resize-grip { border-color: var(--ds-color-edge-focus); }
@media (hover: hover) and (pointer: fine) { .ds-resize-handle:hover .ds-resize-grip { border-color: var(--ds-color-edge-focus); } }
`
