'use client'
import { X } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'
import { useSheet } from '@/react/hooks/useSheet'

// shadcn's drawer in the brand: a panel that slides in from an edge over a Black scrim, on the #171717 overlay surface
// with a neutral hairline on its inner edge. `bottom` (the default) is the screen's width and up to 85% of its
// height, with the 8px corner on its top edge only and a grab handle; `left` and `right` are min(320px, 85vw) and full
// height. A Funnel Display title, an optional line under it and a ghost close button head it; the children are the
// body. It slides its own size in over 300ms on the drawer curve and out in 200ms; the scrim fades with it. A press on
// the scrim or Escape (at once, keyboard actions don't animate) closes it, and focus returns to what opened it.
// Reduced motion fades instead of sliding. `open` with `onOpenChange`; children may be a function of `close`.
export interface DrawerProps {
  /** The title, and the panel's name. */
  title: string
  /** A line under the title. */
  description?: string
  /** The edge it comes from. */
  side?: 'bottom' | 'left' | 'right'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode | ((close: () => void) => ReactNode)
}

export function Drawer({ title, description, side = 'bottom', open: given, defaultOpen = false, onOpenChange, children }: DrawerProps) {
  const [open, setOpen] = useControllable(given, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const { shown, onCancel, onClick } = useSheet(dialog, open, setOpen)
  const close = () => setOpen(false)
  return (
    <dialog data-ds="drawer" ref={dialog} className="ds-drawer" data-side={side} data-shown={shown || undefined} aria-label={title} tabIndex={-1} onCancel={onCancel} onClick={onClick}>
      <style href="ds-drawer" precedence="ds">{css}</style>
      {side === 'bottom' && <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-ds-neutral-5" aria-hidden="true" />}
      <div className="flex shrink-0 items-start gap-4 pt-4 pr-4 pb-2 pl-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5">
          <h2 className="type-heading-4">{title}</h2>
          {description && <p className="type-ui text-fg-muted">{description}</p>}
        </div>
        <Button variant="ghost" size="sm" icon aria-label="Close" onClick={close}><X size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 pb-6 fade-y" data-sheet-body="">
        {typeof children === 'function' ? children(close) : children}
      </div>
    </dialog>
  )
}

export default Drawer

const css = `
.ds-drawer { position: fixed; max-width: none; max-height: none; margin: 0; padding: 0; border: 0 solid var(--ds-color-edge); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transition: transform var(--ds-duration-enter) var(--ds-easing-drawer); }
.ds-drawer[open] { display: flex; flex-direction: column; }
.ds-drawer:focus { outline: none; }
.ds-drawer[data-side="bottom"] { inset: auto 0 0; width: 100vw; max-height: 85dvh; border-top-width: var(--ds-border-hairline); border-radius: var(--ds-radius-container) var(--ds-radius-container) 0 0; transform: translateY(100%); padding-bottom: env(safe-area-inset-bottom); }
.ds-drawer[data-side="left"] { inset: 0 auto 0 0; width: min(320px, 85vw); height: 100dvh; border-right-width: var(--ds-border-hairline); transform: translateX(-100%); }
.ds-drawer[data-side="right"] { inset: 0 0 0 auto; width: min(320px, 85vw); height: 100dvh; border-left-width: var(--ds-border-hairline); transform: translateX(100%); }
.ds-drawer[data-shown] { transform: none; transition-duration: var(--ds-duration-entrance); }
.ds-drawer::backdrop { background: var(--ds-color-scrim); opacity: 0; transition: opacity var(--ds-duration-enter) var(--ds-easing-drawer); }
.ds-drawer[data-shown]::backdrop { opacity: 1; transition-duration: var(--ds-duration-entrance); }
@media (prefers-reduced-motion: reduce) {
  .ds-drawer, .ds-drawer[data-side] { transform: none; opacity: 0; transition: opacity var(--ds-duration-enter) var(--ds-easing-out); }
  .ds-drawer[data-shown] { opacity: 1; }
}
`
