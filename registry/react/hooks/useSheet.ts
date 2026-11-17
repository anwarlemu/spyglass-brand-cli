'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { firstFocusable } from '@/react/hooks/usePopover'

/**
 * A native modal dialog that slides (Sheet, Drawer): showModal keeps focus inside and the page inert; the panel and its
 * scrim come in on `data-shown` and leave on its removal, closing once the exit transition has run (read from CSS, so
 * reduced motion and the tokens decide). Escape closes at once (keyboard actions don't animate); the scrim closes it;
 * focus returns to what opened it. Focus starts on the first control in `[data-autofocus]` or the body, else the panel.
 * `open` and `setOpen` are the component's controllable open state (Vue's v-model:open).
 */
export function useSheet(dialog: RefObject<HTMLDialogElement | null>, open: boolean, setOpen: (open: boolean) => void, options: { dismissable?: () => boolean } = {}) {
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
    // without data-shown, as Vue's nextTick, so its exit duration is the one read).
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

  // Vue's watch(open) and onMounted: show when it opens (or starts open), hide when it closes.
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
