'use client'
import { useEffect, useLayoutEffect, useState } from 'react'
import { BAR, MenuSheet } from '@/react/components/site/MenuSheet'
import { GLYPH } from '@/react/components/site/MenuPanels'
import { NAV_LINK, NavMenus } from '@/react/components/site/NavMenus'
import { NavIcon } from '@/react/components/site/NavIcon'
import { SHEET_LINK, SheetDisclosure } from '@/react/components/site/SheetDisclosure'
import { Button } from '@/react/components/ui/Button'
import { Logo } from '@/react/components/visuals/Logo'
import { headerLabels, headerMenus, headerNav, type HeaderLabels, type HeaderMenus, type NavEntry } from '@/lib/site-header'
import { cn } from '@/react/lib/cn'

// The site's header (site/Header: Header, HomeLink, ScrollGround, HeaderKey, NavMenus, MenuSheet): 64px, 72px from
// 1024, in the page's container; the lockup (20px) on the left, from 1280 the links and their menus centered (NavMenus)
// and on the right the sign-in in the links' style beside the White 36px key ("Get API key" under 424px, gone under
// 372). Below 1280 the links fold into the phone sheet (MenuSheet): its menus as disclosures of their rows, its other
// links, the sign-in and the key at its foot. Once the page scrolls 8px the bar takes a Black ground and a hairline
// (fading in, 160ms). With `hideKeyUntil` (a selector, a hero's actions) the key waits, hidden, until that element
// passes under the bar, then grows in and the sign-in slides aside for it. `variant`: default; centered (links and
// menus from 1024); minimal (the lockup and the key only). Menu content comes through `menus` (Acme by default).
export interface HeaderLink extends NavEntry {}

export interface HeaderAction {
  label: string
  href: string
  /** A shorter label for the narrowest phones (the key). */
  short?: string
}

export interface SiteHeaderProps {
  /** The links; entries with `menu` (products, useCases, resources) open that menu. */
  links?: HeaderLink[]
  /** The menus' content. */
  menus?: HeaderMenus
  /** The White key on the right. */
  cta?: HeaderAction
  /** The sign-in before it. */
  secondary?: HeaderAction
  /** Where the lockup links. */
  homeHref?: string
  /** The lockup's accessible name. */
  label?: string
  /** default (links and menus from 1280), centered (from 1024) or minimal (the lockup and the key only). */
  variant?: 'default' | 'centered' | 'minimal'
  /** Keep the key hidden until the element this selector finds has passed under the bar. */
  hideKeyUntil?: string
  /** Stay at the top while the page scrolls (sticky), or scroll away with it. */
  sticky?: boolean
  labels?: HeaderLabels
  className?: string
}

const GRID = { default: 'xl:grid xl:grid-cols-[1fr_auto_1fr]', centered: 'lg:grid lg:grid-cols-[1fr_auto_1fr]', minimal: '' }
const SIGN_IN = { default: 'hidden xl:flex', centered: 'hidden lg:flex', minimal: 'hidden' }
const FROM = { default: 1280, centered: 1024, minimal: 1280 }

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return scrolled
}

