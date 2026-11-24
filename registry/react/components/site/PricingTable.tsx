'use client'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Segmented } from '@/react/components/site/Segmented'
import { TextSwap } from '@/react/components/ui/TextSwap'
import { ASCII_TEXTURE } from '@/lib/textures'
import { ASCII_TEXTURE_ALPHA, PLAN_LIGHTS, type PlanLight } from '@/lib/plan-lights'
import { cn } from '@/react/lib/cn'

// The site's plan cards (pages/Pricing PlanCards.tsx, PlanRim.tsx, Pricing.module.css .plans, .tier): the billing switch
// (Monthly or Yearly) over a note, then up to four plans side by side from 1280 (two from 768, one on phones), ruled
// apart by #363636 hairlines, their tiers, buttons and lists lined up across the row. Each plan: a #262626 tier with the
// 8px corner, 24px in, the ASCII texture fading in from its top right corner; the name in Funnel Display 32/36, an
// optional White badge, who it is for in #D4D4D4 14/20 and the price in Funnel Display 40/44 with its unit; the plan's
// button under it (the featured plan's White, the rest quiet); then, under a hairline, a Medium line ("Everything in
// Free, plus:") and what it includes, each after a check. One plan is lit: its tier turns to the plan's own light (the
// site's pre-made ice field with the brand light at its right edge, ASCII glyphs drifting in its dark band), Black type
// and a #4D4D4D ring. A fine pointer resting on another plan lights that one instead (320ms). A plan with `rim` has a
// light running around its edge with ASCII glyphs trailing it. The lights drift slowly while the cards are on screen
// (still with reduced motion, the rim then a quiet hairline).
export interface PricingPlan {
  name: string
  /** Who it is for, one short line. */
  description?: string
  /** "$20" or "Custom". */
  price: string
  /** "/mo". */
  unit?: string
  /** The price when billed yearly: shown when the switch is on Yearly. */
  yearly?: { price: string, unit?: string }
  /** A small Black tag after the monthly price: "Save 25%". */
  tag?: string
  /** A badge beside the name: "Most popular". */
  badge?: string
  /** Lit when no pointer rests on another plan. One per grid. */
  featured?: boolean
  /** Which of the site's tier lights it takes when lit (by position otherwise: free, creator, pro, enterprise). */
  light?: PlanLight
  /** The light running around its edge (the site's Enterprise plan). */
  rim?: boolean
  cta?: string
  href?: string
  /** The line above the list: "Everything in Free, plus:". */
  ladder?: string
  features?: string[]
}

export type Billing = 'monthly' | 'yearly'

export interface PricingTableProps {
  plans: PricingPlan[]
  /** The billing switch's words; shown when a plan has a yearly price. */
  billing?: { label?: string, monthly?: string, yearly?: string }
  /** The line under the switch: a Medium lead and the rest ("Save 20%", " on a yearly subscription"). */
  note?: { lead: string, rest?: string }
  /** Monthly or yearly, controlled with onBillingChange (or defaultBilling alone). */
  value?: Billing
  defaultBilling?: Billing
  onBillingChange?: (billing: Billing) => void
  className?: string
}

const LIGHTS: PlanLight[] = ['free', 'creator', 'pro', 'enterprise']

function Check() {
  return <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="mt-0.5 size-4 text-fg-muted"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
}

