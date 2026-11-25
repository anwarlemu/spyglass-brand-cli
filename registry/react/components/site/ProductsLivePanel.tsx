'use client'
import { useEffect, useRef, useState } from 'react'
import { GLYPH, OfferRowBody, ROW, STRIP, STRIP_LINK } from '@/react/components/site/MenuPanels'
import { NavIcon } from '@/react/components/site/NavIcon'
import { ProductVisual } from '@/react/components/site/ProductVisual'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { headerMenus, LIVE_CROSSFADE_MS, type ProductsMenu } from '@/lib/site-header'
import { cn } from '@/react/lib/cn'
import { imageFit, toSlot } from '@/lib/image'

// The site header's products menu (site/Header ProductsLivePanel, LiveVisual, ui/WarmPictures): a 320px list of the
// offers (a 40px glyph, the name over a muted line) and the "live soon" row, beside a 540px
// live card that crossfades (160ms) to the row under the pointer or focus: the product's looping scene (`visual`, a
// product-visual kind, at the menu's quicker reading pace) over the ASCII texture, or its `picture`, or the
// texture and its glyph, with where it is live in words in a chip at its corner; for the live soon row, its groups (platforms and integrations, in words). The pictures load
// ahead, hidden, so the card never waits. A strip of build links at the foot.
// The product's scene fills the card at the menu's quicker reading pace (site --dur-read-first-menu, -hold-menu).
const VISUAL = 'absolute inset-0 grid [--ds-read-first:var(--ds-read-first-menu)] [--ds-read-hold:var(--ds-read-hold-menu)]'

export function ProductsLivePanel({ menu = headerMenus.products }: { menu?: ProductsMenu }) {
  const rows = [...menu.offers, ...(menu.soon ? [menu.soon] : [])]
  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const show = (i: number) => {
    if (i === active) return
    window.clearTimeout(timer.current)
    setLeaving(active)
    setActive(i)
    timer.current = window.setTimeout(() => setLeaving(null), LIVE_CROSSFADE_MS)
  }

  const current = rows[active] ?? rows[0]
  const groups = current && 'groups' in current ? current.groups : undefined

  return (
    <div data-ds="products-live-panel" className="contents">
      <div className="flex gap-1 p-1">
        <ul className="flex w-80 flex-none flex-col gap-1">
          {rows.map((item, i) => (
            <li key={item.key}>
              <a className={ROW} href={item.href} data-active={i === active || undefined} onPointerEnter={() => show(i)} onFocus={() => show(i)}>
                <OfferRowBody item={item} />
              </a>
            </li>
          ))}
        </ul>
        {current ? (
          <a href={current.href} tabIndex={-1} aria-hidden="true" className="relative grid w-(--ds-header-live-card-w) flex-none overflow-hidden rounded-ds-sm bg-surface-raised">
            {[leaving, active].map((i) => {
              if (i === null || !rows[i]) return null
              const item = rows[i]
              const picture = toSlot('picture' in item ? item.picture : undefined)
              const visual = 'visual' in item ? item.visual : undefined
              const platforms = 'platforms' in item ? item.platforms : undefined
              return (
                <span key={item.key} data-on={i === active || undefined} className="ds-live-stage relative isolate grid h-full place-items-center overflow-hidden rounded-ds-sm bg-surface-raised opacity-0 [grid-area:1/1] data-on:z-1 data-on:opacity-100">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-1 select-none" style={asciiDriftStyleObject('mass', 'centre', 'faint')} />
                  {visual ? <span className={VISUAL}><ProductVisual kind={visual} texture={false} fill /></span> : picture.src ? <img src={picture.src} alt={picture.alt ?? ''} className="absolute inset-0 size-full object-cover" style={imageFit(picture)} /> : 'groups' in item ? null : <span data-ds-placeholder="" className={cn(GLYPH, 'size-16 rounded-control [--glyph-body:var(--ds-color-neutral-7)] [--glyph-lit:var(--ds-color-fg)]')}><NavIcon name={item.icon} size={24} /></span>}
                  {platforms?.length ? <span className="absolute top-3 left-3 z-2 flex rounded-ds-sm bg-surface px-2 py-1 type-caption text-fg-soft">{platforms.join(', ')}</span> : null}
                </span>
              )
            })}
            {groups ? (
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-2 grid place-items-center content-center gap-8">
                {groups.map((g) => (
                  <span key={g.label} className="grid justify-items-center gap-4">
                    <span className="type-ui text-fg-soft">{g.label}</span>
                    <span className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-6">{g.items.map((w) => <span key={w} className="type-body font-medium text-fg">{w}</span>)}</span>
                  </span>
                ))}
              </span>
            ) : null}
          </a>
        ) : null}
        <div hidden aria-hidden="true" inert>
          {rows.map((item) => ('picture' in item && toSlot(item.picture).src ? <img key={item.key} src={toSlot(item.picture).src} alt="" loading="eager" /> : null))}
        </div>
      </div>
      <div className={STRIP}>
        <span className="type-ui text-fg-muted">{menu.strip.label}</span>
        <ul className="flex gap-1">
          {menu.strip.links.map((link) => <li key={link.label}><a className={STRIP_LINK} href={link.href}>{link.label}</a></li>)}
        </ul>
      </div>
      <style href="ds-products-live-panel" precedence="ds">{css}</style>
    </div>
  )
}

export default ProductsLivePanel

const css = `
.ds-live-stage { transition: opacity var(--ds-duration-micro) var(--ds-easing-out); }
@starting-style { .ds-live-stage[data-on] { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-live-stage { transition: none; } }
`
