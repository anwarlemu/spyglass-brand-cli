'use client'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'
import { ResourcesPanel, UseCasesPanel } from '@/react/components/site/MenuPanels'
import { Chevron } from '@/react/components/site/NavIcon'
import { ProductsLivePanel } from '@/react/components/site/ProductsLivePanel'
import { headerMenus, headerNav, MENU_GRACE_MS, MENU_INTENT_MS, type HeaderMenus, type MenuKey, type NavEntry } from '@/lib/site-header'
import { cn } from '@/react/lib/cn'

// The site header's links and menus (site/Header NavMenus): DM Sans 14/20 links in the soft gray, 36px tall with 16px
// in, filling #262626 under the pointer; Products, Use cases and Resources open their panels 24px under the bar.
// Under a mouse a menu opens after a short pause (80ms) and, once one is open, moving to another swaps at once; leaving
// the links and the panel closes it after 240ms. A click opens it and keeps it open (a second click closes it); Enter,
// Space or ArrowDown open it with focus on its first link (ArrowUp on its last), arrows, Home and End move through its
// links, Escape closes it and gives focus back to its link, and a click or focus outside closes it. A panel opens by
// fading in, rising 8px and growing from 96% (240ms; 160ms out); from the keyboard, or swapping, it appears at once.
// Reduced motion keeps the fade.
export const NAV_LINK = 'relative flex h-control-xs items-center rounded-control px-4 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out after:absolute after:inset-x-0 after:-inset-y-1 hover:bg-surface-raised hover:text-fg focus-visible:text-fg active:text-fg aria-[current=page]:text-fg'

type Via = 'hover' | 'click'

const WIDTH: Record<MenuKey, string> = {
  products: 'w-[min(var(--ds-header-menu-products-w),calc(100vw-2*var(--ds-layout-gutter)))]',
  useCases: 'w-[min(var(--ds-header-menu-cases-w),calc(100vw-2*var(--ds-layout-gutter)))]',
  resources: 'w-[min(var(--ds-header-menu-resources-w),calc(100vw-2*var(--ds-layout-gutter)))]',
}

function links(panel: HTMLElement | null | undefined) {
  return panel ? [...panel.querySelectorAll<HTMLElement>('a[href]:not([tabindex="-1"])')].filter((a) => a.getClientRects().length > 0) : []
}

export interface NavMenusProps {
  /** The links; entries with `menu` open that menu. */
  links?: NavEntry[]
  menus?: HeaderMenus
  /** The nav's accessible name. */
  label?: string
  /** The width the links show from (1280 or 1024); hidden below it. */
  from?: number
  className?: string
}

