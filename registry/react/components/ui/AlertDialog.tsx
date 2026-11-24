'use client'
import { useEffect, useId, useRef, type ReactNode, type SyntheticEvent } from 'react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'

// shadcn's alert dialog in the brand: a question that needs an answer before anything else, on the #262626 overlay
// surface in a neutral hairline with the brand corner and no shadow, over a Black scrim. A Funnel Display title, one
// line saying what happens, then Cancel (secondary) and the action: the red fill for what removes something
// (`danger`, the default), the White primary otherwise. Focus starts on Cancel; the scrim does nothing, so only a
// choice closes it; Escape cancels and focus returns to what opened it. It comes in over 360ms (a fade and a scale
// from 0.96, centered, ease-out) and leaves at once; reduced motion keeps the fade. `open` with `onOpenChange` (or
// `defaultOpen` alone); `onConfirm` and `onCancel` say which was chosen.
export interface AlertDialogProps {
  /** The question. */
  title: string
  /** One line saying what happens. */
  description: string
  /** The action button's label. */
  action: string
  /** The Cancel button's label. */
  cancel?: string
  /** The red fill for the action (the default); false draws the White primary. */
  danger?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  onCancel?: () => void
  /** More about what happens, under the line. */
  children?: ReactNode
}

// The button's md shape with the danger fill (the seed button has no danger variant).
export const DANGER_BUTTON = 'inline-flex h-control-md shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-4 whitespace-nowrap select-none type-ui-strong bg-action-danger text-ds-neutral-15 transition-[background-color] duration-160 ease-out hover:bg-action-danger-hover'

export function AlertDialog({ title, description, action, cancel = 'Cancel', danger = true, open: openProp, defaultOpen = false, onOpenChange, onConfirm, onCancel, children }: AlertDialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const id = useId()
  const returnTo = useRef<HTMLElement | null>(null)
  const mounted = useRef(false)

  useEffect(() => {
    const d = dialog.current
    const first = !mounted.current
    mounted.current = true
    if (!d) return
    if (open) {
      if (d.open) return
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      d.querySelector<HTMLElement>('[data-cancel]')?.focus()
    }
    else if (!first) {
      if (d.open) d.close()
      returnTo.current?.focus({ preventScroll: true })
      returnTo.current = null
    }
  }, [open])

  function cancelled(event: SyntheticEvent) {
    event.preventDefault()
    onCancel?.()
    setOpen(false)
  }
  function choose(confirmed: boolean) {
    if (confirmed) onConfirm?.()
    else onCancel?.()
    setOpen(false)
  }
  return (
    <>
      <style href="ds-alert-dialog" precedence="ds">{css}</style>
      <dialog data-ds="alert-dialog" ref={dialog} className="ds-alert" role="alertdialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-text`} onCancel={cancelled}>
        <h2 id={`${id}-title`} className="type-heading-3">{title}</h2>
        <p id={`${id}-text`} className="mt-3 type-ui text-fg-muted">{description}</p>
        {children}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button data-cancel variant="secondary" onClick={() => choose(false)}>{cancel}</Button>
          {danger
            ? <button type="button" className={DANGER_BUTTON} onClick={() => choose(true)}>{action}</button>
            : <Button onClick={() => choose(true)}>{action}</Button>}
        </div>
      </dialog>
    </>
  )
}

export default AlertDialog

const css = `
.ds-alert { width: min(440px, calc(100vw - 32px)); margin: auto; padding: var(--ds-space-xl); border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-alert::backdrop { background: var(--ds-color-scrim); }
.ds-alert[open] { animation: ds-alert-in var(--ds-duration-entrance) var(--ds-easing-out); }
.ds-alert[open]::backdrop { animation: ds-alert-fade var(--ds-duration-entrance) var(--ds-easing-out); }
@keyframes ds-alert-in { from { opacity: 0; transform: scale(0.96); } }
@keyframes ds-alert-fade { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-alert[open] { animation-name: ds-alert-fade; } }
`
