import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The site's browser window (ui/BrowserFrame) around a screenshot or a live part of a page: a #262626 window with a
// #4D4D4D hairline and the 8px corner, a 28px bar with three #666666 dots and the address centered in a #363636 pill
// (a small lock, the address in #D4D4D4 12/16, cut with an ellipsis), the page under it filling the rest, and an
// optional footer row under a hairline. It holds still; the page inside decides what moves.
export interface BrowserFrameProps {
  /** The address in the bar: "acme.com/pricing". */
  url: string
  /** A row under the page, in DM Sans 14/20. */
  footer?: ReactNode
  /** The page: an image, a video or markup. */
  children?: ReactNode
  className?: string
}

export function BrowserFrame({ url, footer, children, className }: BrowserFrameProps) {
  return (
    <div data-ds="browser-frame" className={cn('flex size-full flex-col overflow-hidden rounded-panel border border-edge-surface bg-surface-raised text-fg', className)}>
      <div className="grid h-7 shrink-0 grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 border-b border-edge-surface px-2">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-edge-strong" />
          <span className="size-2 rounded-full bg-edge-strong" />
          <span className="size-2 rounded-full bg-edge-strong" />
        </span>
        <span className="flex h-5 w-full max-w-50 min-w-0 items-center justify-center gap-1 justify-self-center rounded-ds-sm bg-surface-inset px-2 type-caption text-fg-soft">
          <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="size-2 shrink-0 text-fg-muted">
            <path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <rect x="2.5" y="5" width="7" height="5.5" rx="1" fill="currentColor" />
          </svg>
          <span className="truncate">{url}</span>
        </span>
        <span />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      {footer && <div className="flex shrink-0 items-center gap-2 border-t border-edge-surface px-3 py-2 type-ui">{footer}</div>}
    </div>
  )
}

export default BrowserFrame