export function NavMenus({ links: entries = headerNav, menus = headerMenus, label = 'Main', from = 1280, className }: NavMenusProps) {
  const [open, setOpen] = useState<MenuKey | null>(null)
  const [instant, setInstant] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const triggers = useRef<Partial<Record<MenuKey, HTMLButtonElement | null>>>({})
  const panels = useRef<Partial<Record<MenuKey, HTMLDivElement | null>>>({})
  const via = useRef<Via>('click')
  const timer = useRef<number | undefined>(undefined)
  const pendingFocus = useRef<'first' | 'last' | null>(null)
  const openRef = useRef<MenuKey | null>(null)
  const uid = useId()
  const panelId = (key: MenuKey) => `${uid}-${key}`

  const clearTimer = () => {
    window.clearTimeout(timer.current)
    timer.current = undefined
  }
  const show = (key: MenuKey, how: Via, keyboard = false) => {
    clearTimer()
    via.current = how
    setInstant(keyboard || (openRef.current !== null && openRef.current !== key))
    openRef.current = key
    setOpen(key)
  }
  const hide = () => {
    clearTimer()
    openRef.current = null
    setInstant(false)
    setOpen(null)
  }

  useEffect(() => {
    if (!open || !pendingFocus.current) return
    const items = links(panels.current[open])
    const target = pendingFocus.current === 'first' ? items[0] : items[items.length - 1]
    pendingFocus.current = null
    target?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const nav = navRef.current
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const hadFocus = nav?.contains(document.activeElement)
      hide()
      if (hadFocus) triggers.current[open]?.focus()
    }
    const onPointerDown = (e: globalThis.PointerEvent) => { if (nav && !nav.contains(e.target as Node)) hide() }
    const wide = window.matchMedia(`(min-width: ${from}px)`)
    const onNarrow = () => { if (!wide.matches) hide() }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    wide.addEventListener('change', onNarrow)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      wide.removeEventListener('change', onNarrow)
    }
  }, [open, from])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onTriggerClick = (key: MenuKey, e: MouseEvent<HTMLButtonElement>) => {
    clearTimer()
    const keyboard = e.detail === 0
    if (open === key) {
      if (via.current === 'hover' && !keyboard) {
        via.current = 'click'
        return
      }
      hide()
      return
    }
    if (keyboard) pendingFocus.current = 'first'
    show(key, 'click', keyboard)
  }
  const onTriggerKeyDown = (key: MenuKey, e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    if (open === key) {
      const items = links(panels.current[key])
      ;(e.key === 'ArrowDown' ? items[0] : items[items.length - 1])?.focus()
      return
    }
    pendingFocus.current = e.key === 'ArrowDown' ? 'first' : 'last'
    show(key, 'click', true)
  }
  const onTriggerEnter = (key: MenuKey, e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse') return
    clearTimer()
    if (open) {
      if (open !== key) show(key, 'hover')
      return
    }
    timer.current = window.setTimeout(() => show(key, 'hover'), MENU_INTENT_MS)
  }
  const onTriggerLeave = (e: PointerEvent<HTMLButtonElement>) => { if (e.pointerType === 'mouse' && !open) clearTimer() }
  const onNavEnter = (e: PointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse' && open) clearTimer() }
  const onNavLeave = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return
    clearTimer()
    if (open && via.current === 'hover') timer.current = window.setTimeout(hide, MENU_GRACE_MS)
  }
  const onNavBlur = (e: FocusEvent<HTMLElement>) => { if (open && !navRef.current?.contains(e.relatedTarget as Node | null)) hide() }
  const onPanelKeyDown = (key: MenuKey, e: KeyboardEvent<HTMLDivElement>) => {
    const items = links(panels.current[key])
    const at = items.indexOf(document.activeElement as HTMLElement)
    if (at < 0) return
    let next = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(at + 1, items.length - 1)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(at - 1, 0)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    if (next < 0) return
    e.preventDefault()
    items[next]?.focus()
  }

  const panel = (key: MenuKey, body: ReactNode) => (
    <div
      ref={(el) => { panels.current[key] = el }}
      id={panelId(key)}
      data-open={open === key || undefined}
      inert={open !== key}
      onKeyDown={(e) => onPanelKeyDown(key, e)}
      onClick={(e) => { if ((e.target as Element).closest('a')) hide() }}
      className={cn('ds-menu-panel absolute top-[calc(100%+var(--ds-header-menu-gap))] left-1/2 z-20 rounded-control border border-edge bg-surface-subtle text-fg before:absolute before:inset-x-0 before:bottom-full before:h-(--ds-header-menu-gap)', WIDTH[key])}
    >
      {body}
    </div>
  )
  const has = (key: MenuKey) => entries.some((e) => e.menu === key) && Boolean(menus[key] ?? headerMenus[key])

  return (
    <nav ref={navRef} data-ds="nav-menus" aria-label={label} data-instant={instant || undefined} onPointerEnter={onNavEnter} onPointerLeave={onNavLeave} onBlur={onNavBlur} className={cn('ds-nav-menus relative', from === 1024 ? 'hidden lg:block' : 'hidden xl:block', className)}>
      <style href="ds-nav-menus" precedence="ds">{css}</style>
      <ul className="flex gap-1">
        {entries.map((item) => item.menu ? (
          <li key={item.label} className={item.menu === 'resources' ? 'relative' : undefined}>
            <button
              ref={(el) => { triggers.current[item.menu!] = el }}
              type="button"
              aria-expanded={open === item.menu}
              aria-controls={panelId(item.menu)}
              onClick={(e) => onTriggerClick(item.menu!, e)}
              onKeyDown={(e) => onTriggerKeyDown(item.menu!, e)}
              onPointerEnter={(e) => onTriggerEnter(item.menu!, e)}
              onPointerLeave={onTriggerLeave}
              className={cn(NAV_LINK, 'cursor-pointer gap-1 aria-expanded:bg-surface-raised aria-expanded:text-fg')}
            >
              {item.label}
              <Chevron className="ds-nav-chevron" />
            </button>
            {item.menu === 'resources' && has('resources') ? panel('resources', <ResourcesPanel menu={menus.resources ?? headerMenus.resources} />) : null}
          </li>
        ) : (
          <li key={item.label}><a className={NAV_LINK} href={item.href} aria-current={item.current ? 'page' : undefined}>{item.label}</a></li>
        ))}
      </ul>
      {has('products') ? panel('products', <ProductsLivePanel menu={menus.products ?? headerMenus.products} />) : null}
      {has('useCases') ? panel('useCases', <UseCasesPanel menu={menus.useCases ?? headerMenus.useCases} />) : null}
    </nav>
  )
}

export default NavMenus

const css = `
.ds-menu-panel {
  visibility: hidden; opacity: 0; transform-origin: top center;
  transform: translate(-50%, calc(-1 * var(--ds-header-menu-rise))) scale(var(--ds-menu-from-scale));
  transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out), visibility var(--ds-duration-instant) linear var(--ds-duration-micro);
}
.ds-menu-panel[data-open] {
  visibility: visible; opacity: 1; transform: translate(-50%, 0);
  transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out), visibility var(--ds-duration-instant);
}
.ds-nav-menus[data-instant] .ds-menu-panel { transition: none; }
.ds-nav-chevron { transition: transform var(--ds-duration-micro) var(--ds-easing-out); }
[aria-expanded="true"] > .ds-nav-chevron { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) {
  .ds-menu-panel, .ds-menu-panel[data-open] { transform: translate(-50%, 0); }
  .ds-nav-chevron { transition: none; }
}
`
