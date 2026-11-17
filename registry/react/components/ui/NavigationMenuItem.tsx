'use client'
import { useContext, useEffect, useId, useRef, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { NavigationMenuContext } from '@/react/components/ui/NavigationMenu'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { firstFocusable, usePopover } from '@/react/hooks/usePopover'
import { cn } from '@/react/lib/cn'

// One entry of a NavigationMenu: with children, a trigger and its panel of links (NavigationMenuLink); with `href` and
// no children, a plain link in the row (`active` for the page you are on). The open trigger takes the #262626 fill.
export interface NavigationMenuItemProps {
  /** The trigger's or the link's text. */
  label: string
  /** A plain link in the row, when it has no panel. */
  href?: string
  /** The page you are on (a plain link). */
  active?: boolean
  /** The panel's width (a CSS length). */
  width?: string
  /** The panel's links. */
  children?: ReactNode
}

const WAIT = 150
const GRACE = 150
const ROW = 'inline-flex h-control-md cursor-pointer items-center gap-1.5 rounded-control px-4 type-ui-strong -outline-offset-2 transition-[background-color,color] duration-150 ease-standard max-md:h-control-touch'

export function NavigationMenuItem({ label, href, active, width = '400px', children }: NavigationMenuItemProps) {
  const nav = useContext(NavigationMenuContext)!
  const key = useId()
  const pop = usePopover({ side: 'bottom', align: 'start', gap: 8 })
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hovered = useRef(0)

  useEffect(() => {
    if (pop.open) nav.setActive(key)
    else nav.setActive((a) => (a === key ? null : a))
  }, [pop.open]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (nav.active !== key && pop.open) pop.hide(false, true)
  }, [nav.active]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), [])

  function move(event: KeyboardEvent) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return false
    event.preventDefault()
    const row = nav.row()
    const at = row.indexOf(event.currentTarget as HTMLElement)
    row[(at + (event.key === 'ArrowRight' ? 1 : -1) + row.length) % row.length]?.focus()
    return true
  }

  if (!children) {
    return (
      <li data-ds="navigation-menu-item" className="flex">
        <a data-nav-trigger="" href={href} aria-current={active ? 'page' : undefined} className={cn(ROW, active ? 'text-fg' : 'text-fg-soft hover:bg-action-ghost-hover hover:text-fg')} onKeyDown={move}>{label}</a>
      </li>
    )
  }

  async function openAt(keyboard: boolean, focus: boolean) {
    clearTimeout(timer.current)
    await pop.show({ keyboard })
    if (focus) (firstFocusable(pop.panel.current) ?? pop.panel.current)?.focus({ preventScroll: true })
  }
  function enter(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    clearTimeout(timer.current)
    if (pop.open) return
    // Another panel open: switch at once.
    if (nav.active && nav.active !== key) {
      hovered.current = Date.now()
      return void openAt(true, false)
    }
    // ds-latency: the wait keeps a passing pointer from opening it.
    timer.current = setTimeout(() => {
      hovered.current = Date.now()
      void openAt(false, false)
    }, WAIT)
  }
  function leave(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return
    clearTimeout(timer.current)
    // ds-latency: a grace to cross the gap into the panel.
    timer.current = setTimeout(() => pop.hide(), GRACE)
  }
  // A click toggles it; a click right after the pointer opened it keeps it open.
  function onClick(event: MouseEvent) {
    const keyboard = event.detail === 0
    if (pop.open) {
      if (!keyboard && Date.now() - hovered.current < 400) return
      pop.hide(keyboard, keyboard)
    }
    else void openAt(keyboard, keyboard)
  }
  function onKey(event: KeyboardEvent) {
    if (move(event)) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      void openAt(true, true)
    }
  }
  function onBlur(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (next && !pop.panel.current?.contains(next) && !pop.anchor.current?.contains(next)) pop.hide()
  }
  return (
    <li data-ds="navigation-menu-item" className="flex" onPointerEnter={enter} onPointerLeave={leave}>
      <button
        data-nav-trigger=""
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        aria-expanded={pop.open}
        className={cn(ROW, 'text-fg-soft hover:not-aria-expanded:bg-action-ghost-hover hover:text-fg aria-expanded:bg-action-secondary aria-expanded:text-fg')}
        onClick={onClick}
        onKeyDown={onKey}
        onBlur={onBlur}
      >
        {label}
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-fg-muted" />
      </button>
      <PopoverPanel data-ds="navigation-menu-item" pop={pop} aria-label={label} tabIndex={-1} className="p-2" style={{ width }} onPointerEnter={enter} onPointerLeave={leave}>
        {children}
      </PopoverPanel>
    </li>
  )
}

export default NavigationMenuItem
