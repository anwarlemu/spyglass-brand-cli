import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A region that scrolls on its own, with the page's thin scrollbars: a #363636 thumb on a clear track. Native
// scrolling, so wheel, touch and keyboard all work and nothing is redrawn by script; overscroll stays inside it. With a
// `label` it is a named region a keyboard can reach. `maxHeight` caps it (or size it with classes); `axis` picks the
// direction.
export interface ScrollAreaProps {
  /** Names the region and lets a keyboard reach it. */
  label?: string
  /** A cap on its height, such as 288px. */
  maxHeight?: string
  /** y (down), x (across) or both. */
  axis?: 'y' | 'x' | 'both'
  className?: string
  children?: ReactNode
}

const AXIS = { y: 'overflow-x-hidden overflow-y-auto', x: 'overflow-x-auto overflow-y-hidden', both: 'overflow-auto' } as const

export function ScrollArea({ label, maxHeight, axis = 'y', className, children }: ScrollAreaProps) {
  return (
    <>
      <style href="ds-scroll-area" precedence="ds">{css}</style>
      <div
        data-ds="scroll-area"
        className={cn('ds-scroll relative overscroll-contain', AXIS[axis] ?? AXIS.y, className)}
        style={maxHeight ? { maxHeight } : undefined}
        role={label ? 'region' : undefined}
        aria-label={label}
        tabIndex={label ? 0 : undefined}
      >
        {children}
      </div>
    </>
  )
}

export default ScrollArea

const css = `
.ds-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-neutral-5) transparent; }
.ds-scroll:focus-visible { outline-offset: calc(var(--ds-border-focus) * -1); }
`
