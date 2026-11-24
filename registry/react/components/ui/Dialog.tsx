'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'

// shadcn's dialog in the brand: a native modal window on the #262626 overlay surface in a neutral hairline with the
// brand corner and no shadow, over a Black scrim. A Funnel Display title, an optional line under it, a ghost close
// button, the body (a short form), and `foot` for the buttons. Focus stays inside; Escape, the close button and the
// scrim close it (`locked`: the scrim does nothing). It starts in the first field; with none, focus rests on the window.
// It comes in over 360ms (a fade and a scale from 0.96, centered, ease-out) and leaves at once; reduced motion keeps
// the fade. `open` with `onOpenChange` (or `defaultOpen` alone).
export interface DialogProps {
  /** The title, and the window's name. */
  title: string
  /** A line under the title. */
  description?: string
  /** 640px instead of 480px. */
  wide?: boolean
  /** The scrim does nothing (the window holds what can't be shown again). */
  locked?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Buttons at the end, under the body. */
  foot?: ReactNode
  children?: ReactNode
}

export function Dialog({ title, description, wide, locked, open: openProp, defaultOpen = false, onOpenChange, foot, children }: DialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      const field = d.querySelector<HTMLElement>('.ds-dialog-body :is(input:not([type="hidden"], [type="file"]), textarea, select):not(:disabled)')
      ;(field && field.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom ? field : d).focus()
    }
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <>
      <style href="ds-dialog" precedence="ds">{css}</style>
      <dialog
        data-ds="dialog"
        ref={dialog}
        className="ds-dialog"
        data-wide={wide || undefined}
        tabIndex={-1}
        aria-label={title}
        onClose={() => setOpen(false)}
        // A click on the scrim lands on the dialog element itself.
        onClick={(event) => { if (event.target === dialog.current && !locked) setOpen(false) }}
      >
        <div className="flex items-start justify-between gap-4 pt-5 pr-4 pl-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
            <h2 className="type-heading-3">{title}</h2>
            {description && <p className="type-ui text-fg-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" icon aria-label="Close" onClick={() => setOpen(false)}><X size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
        </div>
        <div className="ds-dialog-body px-6 pt-5 pb-6">
          {children}
        </div>
        {foot && <div className="flex flex-wrap justify-end gap-2 px-6 pb-6">{foot}</div>}
      </dialog>
    </>
  )
}

export default Dialog

const css = `
.ds-dialog { width: min(480px, calc(100vw - 32px)); margin: auto; padding: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-dialog[data-wide] { width: min(640px, calc(100vw - 32px)); }
.ds-dialog:focus { outline: none; }
.ds-dialog::backdrop { background: var(--ds-color-scrim); }
.ds-dialog[open] { animation: ds-dialog-in var(--ds-duration-entrance) var(--ds-easing-out); }
.ds-dialog[open]::backdrop { animation: ds-dialog-fade var(--ds-duration-entrance) var(--ds-easing-out); }
@keyframes ds-dialog-in { from { opacity: 0; transform: scale(0.96); } }
@keyframes ds-dialog-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-dialog[open] { animation-name: ds-dialog-fade; } }
`
