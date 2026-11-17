'use client'
import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent } from 'react'

/**
 * A floating panel's behavior, shared by Popover, Tooltip, HoverCard, ContextMenu, Menubar, DatePicker and the
 * listboxes: where it sits (beside its anchor or at a point, flipping to the side with room and kept 8px inside the
 * viewport), where it grows from (its anchor), and how it leaves (a press outside, Escape, focus moving away). Escape
 * closes only the topmost open panel and returns focus to what opened it. PopoverPanel draws the panel.
 */
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
export interface PopoverOptions {
  side?: Side
  align?: Align
  /** Space between the anchor and the panel (4px, as Menu's panel). */
  gap?: number
  /** The panel at least as wide as its anchor (selects, the date field). */
  matchWidth?: boolean
  /** A press outside, or focus leaving, keeps it open (a tooltip closes itself). */
  sticky?: boolean
}
interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

const MARGIN = 8
const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(n, hi))

/** Where a w by h panel goes beside `a` in a vw by vh viewport: the side asked for, or its opposite when only that fits. */
export function place(a: Box, w: number, h: number, vw: number, vh: number, side: Side, align: Align, gap: number) {
  const room: Record<Side, number> = { top: a.top - MARGIN, bottom: vh - a.bottom - MARGIN, left: a.left - MARGIN, right: vw - a.right - MARGIN }
  const need = (side === 'top' || side === 'bottom' ? h : w) + gap
  const s = room[side] < need && room[OPPOSITE[side]] > room[side] ? OPPOSITE[side] : side
  let x: number
  let y: number
  if (s === 'top' || s === 'bottom') {
    y = s === 'bottom' ? a.bottom + gap : a.top - gap - h
    x = align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + a.width / 2 - w / 2
  }
  else {
    x = s === 'right' ? a.right + gap : a.left - gap - w
    y = align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + a.height / 2 - h / 2
  }
  x = Math.max(MARGIN, Math.min(x, vw - w - MARGIN))
  y = Math.max(MARGIN, Math.min(y, vh - h - MARGIN))
  // It grows from the anchor: the edge facing it, at the anchor's middle.
  const ox = s === 'left' ? w : s === 'right' ? 0 : clamp(a.left + a.width / 2 - x, 0, w)
  const oy = s === 'top' ? h : s === 'bottom' ? 0 : clamp(a.top + a.height / 2 - y, 0, h)
  return { x: Math.round(x), y: Math.round(y), side: s, origin: `${Math.round(ox)}px ${Math.round(oy)}px` }
}

// Open panels, the newest last: Escape belongs to the last.
const stack: object[] = []

export interface PopoverPosition { x: number, y: number, side: Side, origin: string, minWidth: number, placed: boolean }

export function usePopover(options: PopoverOptions = {}) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLElement | null>(null)
  const panel = useRef<HTMLElement | null>(null)
  /** Opened from the keyboard (or closed by it): no animation. */
  const [instant, setInstant] = useState(false)
  /** Where the panel is portalled: the body, or the open modal dialog its anchor sits in (outside one is inert). */
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [pos, setPos] = useState<PopoverPosition>({ x: 0, y: 0, side: options.side ?? 'bottom', origin: '0px 0px', minWidth: 0, placed: false })
  const me = useMemo(() => ({}), [])
  const point = useRef<{ x: number, y: number } | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const frame = useRef(0)
  const opts = useRef(options)
  opts.current = options
  const resolveShown = useRef<(() => void) | null>(null)
  const openRef = useRef(open)
  openRef.current = open

  const update = useCallback(() => {
    const el = panel.current
    const p = point.current
    const a = p ? { left: p.x, top: p.y, right: p.x, bottom: p.y, width: 0, height: 0 } : anchor.current?.getBoundingClientRect()
    if (!el || !a) return
    const o = opts.current
    const minWidth = o.matchWidth && !p ? a.width : 0
    const w = Math.max(el.offsetWidth, minWidth)
    const placed = place(a, w, el.offsetHeight, document.documentElement.clientWidth, window.innerHeight, o.side ?? 'bottom', o.align ?? 'start', o.gap ?? 4)
    setPos({ ...placed, minWidth, placed: true })
  }, [])
  const schedule = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(update)
  }, [update])

  /** Opens it; `at` puts it at a point (a context menu), `keyboard` skips the animation. It resolves once the panel is
   * placed and visible, so focus can move into it. */
  const show = useCallback((how: { keyboard?: boolean, at?: { x: number, y: number } } = {}) => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    point.current = how.at ?? null
    setInstant(!!how.keyboard)
    setTarget((anchor.current?.closest('dialog[open]') as HTMLElement | null) ?? document.body)
    setPos(p => ({ ...p, placed: false }))
    setOpen(true)
    return new Promise<void>((resolve) => { resolveShown.current = resolve })
  }, [])
  /** Closes it; `refocus` returns focus to what opened it, `keyboard` closes at once. */
  const hide = useCallback((refocus = false, keyboard = false) => {
    if (!openRef.current) return
    setInstant(keyboard)
    setOpen(false)
    if (refocus) (point.current ? returnTo.current : anchor.current ?? returnTo.current)?.focus({ preventScroll: true })
  }, [])
  const toggle = useCallback((how: { keyboard?: boolean } = {}) => {
    if (openRef.current) hide(how.keyboard, how.keyboard)
    else void show(how)
  }, [hide, show])

  // Once the panel is in the page: place it, then let show() resolve after the placed render.
  useEffect(() => {
    if (!open) return
    if (!pos.placed) update()
    else if (resolveShown.current) {
      resolveShown.current()
      resolveShown.current = null
    }
  }, [open, pos.placed, update])

  useEffect(() => {
    if (!open) return
    stack.push(me)
    function onPointerDown(event: PointerEvent) {
      const t = event.target as Node
      if (panel.current?.contains(t) || anchor.current?.contains(t)) return
      hide()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape' || stack.at(-1) !== me) return
      // A dialog under the panel would take Escape too: it is the panel's.
      event.preventDefault()
      event.stopPropagation()
      hide(true, true)
    }
    if (!opts.current.sticky) document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    const ro = new ResizeObserver(schedule)
    if (panel.current) ro.observe(panel.current)
    return () => {
      const i = stack.indexOf(me)
      if (i >= 0) stack.splice(i, 1)
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame.current)
      ro.disconnect()
    }
  }, [open, hide, schedule, me])

  /** Focus moving to somewhere outside the panel and its anchor closes it (Tab out of a popover). */
  const onFocusOut = useCallback((event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (opts.current.sticky || !next || panel.current?.contains(next) || anchor.current?.contains(next)) return
    hide()
  }, [hide])

  return { open, anchor, panel, instant, target, pos, show, hide, toggle, update, onFocusOut }
}
export type PopoverController = ReturnType<typeof usePopover>

/** Arrow, Home and End keys over a panel's menu rows; Tab closes. For menus drawn in a PopoverPanel. */
export function onMenuRows(event: KeyboardEvent | React.KeyboardEvent, panel: HTMLElement | null, close: (refocus: boolean) => void) {
  const rows = [...(panel?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled]), [role="option"]:not([aria-disabled="true"])') ?? [])]
  const at = rows.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    rows[(at + step + rows.length) % rows.length]?.focus()
  }
  else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    ;(event.key === 'Home' ? rows[0] : rows.at(-1))?.focus()
  }
  else if (event.key === 'Tab') close(false)
}

/** The first thing in `root` that takes focus. */
export function firstFocusable(root: HTMLElement | null) {
  return root?.querySelector<HTMLElement>('button:not(:disabled), [href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') ?? null
}