export function PricingTable({ plans, billing, note, value, defaultBilling = 'monthly', onBillingChange, className }: PricingTableProps) {
  const [inner, setInner] = useState<Billing>(defaultBilling)
  const period = value ?? inner
  const setPeriod = (b: Billing) => { if (value === undefined) setInner(b); onBillingChange?.(b) }
  const list = useRef<HTMLUListElement>(null)

  // The lights drift only while the cards are on screen and the tab is visible.
  useEffect(() => {
    const root = list.current
    if (!root) return
    let seen = false
    const sync = () => { root.dataset.run = String(seen && document.visibilityState === 'visible') }
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync() })
    io.observe(root)
    document.addEventListener('visibilitychange', sync)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [])

  const yearly = plans.some((p) => p.yearly)
  return (
    <div data-ds="pricing-table" className={cn('flex flex-col text-fg', className)}>
      <style href="ds-pricing-table" precedence="ds">{css}</style>
      {yearly && (
        <div className="mb-8 flex justify-center">
          <Segmented
            label={billing?.label ?? 'Billing'}
            value={period}
            onValueChange={setPeriod}
            options={[{ key: 'monthly', label: billing?.monthly ?? 'Monthly' }, { key: 'yearly', label: billing?.yearly ?? 'Yearly' }]}
          />
        </div>
      )}
      {note && <p className="-mt-4 mb-8 text-center type-ui text-fg-muted"><span className="font-medium text-fg">{note.lead}</span>{note.rest}</p>}
      <ul
        ref={list}
        role="list"
        data-run="false"
        className="ds-plans m-0 grid list-none grid-cols-1 gap-px border border-edge bg-edge p-0 md:-mx-[calc(var(--ds-space-lg)+var(--ds-border-hairline))] md:grid-cols-2 xl:-mx-[calc(var(--ds-space-xl)+var(--ds-border-hairline))] xl:grid-cols-4"
        style={{ '--ascii': `url("${ASCII_TEXTURE}")`, '--ascii-alpha': `url("${ASCII_TEXTURE_ALPHA}")` } as CSSProperties}
      >
        {plans.map((p, i) => {
          const y = period === 'yearly' && p.yearly
          const price = y ? p.yearly!.price : p.price
          const unit = y ? p.yearly!.unit ?? p.unit : p.unit
          const lights = PLAN_LIGHTS[p.light ?? LIGHTS[i % 4]]
          const id = `plan-${i}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          return (
            <li
              key={p.name}
              data-featured={p.featured || undefined}
              className="ds-plan row-span-3 grid grid-rows-subgrid content-start gap-y-6 bg-surface p-4 xl:p-6"
              style={{ '--light': `url("${lights.light}")`, '--light-black': `url("${lights.black}")` } as CSSProperties}
            >
              <div className="ds-tier relative isolate flex min-h-(--ds-plan-tier-min-h) flex-col gap-2 overflow-hidden rounded-panel p-6">
                <span className="ds-tier-ascii" aria-hidden="true" />
                <span className="ds-plan-drift" aria-hidden="true">
                  <span className="ds-plan-light" />
                  <span className="ds-plan-black"><span className="ds-plan-glyphs" /><span className="ds-plan-glyphs ds-plan-shimmer" /></span>
                </span>
                {p.rim && (
                  <>
                    <span className="ds-plan-trail" aria-hidden="true"><span className="ds-plan-window"><span className="ds-plan-trail-glyphs" /></span></span>
                    <span className="ds-plan-rim" aria-hidden="true"><span className="ds-plan-sweep" /><span className="ds-plan-corners"><span className="ds-plan-sweep ds-plan-sweep-color" /></span></span>
                  </>
                )}
                <div className="flex items-center justify-between gap-3">
                  <h2 id={id} className="m-0 type-heading-2">{p.name}</h2>
                  {p.badge && <span className="ds-plan-badge rounded-ds-sm bg-(--ds-color-white) px-2 py-1 whitespace-nowrap text-(--ds-color-black)">{p.badge}</span>}
                </div>
                {p.description && <p className="ds-plan-for m-0 max-w-(--ds-plan-copy-w) type-ui text-pretty">{p.description}</p>}
                <p className="m-0 mt-auto flex flex-wrap items-baseline gap-x-2 pt-8">
                  <TextSwap className="type-figure tabular-nums" text={price} />
                  {(unit || p.tag) && <span className="ds-plan-unit type-ui"><TextSwap text={unit ?? ''} tag={p.tag && !y ? p.tag : undefined} /></span>}
                </p>
              </div>
              {p.cta ? <Button href={p.href} variant={p.featured ? 'primary' : 'secondary'} className="w-full" aria-describedby={id}>{p.cta}</Button> : <span />}
              {(p.ladder || p.features?.length) ? (
                <div className="flex flex-col gap-3 border-t border-edge pt-6">
                  {p.ladder && <p className="m-0 type-ui-strong">{p.ladder}</p>}
                  {p.features?.length ? (
                    <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0 type-ui text-fg-soft">
                      {p.features.map((f) => <li key={f} className="grid grid-cols-[var(--ds-space-lg)_minmax(0,1fr)] items-start gap-x-2"><Check />{f}</li>)}
                    </ul>
                  ) : null}
                </div>
              ) : <span />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PricingTable

// The lit tier and its lights (PlanRim.effect.module.css). --lit is 1 on the lit plan and 0 elsewhere; the tier's type,
// fill, ring, texture and light follow it. The loops run only while [data-run="true"].
const css = `
.ds-plan { --lit: 0; }
.ds-plan[data-featured] { --lit: 1; }
@media (hover: hover) and (pointer: fine) {
  .ds-plans:has(.ds-plan:hover) .ds-plan { --lit: 0; }
  .ds-plans:has(.ds-plan:hover) .ds-plan:hover { --lit: 1; }
}
.ds-tier {
  color: color-mix(in srgb, var(--ds-color-black) calc(var(--lit) * 100%), var(--ds-color-fg));
  background: color-mix(in srgb, var(--ds-color-surface-raised) calc(100% - var(--lit) * 100%), transparent);
  transition: color var(--ds-duration-glide) var(--ds-easing-out), background-color var(--ds-duration-glide) var(--ds-easing-out);
}
.ds-tier::after {
  content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none;
  border: var(--ds-border-hairline) solid var(--ds-color-edge-surface);
  opacity: var(--lit); transition: opacity var(--ds-duration-glide) var(--ds-easing-out);
}
.ds-plan-for { color: color-mix(in srgb, var(--ds-color-black) calc(var(--lit) * 100%), var(--ds-color-fg-soft)); transition: color var(--ds-duration-glide) var(--ds-easing-out); }
.ds-plan-unit { color: color-mix(in srgb, var(--ds-color-neutral-6) calc(var(--lit) * 100%), var(--ds-color-fg-muted)); transition: color var(--ds-duration-glide) var(--ds-easing-out); }
.ds-plan-badge { font-family: var(--ds-font-text); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); font-weight: var(--ds-font-weight-medium); }
.ds-plan-save { line-height: var(--ds-text-ui-leading); }
.ds-tier-ascii {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: var(--ascii) 0 0 / var(--ds-ascii-tile) var(--ds-ascii-tile);
  opacity: calc(var(--ds-ascii-quiet) * (1 - var(--lit))); mix-blend-mode: screen;
  transition: opacity var(--ds-duration-glide) var(--ds-easing-out);
  mask-image: radial-gradient(ellipse 64% 56% at 100% 0%, var(--ds-color-black) 24%, transparent 100%);
}
.ds-plan-drift {
  position: absolute; inset: 0 auto 0 -4%; z-index: -1; width: 116%; pointer-events: none;
  opacity: var(--lit); transition: opacity var(--ds-duration-glide) var(--ds-easing-out);
  will-change: transform, opacity;
  animation: ds-plan-drift var(--ds-plan-light-drift) var(--ds-easing-drift) infinite alternate paused;
}
.ds-plan-light { position: absolute; inset: 0; background: var(--ds-color-plan-ice) var(--light) 0 0 / 100% 100% no-repeat; }
.ds-plan-black, .ds-plan-rim, .ds-plan-trail { position: absolute; inset: 0; z-index: -1; pointer-events: none; border-radius: inherit; overflow: hidden; }
.ds-plan-black { z-index: 0; border-radius: 0; mask: var(--light-black) 0 0 / 100% 100% no-repeat; }
.ds-plan-glyphs {
  position: absolute; inset: calc(-1 * var(--ds-space-2xl));
  background: var(--ascii-alpha) 0 0 / var(--ds-ascii-tile) var(--ds-ascii-tile);
  will-change: transform;
  animation: ds-plan-ascii var(--ds-plan-ascii-drift) var(--ds-easing-drift) infinite alternate paused;
}
.ds-plan-shimmer {
  background-position: calc(-1 * var(--ds-space-xs) * 114) calc(-1 * var(--ds-space-xs) * 144); opacity: 0;
  animation: ds-plan-ascii var(--ds-plan-ascii-drift) var(--ds-easing-drift) infinite alternate paused, ds-plan-shimmer var(--ds-plan-rim-cycle) var(--ds-easing-drift) infinite alternate paused;
}
.ds-plan-rim { padding: var(--ds-plan-rim-w); mask: linear-gradient(var(--ds-color-black) 0 0) content-box exclude, linear-gradient(var(--ds-color-black) 0 0); }
.ds-plan-sweep, .ds-plan-window {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; will-change: transform;
  animation: ds-plan-glide var(--ds-plan-rim-glide) var(--ds-easing-drift) infinite backwards paused;
}
.ds-plan-sweep { background: linear-gradient(135deg, transparent 44.5%, color-mix(in srgb, var(--ds-color-plan-ice) 70%, transparent) 47%, var(--ds-color-plan-ice) 49.5%, color-mix(in srgb, var(--ds-color-plan-ice) 70%, transparent) 52%, transparent 54.5%); }
.ds-plan-corners {
  position: absolute; inset: 0;
  mask: radial-gradient(circle at 0 0, var(--ds-color-black) 0, transparent var(--ds-space-3xl)), radial-gradient(circle at 100% 0, var(--ds-color-black) 0, transparent var(--ds-space-3xl)), radial-gradient(circle at 100% 100%, var(--ds-color-black) 0, transparent var(--ds-space-3xl)), radial-gradient(circle at 0 100%, var(--ds-color-black) 0, transparent var(--ds-space-3xl));
  mask-composite: add;
}
.ds-plan-sweep-color { background: linear-gradient(135deg, transparent 44%, var(--ds-color-spectrum-light-blue) 46%, var(--ds-color-spectrum-light-cyan) 48%, var(--ds-color-plan-ice) 49.5%, var(--ds-color-spectrum-light-yellow) 51%, var(--ds-color-spectrum-light-magenta) 52.5%, var(--ds-color-spectrum-light-red) 54%, transparent 56%); }
.ds-plan-trail {
  mask: linear-gradient(to right, var(--ds-color-black), transparent var(--ds-plan-rim-edge), transparent calc(100% - var(--ds-plan-rim-edge)), var(--ds-color-black)), linear-gradient(to bottom, var(--ds-color-black), transparent var(--ds-plan-rim-edge), transparent calc(100% - var(--ds-plan-rim-edge)), var(--ds-color-black));
  mask-composite: add;
}
.ds-plan-window { mask-image: linear-gradient(135deg, transparent 20%, color-mix(in srgb, var(--ds-color-black) 30%, transparent) 33%, var(--ds-color-black) 46%, transparent 56%); }
.ds-plan-trail-glyphs {
  position: absolute; top: 25%; left: 25%; width: 50%; height: 50%;
  background: var(--ascii-alpha) calc(-1 * var(--ds-space-xs) * 78) calc(-1 * var(--ds-space-xs) * 132) / var(--ds-ascii-tile) var(--ds-ascii-tile);
  opacity: 0.75; will-change: transform;
  animation: ds-plan-hold var(--ds-plan-rim-glide) var(--ds-easing-drift) infinite backwards paused;
}
.ds-plans[data-run="true"] :is(.ds-plan-drift, .ds-plan-glyphs, .ds-plan-sweep, .ds-plan-window, .ds-plan-trail-glyphs) { animation-play-state: running; }
@keyframes ds-plan-drift { from { transform: translateX(-4%); } to { transform: translateX(4%); } }
@keyframes ds-plan-ascii { to { transform: translate(var(--ds-plan-ascii-drift-x), var(--ds-plan-ascii-drift-y)); } }
@keyframes ds-plan-shimmer { to { opacity: var(--ds-ascii-quiet); } }
@keyframes ds-plan-glide { 0% { transform: translate(-58%, -58%); } 50%, 100% { transform: translate(58%, 58%); } }
@keyframes ds-plan-hold { 0% { transform: translate(116%, 116%); } 50%, 100% { transform: translate(-116%, -116%); } }
@media (prefers-reduced-motion: reduce) {
  .ds-plan-drift, .ds-plan-glyphs, .ds-plan-shimmer { animation: none; }
  .ds-plan-sweep, .ds-plan-trail { display: none; }
  .ds-plan-rim { padding: var(--ds-border-hairline); background: var(--ds-color-edge-surface); }
}
`