function useKeyShown(selector?: string) {
  const [shown, setShown] = useState<'shown' | 'hidden'>('shown')
  const [instant, setInstant] = useState(true)
  useLayoutEffect(() => {
    const hero = selector ? document.querySelector(selector) : null
    const bar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(window.matchMedia('(min-width: 1024px)').matches ? '--ds-size-header' : '--ds-header-bar-phone')) || 0
    const state = (rect: DOMRectReadOnly | null, top: number) => (!rect || (!rect.width && !rect.height) || rect.top < top ? 'shown' : 'hidden')
    setShown(state(hero?.getBoundingClientRect() ?? null, bar()))
    setInstant(true)
    let frame = requestAnimationFrame(() => setInstant(false))
    if (!hero) return () => cancelAnimationFrame(frame)
    let observer: IntersectionObserver | null = null
    let top = -1
    const watch = () => {
      const next = bar()
      if (next === top) return
      top = next
      observer?.disconnect()
      observer = new IntersectionObserver(([entry]) => {
        if (!entry) return
        setShown(state(entry.boundingClientRect, top))
        if (!frame) frame = requestAnimationFrame(() => setInstant(false))
      }, { rootMargin: `-${top}px 0px 0px 0px`, threshold: [0, 1] })
      observer.observe(hero)
    }
    watch()
    window.addEventListener('resize', watch)
    return () => {
      window.removeEventListener('resize', watch)
      observer?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [selector])
  return { shown, instant }
}

export function SiteHeader({
  links = headerNav,
  menus = headerMenus,
  cta = { label: 'Get a free API key', href: '#start', short: 'Get API key' },
  secondary = { label: 'Sign in', href: '#sign-in' },
  homeHref = '/',
  label = 'Spyglass',
  variant = 'default',
  hideKeyUntil,
  sticky = true,
  labels = headerLabels,
  className,
}: SiteHeaderProps) {
  const scrolled = useScrolled()
  const { shown, instant } = useKeyShown(hideKeyUntil)
  const hidden = shown === 'hidden'
  const brand = (
    <a href={homeHref} aria-label={label} className="-ms-2 block flex-none rounded-ds-sm px-2 py-3 text-fg md:-ms-3 md:px-3 md:py-2 lg:py-3 xl:justify-self-start">
      <Logo height={20} label={label} />
    </a>
  )
  const key = () => cta ? (
    <Button href={cta.href} size="xs" className="ds-key">
      <span className="ds-key-full truncate">{cta.label}</span>
      <span className="ds-key-short truncate">{cta.short ?? cta.label}</span>
    </Button>
  ) : null
  const sheetRows = (entry: NavEntry) => {
    if (entry.menu === 'products') { const m = menus.products ?? headerMenus.products; return [...m.offers, ...(m.soon ? [m.soon] : [])].map((r) => ({ key: r.key, name: r.name, href: r.href, icon: r.icon })) }
    if (entry.menu === 'useCases') return (menus.useCases ?? headerMenus.useCases).rows.map((r) => ({ key: r.key, name: r.name, href: r.href, icon: r.icon }))
    return []
  }

  return (
    <header data-ds="site-header" data-variant={variant} className={cn('ds-site-header z-20 text-fg', sticky ? 'sticky top-0' : 'relative', className)}>
      <style href="ds-site-header" precedence="ds">{css}</style>
      <span aria-hidden="true" data-on={scrolled || undefined} className="pointer-events-none absolute inset-0 border-b border-edge bg-surface opacity-0 transition-opacity duration-160 ease-out data-on:opacity-100" />
      <div className={cn(BAR, GRID[variant])}>
        {brand}
        {variant !== 'minimal' ? <NavMenus links={links} menus={menus} label={labels.nav} from={FROM[variant]} /> : null}
        <div className="ds-actions flex min-w-0 flex-[0_1_auto] items-center gap-1 md:gap-2 xl:min-w-auto xl:justify-self-end xl:gap-3">
          <div data-key={shown} data-instant={instant || undefined} className="ds-key-slot relative flex min-w-0 flex-[0_1_auto]">
            <div className="ds-key-room pointer-events-none absolute inset-0">
              {secondary ? <a href={secondary.href} className={cn(NAV_LINK, SIGN_IN[variant], 'pointer-events-auto absolute inset-y-0 right-[calc(100%+var(--ds-space-md))] my-auto px-3 whitespace-nowrap')}>{secondary.label}</a> : null}
            </div>
            <div inert={hidden} aria-hidden={hidden || undefined} className="ds-key-box flex min-w-0">{key()}</div>
          </div>
          {variant !== 'minimal' ? (
            <MenuSheet
              label={labels.menu}
              closeLabel={labels.close}
              until={FROM[variant]}
              brand={brand}
              action={<div className="flex min-w-0 flex-[0_1_auto]">{key()}</div>}
              foot={
                <>
                  {secondary ? <Button href={secondary.href} variant="secondary" className="w-full">{secondary.label}</Button> : null}
                  {cta ? <div className="contents md:hidden"><Button href={cta.href} className="w-full">{cta.label}</Button></div> : null}
                </>
              }
            >
              <nav aria-label={labels.nav} className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">
                <ul>
                  {links.map((entry) => (
                    <li key={entry.label} className="flex flex-col border-t border-edge first:border-t-0 last:border-b">
                      {entry.menu && entry.menu !== 'resources' ? (
                        <SheetDisclosure label={entry.label}>
                          <ul className="grid gap-x-4 pb-2 md:grid-cols-2">
                            {sheetRows(entry).map((row) => (
                              <li key={row.key}>
                                <a href={row.href} className="-mx-2 flex min-h-12 items-center gap-3 rounded-control px-2 type-body text-fg transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-space-xs))] hover:text-fg-soft active:text-fg-soft">
                                  <span className={cn(GLYPH, 'size-8 rounded-ds-sm')}><NavIcon name={row.icon} /></span>
                                  {row.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </SheetDisclosure>
                      ) : (
                        <a href={entry.menu === 'resources' ? (menus.resources ?? headerMenus.resources).all.href : entry.href} aria-current={entry.current ? 'page' : undefined} className={SHEET_LINK}>{entry.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </MenuSheet>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default SiteHeader

const css = `
.ds-key-box { transition: opacity var(--ds-duration-entrance) var(--ds-easing-out) var(--ds-duration-slow), transform var(--ds-duration-entrance) var(--ds-easing-out) var(--ds-duration-slow), visibility var(--ds-duration-instant) linear; }
.ds-key-room { transition: transform var(--ds-duration-slow) var(--ds-easing-out); }
.ds-key-slot[data-key="hidden"] .ds-key-box {
  opacity: 0; transform: scale(var(--ds-menu-from-scale)); visibility: hidden; pointer-events: none;
  transition: opacity var(--ds-duration-close) var(--ds-easing-out), transform var(--ds-duration-close) var(--ds-easing-out), visibility var(--ds-duration-instant) linear var(--ds-duration-close);
}
.ds-key-slot[data-instant] .ds-key-box, .ds-key-slot[data-instant] .ds-key-room { transition: none; }
.ds-key-short { display: none; }
@media (max-width: 423px) {
  .ds-actions { gap: 0; }
  .ds-key-full { display: none; }
  .ds-key-short { display: block; }
}
@media (max-width: 371px) { .ds-key-slot .ds-key { display: none; } }
@media (min-width: 1024px) {
  .ds-site-header[data-variant="centered"] .ds-key-slot[data-key="hidden"] .ds-key-room { transform: translateX(calc(100% + var(--ds-space-xl))); transition-delay: var(--ds-duration-close); }
}
@media (min-width: 1280px) {
  .ds-site-header[data-variant="default"] .ds-key-slot[data-key="hidden"] .ds-key-room { transform: translateX(calc(100% + var(--ds-space-xl))); transition-delay: var(--ds-duration-close); }
}
@media (prefers-reduced-motion: reduce) {
  .ds-key-box { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), visibility var(--ds-duration-instant) linear; }
  .ds-key-slot[data-key="hidden"] .ds-key-box { transform: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-out), visibility var(--ds-duration-instant) linear var(--ds-duration-micro); }
  .ds-key-room { transition: none; }
}
`
