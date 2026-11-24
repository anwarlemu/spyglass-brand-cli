'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import { Button } from '@/react/components/ui/Button'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { LightImage } from '@/react/components/visuals/LightImage'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { startPanelsMotion } from '@/lib/panels-motion'
import { PANEL_RANK, pricingPanelSets, pricingPanelsContent, sentences, type PanelCreative, type PricingPanelsContent } from '@/lib/home/pricing'
import { cn } from '@/react/lib/cn'

// The home's pricing strip (site v2/V2Pricing with Panels and PanelsMotion): the headline in two lines, the terms
// (each sentence kept whole on phones), the White button and the quiet one; from 1024 a run of five creatives stands
// to the right, turned away in perspective, each slot stepping back and up, and the sets take turns: one creative after
// another fades in while settling from 85% on a spring-like curve, holds, and gives way to the next set (the motion in
// lib/panels-motion.ts, shared with the products pages' records). It runs only on screen; reduced motion keeps the
// first set still. The site's pricing light (light-image) runs through the stage from 1280, dimming a little between
// sets, and fills a band under the copy from 768 to 1024. Under 768 the copy centers and the buttons stack full width. `sets` are five sets of five
// creatives (Acme placeholders by default; images through `src`).
export interface PricingPanelsBlockProps {
  content?: PricingPanelsContent
  /** The sets of creatives that take turns in the run, five creatives each. */
  sets?: PanelCreative[][]
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function PricingPanelsBlock({ content: c = pricingPanelsContent, sets = pricingPanelSets, className }: PricingPanelsBlockProps) {
  const stage = useRef<HTMLDivElement>(null)
  useEffect(() => (stage.current ? startPanelsMotion(stage.current) : undefined), [sets])
  const slots = sets[0]?.length ?? 0
  return (
    <section data-ds="pricing-panels-block" className={cn('ds-pp relative isolate overflow-x-clip text-fg', className)}>
      <style href="ds-pricing-panels-block" precedence="ds">{css}</style>
      <span aria-hidden="true" className="ds-pp-drift" style={asciiDriftStyleObject('mass', 'right')} />
      <div className={cn(CONTAINER, 'grid items-center gap-12 lg:grid-cols-[max-content_minmax(0,1fr)]')}>
        <div className="flex flex-col items-center text-center md:items-start md:text-start">
          <h2 className="ds-pp-head type-section">
            {c.lines.map((line, i) => <span key={line} className="block">{line}{i < c.lines.length - 1 ? ' ' : null}</span>)}
          </h2>
          <p className="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">
            {sentences(c.note).map((s, i) => <span key={s}>{i > 0 ? ' ' : null}<span className="ds-pp-sentence">{s}</span></span>)}
          </p>
          <div className="mt-10 grid gap-3 self-stretch md:inline-grid md:auto-cols-fr md:grid-flow-col md:self-start">
            <Button href={c.primary.href}>{c.primary.label}</Button>
            <Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>
          </div>
        </div>
        <div aria-hidden="true" className="ds-pp-band"><span className="ds-pp-band-light"><LightImage art="pricing" width={1320} height={700} split={12} className="absolute inset-0 size-full" /></span></div>
        <div ref={stage} aria-hidden="true" className="ds-pp-stage">
          <span className="ds-pp-light" data-light=""><LightImage art="pricing" className="absolute inset-0 size-full" /></span>
          <div className="ds-pp-view">
            <div className="ds-pp-run">
              {Array.from({ length: slots }, (_, slot) => (
                <div key={slot} className="ds-pp-card" style={{ '--i': slot } as CSSProperties}>
                  {sets.map((set, s) => {
                    const item = set[slot] ?? {}
                    return (
                      <div key={s} className="ds-pp-picture" data-set={s} data-rank={PANEL_RANK[slot] ?? slot}>
                        <CreativeCard ratio="fill" src={item.src} alt="" brand={item.brand} tone={item.tone} />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingPanelsBlock

const css = `
.ds-pp { padding-block: var(--ds-layout-section); }
.ds-pp-drift { position: absolute; z-index: -1; display: none; pointer-events: none; user-select: none; }
.ds-pp-stage { display: none; }
.ds-pp-view { position: absolute; inset: 0; perspective: var(--ds-price-perspective); perspective-origin: 50% var(--ds-price-eye-y); }
.ds-pp-run { position: absolute; left: 0; bottom: 0; transform-style: preserve-3d; transform: rotateY(var(--ds-price-turn)); }
.ds-pp-card { --w: var(--ds-price-card-w); --h: var(--ds-price-card-h); --z: var(--ds-price-step-z); position: absolute; left: 0; bottom: 0; width: var(--w); height: var(--h); transform: translate3d(0, calc(var(--i) * var(--ds-price-step-y) * -1), calc(var(--i) * var(--z) * -1)); backface-visibility: hidden; pointer-events: none; }
.ds-pp-picture { position: absolute; inset: 0; opacity: 0; user-select: none; }
.ds-pp-picture[data-set="0"] { opacity: 1; }
@media (width < 768px) { .ds-pp-sentence { display: inline-block; } }
@media (width < 1024px) { .ds-pp-head { text-box: trim-start cap alphabetic; } }
@media (min-width: 768px) and (width < 1024px) { .ds-pp { padding-bottom: calc(var(--ds-layout-section) - var(--ds-space-md)); } }
@media (min-width: 1024px) {
  .ds-pp { padding-block: calc(var(--ds-layout-section) + var(--ds-space-4xl)) calc(var(--ds-layout-section) * 2 + var(--ds-space-7xl) + var(--ds-space-2xl) + var(--ds-space-xs)); }
  .ds-pp-drift { display: block; top: var(--ds-layout-section); right: 0; width: min(480px, 36%); height: calc(var(--ds-space-7xl) + var(--ds-space-2xl)); }
  .ds-pp-stage { position: relative; display: block; align-self: end; margin-bottom: calc(var(--ds-space-3xl) * -1); height: var(--ds-price-stage-h); pointer-events: none; }
}
@media (min-width: 1024px) and (width < 1600px) { .ds-pp { padding-bottom: calc(var(--ds-layout-section) * 2 + var(--ds-space-7xl) + var(--ds-space-2xl) + var(--ds-space-lg) + var(--ds-space-xs)); } }
@media (min-width: 1280px) {
  .ds-pp-stage { height: var(--ds-price-stage-h-xl); }
  .ds-pp-view { perspective: var(--ds-price-perspective-xl); }
  .ds-pp-run { left: var(--ds-price-run-x-xl); }
  .ds-pp-card { --w: var(--ds-price-card-w-xl); --h: var(--ds-price-card-h-xl); --z: var(--ds-price-step-z-xl); }
}
.ds-pp-band { display: none; }
.ds-pp-band-light { position: absolute; top: 50%; left: 50%; display: block; width: var(--ds-price-phone-light-w); height: var(--ds-price-phone-light-h); translate: -50% -50%; scale: 0.8; mix-blend-mode: plus-lighter; }
@media (min-width: 768px) and (width < 1024px) { .ds-pp-band { position: relative; display: block; height: calc(0.8 * var(--ds-price-phone-band-h)); pointer-events: none; } }
.ds-pp-light { display: none; }
@media (min-width: 1280px) {
  .ds-pp-light {
    --f0: var(--ds-price-light-fade-from);
    --fd: calc(var(--ds-price-light-fade-to) - var(--ds-price-light-fade-from));
    position: absolute; z-index: -1; display: block;
    left: calc(var(--ds-price-run-x-xl) - var(--ds-price-light-anchor-x)); bottom: calc(var(--ds-price-light-anchor-y) - var(--ds-price-light-h));
    width: var(--ds-price-light-w); height: var(--ds-price-light-h); mix-blend-mode: plus-lighter;
    mask-image:
      linear-gradient(to right, transparent var(--f0), color-mix(in srgb, var(--ds-color-black) 4%, transparent) calc(var(--f0) + var(--fd) * 0.125), color-mix(in srgb, var(--ds-color-black) 16%, transparent) calc(var(--f0) + var(--fd) * 0.25), color-mix(in srgb, var(--ds-color-black) 32%, transparent) calc(var(--f0) + var(--fd) * 0.375), color-mix(in srgb, var(--ds-color-black) 50%, transparent) calc(var(--f0) + var(--fd) * 0.5), color-mix(in srgb, var(--ds-color-black) 68%, transparent) calc(var(--f0) + var(--fd) * 0.625), color-mix(in srgb, var(--ds-color-black) 84%, transparent) calc(var(--f0) + var(--fd) * 0.75), color-mix(in srgb, var(--ds-color-black) 96%, transparent) calc(var(--f0) + var(--fd) * 0.875), var(--ds-color-black) var(--ds-price-light-fade-to)),
      linear-gradient(to bottom, transparent 136px, var(--ds-color-black) 232px);
    mask-composite: intersect;
  }
}
`
