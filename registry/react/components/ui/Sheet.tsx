'use client'
import { X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useControllable } from '@/react/hooks/useControllable'
import { firstFocusable } from '@/react/hooks/usePopover'

// A panel at an edge of the screen over the page, for details, filters or settings beside what someone is doing: the
// card's #171717 fill with a #363636 hairline on its inner edge, no shadow. 384px wide at the right (the default) or
// left, the screen on a phone; full width at the top or bottom. A Funnel Display title and a muted line, a close
// button, the body scrolling on its own, and buttons at the foot. It is modal: the page dims under the scrim and stays
// inert, focus stays inside. It slides in from its edge over 300ms on the drawer curve and leaves in 200ms; Escape
// closes it at once; focus returns to what opened it. Reduced motion fades it instead. `open` with `onOpenChange`.
export type SheetSide = 'right' | 'left' | 'top' | 'bottom'

export interface SheetProps {
  /** The title, and the panel's name. */
  title: string
  /** A line under the title. */
  description?: string
  /** The edge it comes from. */
  side?: SheetSide
  /** Whether it is showing (with onOpenChange). */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Buttons at the foot. */
  foot?: ReactNode
  /** The body. */
  children?: ReactNode
}

export function Sheet({ title, description, side = 'right', open: given, defaultOpen = false, onOpenChange, foot, children }: SheetProps) {
  const [open, setOpen] = useControllable(given, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const { shown, onCancel, onClick } = useSheet(dialog, open, setOpen)
  return (
    <dialog data-ds="sheet" ref={dialog} className="ds-sheet" data-side={side} data-shown={shown || undefined} aria-label={title} tabIndex={-1} onCancel={onCancel} onClick={onClick}>
      <style href="ds-sheet" precedence="ds">{css}</style>
      <div className="flex shrink-0 items-start gap-4 px-6 pt-6 pb-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="type-heading-4 text-fg">{title}</h2>
          {description && <p className="type-ui text-fg-muted">{description}</p>}
        </div>
        <button type="button" className="-mt-1.5 -mr-2 inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg max-md:size-control-touch" aria-label="Close" onClick={() => setOpen(false)}><X size={16} strokeWidth={1.5} aria-hidden="true" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6" data-sheet-body="">
        {children}
      </div>
      {foot && <div className="flex shrink-0 justify-end gap-2 border-t border-edge px-6 py-4">{foot}</div>}
    </dialog>
  )
}

/**
 * The sheet's native modal dialog: showModal keeps focus inside and the page inert; the panel and its scrim come in on
 * `data-shown` and leave on its removal, closing once the exit transition has run (read from CSS, so reduced motion and
 * the tokens decide). Escape closes at once (keyboard actions don't animate); the scrim closes it; focus returns to
 * what opened it. Focus starts on the first control in `[data-autofocus]` or the body, else the panel.
 */
function useSheet(dialog: RefObject<HTMLDialogElement | null>, open: boolean, setOpen: (open: boolean) => void, options: { dismissable?: () => boolean } = {}) {
  const [shown, setShownState] = useState(false)
  const isShown = useRef(false)
  const setShown = (v: boolean) => {
    isShown.current = v
    setShownState(v)
  }
  const returnTo = useRef<HTMLElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const exiting = useRef(false)

  function exitMs(el: HTMLElement) {
    const parts = getComputedStyle(el).transitionDuration.split(',').map(s => Number.parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))
    return Math.max(0, ...parts.filter(n => !Number.isNaN(n)))
  }
  async function show() {
    const d = dialog.current
    if (!d || d.open) return
    clearTimeout(timer.current)
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    d.showModal()
    const start = d.querySelector<HTMLElement>('[data-autofocus]') ?? firstFocusable(d.querySelector<HTMLElement>('[data-sheet-body]'))
    ;(start ?? d).focus({ preventScroll: true })
    // One frame at the closed state, so the transition has somewhere to start.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    setShown(true)
  }
  function finish() {
    dialog.current?.close()
    returnTo.current?.focus({ preventScroll: true })
    returnTo.current = null
  }
  function hide(instant = false) {
    const d = dialog.current
    if (!d?.open) return
    if (instant) {
      setShown(false)
      return finish()
    }
    // ds-latency: the dialog stays in the top layer until its exit has played (timed once the panel has re-rendered
    // without data-shown, so its exit duration is the one read).
    if (!isShown.current) timer.current = setTimeout(finish, exitMs(d))
    else {
      exiting.current = true
      setShown(false)
    }
  }
  useEffect(() => {
    const d = dialog.current
    if (shown || !exiting.current || !d) return
    exiting.current = false
    timer.current = setTimeout(finish, exitMs(d))
  }, [shown]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show when it opens (or starts open), hide when it closes.
  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      if (open) void show()
      return
    }
    if (open) void show()
    else hide()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), [])

  /** Escape: at once, no exit motion. */
  function onCancel(event: { preventDefault: () => void }) {
    event.preventDefault()
    if (options.dismissable && !options.dismissable()) return
    setOpen(false)
    hide(true)
  }
  /** A press on the scrim lands on the dialog element itself. */
  function onClick(event: { target: EventTarget | null }) {
    if (event.target === dialog.current && (!options.dismissable || options.dismissable())) setOpen(false)
  }
  return { shown, onCancel, onClick, hide }
}

export default Sheet

const css = `
.ds-sheet { position: fixed; margin: 0; padding: 0; max-width: none; max-height: none; border: 0 solid var(--ds-color-edge-strong); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); transition: transform var(--ds-duration-enter) var(--ds-easing-drawer), opacity var(--ds-duration-enter) var(--ds-easing-drawer); }
.ds-sheet[open] { display: flex; flex-direction: column; }
.ds-sheet:focus { outline: none; }
.ds-sheet[data-side="right"] { inset: 0 0 0 auto; width: min(24rem, 100vw); height: 100dvh; border-left-width: var(--ds-border-hairline); transform: translateX(100%); }
.ds-sheet[data-side="left"] { inset: 0 auto 0 0; width: min(24rem, 100vw); height: 100dvh; border-right-width: var(--ds-border-hairline); transform: translateX(-100%); }
.ds-sheet[data-side="top"] { inset: 0 0 auto 0; width: 100vw; max-height: 100dvh; border-bottom-width: var(--ds-border-hairline); transform: translateY(-100%); }
.ds-sheet[data-side="bottom"] { inset: auto 0 0 0; width: 100vw; max-height: 100dvh; border-top-width: var(--ds-border-hairline); transform: translateY(100%); }
.ds-sheet[data-shown] { transform: none; transition-duration: var(--ds-duration-entrance); }
.ds-sheet::backdrop { background: var(--ds-color-scrim); opacity: 0; transition: opacity var(--ds-duration-enter) var(--ds-easing-standard); }
.ds-sheet[data-shown]::backdrop { opacity: 1; transition-duration: var(--ds-duration-entrance); }
@media (prefers-reduced-motion: reduce) {
  .ds-sheet[data-side] { transform: none; opacity: 0; }
  .ds-sheet[data-side][data-shown] { opacity: 1; }
}
`
