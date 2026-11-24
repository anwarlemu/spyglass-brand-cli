'use client'
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { faqSlotHeight, slideFaqRows, type FaqMove } from '@/lib/faq'
import { cn } from '@/react/lib/cn'

// The site's FAQ rows (ui/FaqAccordion, V3Faq.module.css, V2Faq.module.css): questions in DM Sans 20/28 in the soft
// gray (White when open or under the pointer) under #363636 hairlines, 20px above and below (24 from 768), a 12px plus
// that turns to a minus. One answer is open at a time (the first, unless `defaultOpen` says otherwise); it fades in
// over 320ms, 640px wide at most, and every open slot is as tall as the longest answer, so the rows between the one
// closing and the one opening slide by that height (transform only). Arrows, Home and End move between questions.
// Reduced motion: no slide or fade.
export interface FaqAccordionItem {
  q: string
  a: string
  /** An anchor for the row. */
  id?: string
}

export interface FaqAccordionProps {
  items: FaqAccordionItem[]
  /** The row open at first; -1 for none. */
  defaultOpen?: number
  /** The hairline above the list (top, the default) or under it (bottom, the pricing page's). */
  edge?: 'top' | 'bottom'
  /** Centered and no wider than the measure plus 80px (the pricing page's list). */
  narrow?: boolean
  className?: string
}

const ROW = 'relative border-t border-edge bg-surface first:border-t-0'

export function FaqAccordion({ items, defaultOpen = 0, edge = 'top', narrow = false, className }: FaqAccordionProps) {
  const closed = items.length
  const [open, setOpen] = useState(defaultOpen < 0 ? closed : defaultOpen)
  const listRef = useRef<HTMLDivElement>(null)
  const move = useRef<FaqMove | null>(null)
  const uid = useId()

  const select = (clicked: number) => {
    const next = clicked === open ? closed : clicked
    move.current = { from: open, to: next, distance: faqSlotHeight(listRef.current) }
    setOpen(next)
  }

  useLayoutEffect(() => {
    const pending = move.current
    move.current = null
    if (listRef.current && pending) slideFaqRows(listRef.current, pending)
  }, [open])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const triggers = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[data-trigger]') ?? [])]
    const at = triggers.indexOf(document.activeElement as HTMLButtonElement)
    if (at < 0) return
    const target = ({ ArrowDown: (at + 1) % triggers.length, ArrowUp: (at - 1 + triggers.length) % triggers.length, Home: 0, End: triggers.length - 1 } as Record<string, number>)[e.key]
    if (target === undefined) return
    e.preventDefault()
    triggers[target].focus()
  }

  const sizers = (skip: number) => items.map((other, j) => (j === skip ? null : <span key={`${j}-${other.q}`} aria-hidden="true" data-text={other.a} className="invisible block type-body text-pretty text-fg-soft [grid-area:1/1] before:content-[attr(data-text)]" />))

  return (
    <div ref={listRef} data-ds="faq-accordion" onKeyDown={onKeyDown} className={cn('ds-faq min-w-0 overflow-y-clip border-edge [overflow-anchor:none]', edge === 'top' ? 'border-t' : 'border-b', narrow && 'mx-auto max-w-[calc(var(--ds-layout-measure)+var(--ds-space-5xl))]', className)}>
      <style href="ds-faq-accordion" precedence="ds">{css}</style>
      {items.map((item, i) => {
        const isOpen = i === open
        return (
          <div key={`${i}-${item.q}`} id={item.id} data-open={isOpen} className={ROW}>
            <h3 className="[font:inherit]">
              <button
                type="button"
                id={`${uid}-q-${i}`}
                data-trigger=""
                aria-expanded={isOpen}
                aria-controls={`${uid}-a-${i}`}
                onClick={() => select(i)}
                className="group/faq -mx-2 flex min-h-control-lg w-[calc(100%+2*var(--ds-space-sm))] cursor-pointer items-start justify-between gap-6 rounded-ds-sm px-2 py-5 text-left text-fg-soft transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:text-fg active:text-fg aria-expanded:text-fg md:py-6"
              >
                <span className="min-w-0 type-body-lg text-balance">{item.q}</span>
                <span aria-hidden="true" className="ds-faq-icon relative h-7 w-3 flex-none" />
              </button>
            </h3>
            <div data-slot="" className={isOpen ? 'h-auto' : 'h-0'}>
              <div className="grid grid-cols-[minmax(0,var(--ds-layout-measure))] bg-surface pb-6 md:pb-8">
                <div id={`${uid}-a-${i}`} role="region" aria-labelledby={`${uid}-q-${i}`} className="ds-faq-panel [grid-area:1/1]">
                  <p className="block type-body text-pretty text-fg-soft">{item.a}</p>
                </div>
                {sizers(i)}
              </div>
            </div>
          </div>
        )
      })}
      <div data-open={open === closed} aria-hidden="true" className={ROW}>
        <div data-slot="" className={open === closed ? 'h-auto' : 'h-0'}>
          <div className="grid grid-cols-[minmax(0,var(--ds-layout-measure))] bg-surface pb-6 md:pb-8">{sizers(-1)}</div>
        </div>
      </div>
    </div>
  )
}

export default FaqAccordion

const css = `
.ds-faq { --faq-dur: var(--ds-duration-glide); --faq-ease: var(--ds-easing-out); }
.ds-faq-icon { transition: transform var(--ds-duration-press) var(--ds-easing-out); }
.ds-faq-icon::before, .ds-faq-icon::after { content: ""; position: absolute; inset: 0; width: var(--ds-space-md); height: var(--ds-stroke); margin: auto; background: currentColor; }
.ds-faq-icon::after { transform: rotate(90deg); transition: transform var(--ds-duration-glide) var(--ds-easing-out); }
[aria-expanded="true"] > .ds-faq-icon::after { transform: rotate(0deg); }
[aria-expanded="false"]:active > .ds-faq-icon { transform: scale(0.75); }
.ds-faq-panel { visibility: hidden; opacity: 0; transition: opacity var(--ds-duration-glide) var(--ds-easing-out), visibility var(--ds-duration-instant) linear var(--ds-duration-glide); }
[data-open="true"] .ds-faq-panel { visibility: visible; opacity: 1; transition: opacity var(--ds-duration-glide) var(--ds-easing-out); }
@media (prefers-reduced-motion: reduce) {
  .ds-faq-panel, [data-open="true"] .ds-faq-panel, .ds-faq-icon::after { transition: none; }
}
`
