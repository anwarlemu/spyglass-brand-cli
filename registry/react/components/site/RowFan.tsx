'use client'
import { useEffect, useRef } from 'react'
import { mountRowFan } from '@/lib/effects/row-fan'
import { ROW_FAN_CSS } from '@/lib/effects/row-fan-css'
import { cn } from '@/react/lib/cn'

// The site's row fan (ui/RowFan, as the templates page sets it): a list of big names, each a link, with a set of
// pictures. Point at, focus or tap a name (on touch and below 1024, scroll it to the middle) and it lifts 16px while
// its pictures fan out, turned in perspective, beside it from 1024 or below it on smaller screens, travelling from row
// to row on a soft spring; its line appears under the name. Point at a card and it opens with the picture's title and
// meta. Pictures come through `rows` (your own images); the layer is hidden from assistive tech and each row's link
// carries `srLabel`. Reduced motion: no travel or scaling, short fades.
export interface FanItem { key: string, src: string, alt?: string, title: string, meta?: string }
export interface FanRow { key: string, name: string, href: string, cta: string, srLabel?: string, items: FanItem[] }
export interface RowFanProps {
  rows: FanRow[]
  /** The img sizes attribute for the cards. */
  sizes?: string
  /** Open the rows' links in a new tab. */
  newTab?: boolean
  className?: string
}

const sideOf = (k: number) => (k % 2 === 0 ? 'l' : 'r')

export function RowFan({ rows, sizes = '(min-width: 1024px) 128px, (min-width: 768px) 96px, 72px', newTab = false, className }: RowFanProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    return root ? mountRowFan(root) : undefined
  }, [rows])
  const most = Math.max(0, ...rows.map((r) => r.items.length))
  const places = Array.from({ length: most }, (_, k) => ({ side: sideOf(k), step: Math.floor(k / 2), k }))
  return (
    <div ref={ref} data-ds="row-fan" data-fan-root="" className={cn('ds-fan', className)}>
      <style href="ds-row-fan" precedence="ds">{ROW_FAN_CSS}</style>
      <ul className="ds-fan-list" role="list">
        {rows.map((row) => (
          <li key={row.key}>
            <a className="ds-fan-row" href={row.href} data-fan-row="" data-fan-cta={row.cta} {...(newTab ? { target: '_blank', rel: 'noreferrer' } : null)}>
              <span className="ds-fan-anchor" data-fan-anchor=""><span className="ds-fan-name" data-fan-name="">{row.name}</span></span>
              {row.srLabel ? <span className="sr-only">{row.srLabel}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      <div className="ds-fan-layer" data-fan-layer="" aria-hidden="true">
        {places.map((p) => (
          <div key={p.k} className="ds-fan-slot" data-fan-slot="" data-side={p.side} data-step={p.step}>
            <div className="ds-fan-turn">
              <div className="ds-fan-chrome" />
              <div className="ds-fan-pic">
                {rows.map((row, i) => {
                  const item = row.items[p.k]
                  if (!item) return null
                  return (
                    <div key={row.key} className="ds-fan-img" data-fan-img="" data-row={i} data-title={item.title} data-meta={item.meta}>
                      <img src={item.src} alt="" sizes={sizes} decoding="async" draggable={false} />
                    </div>
                  )
                })}
              </div>
              <div className="ds-fan-details" data-fan-details="">
                <span className="ds-fan-title" data-fan-title="" />
                <span className="ds-fan-meta" data-fan-meta="" />
              </div>
            </div>
          </div>
        ))}
        {[0, 1].map((k) => <span key={k} className="ds-fan-cta" data-fan-cta=""><span data-fan-cta-label="" /></span>)}
      </div>
    </div>
  )
}

export default RowFan
