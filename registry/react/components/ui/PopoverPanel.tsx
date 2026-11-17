'use client'
import { useEffect, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Transition } from '@/react/lib/transition'
import { cn } from '@/react/lib/cn'
import type { PopoverController } from '@/react/hooks/usePopover'

// The floating panel every overlay draws (usePopover places it): portalled to the body, fixed where it fits, the
// card's #171717 fill on Black with a #363636 hairline and the brand corner, no shadow. It grows from its anchor, 4px
// and a touch of scale, over 200ms on the strong ease-out, and leaves in 150ms; opened or closed from the keyboard it
// does neither. `tip` is the tooltip's White fill with Black caption text, 2px over 150ms. Reduced motion keeps the
// fade. className, style and other props land on the panel.
export interface PopoverPanelProps extends HTMLAttributes<HTMLDivElement> { pop: PopoverController, tip?: boolean, children?: ReactNode, 'data-ds'?: string }

export function PopoverPanel({ pop, tip, className, style, children, ...rest }: PopoverPanelProps) {
  // Portalled after mount, so the server's render and the first client render agree.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const target = mounted ? pop.target ?? document.body : null
  if (!target) return <style href="ds-popover-panel" precedence="ds">{css}</style>
  const placed: CSSProperties = { left: `${pop.pos.x}px`, top: `${pop.pos.y}px`, transformOrigin: pop.pos.origin, minWidth: pop.pos.minWidth ? `${pop.pos.minWidth}px` : undefined }
  return (
    <>
      <style href="ds-popover-panel" precedence="ds">{css}</style>
      {createPortal(
        <Transition show={pop.open} name="ds-pop" css={!pop.instant}>
          <div
            data-ds="popover-panel"
            {...rest}
            ref={(el) => { pop.panel.current = el }}
            className={cn('ds-pop', className)}
            data-tip={tip || undefined}
            data-side={pop.pos.side}
            data-instant={pop.instant || undefined}
            data-placed={pop.pos.placed || undefined}
            style={{ ...style, ...placed }}
            onBlur={pop.onFocusOut}
          >
            {children}
          </div>
        </Transition>,
        target,
      )}
    </>
  )
}

export default PopoverPanel

const css = `
.ds-pop { position: fixed; z-index: 60; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); overflow: auto; overscroll-behavior: contain; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-container); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); text-align: left; outline: none; }
.ds-pop:not([data-placed]) { visibility: hidden; }
.ds-pop[data-tip] { z-index: 70; overflow: visible; padding: var(--ds-space-xs) var(--ds-space-sm); border-color: var(--ds-color-surface-inverse); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; pointer-events: none; }
.ds-pop-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-pop-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-out), transform var(--ds-duration-exit) var(--ds-easing-out); }
.ds-pop-enter-from, .ds-pop-leave-to { opacity: 0; }
.ds-pop-enter-from[data-side="bottom"], .ds-pop-leave-to[data-side="bottom"] { transform: translateY(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="top"], .ds-pop-leave-to[data-side="top"] { transform: translateY(4px) scale(0.98); }
.ds-pop-enter-from[data-side="right"], .ds-pop-leave-to[data-side="right"] { transform: translateX(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="left"], .ds-pop-leave-to[data-side="left"] { transform: translateX(4px) scale(0.98); }
.ds-pop[data-tip].ds-pop-enter-active, .ds-pop[data-tip].ds-pop-leave-active { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="bottom"], .ds-pop[data-tip].ds-pop-leave-to[data-side="bottom"] { transform: translateY(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="top"], .ds-pop[data-tip].ds-pop-leave-to[data-side="top"] { transform: translateY(2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="right"], .ds-pop[data-tip].ds-pop-leave-to[data-side="right"] { transform: translateX(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="left"], .ds-pop[data-tip].ds-pop-leave-to[data-side="left"] { transform: translateX(2px); }
.ds-pop[data-instant].ds-pop-enter-active, .ds-pop[data-instant].ds-pop-leave-active { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-pop.ds-pop-enter-from, .ds-pop.ds-pop-leave-to { transform: none; }
}
`
