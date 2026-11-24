import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The site's product pricing section (pages/Products/ProductPricing and its variants). The site shows `receipt`: the
// section head, a lead, the free note in 14/20 #A3A3A3 and two buttons beside a receipt on #1A1A1A with the 8px corner
// (16px in, 32 from 768): the product and its rate over a "Credits" column, three records (a 4:5 picture, 48px, 64 from
// 768; the name and a muted line; what each costs), the free row (an empty frame with a plus, or a picture) costing
// "Free", then under a #666666 rule the tally and the total in Funnel Display (24/28, 32/36 from 768) and the free
// credits left. `open` sets the rate large beside what is free; `plans` sets what each plan buys at the rate; `rate`
// is the rate alone in a ruled card beside the free note. Copy 5 parts to 7 from 1024; centered on phones. Nothing moves.
export type ProductPricingVariant = 'receipt' | 'open' | 'plans' | 'rate'

export interface ReceiptRow {
  name: string
  meta: string
  /** A 4:5 picture; a neutral block when left out. */
  picture?: string
}

export interface PricingPlanLine {
  name: string
  /** "$10", "Custom" or "From $20". */
  price: string
  unit?: string
  /** "5,000 credits a month": the leading number sets how many records it buys. */
  credits?: string
  /** Shown when `credits` has no number. */
  after?: string
}

export interface ProductPricingAction { label: string; href: string }

export interface ProductPricingProps {
  variant?: ProductPricingVariant
  /** The rate: "1 credit". */
  value: string
  /** "per creator found". */
  unit: string
  headline?: string
  lead?: string
  /** The free line under the lead. */
  note?: string
  primary?: ProductPricingAction
  secondary?: ProductPricingAction
  /** receipt: the product's name at the top. */
  product?: string
  /** receipt: three records. */
  rows?: ReceiptRow[]
  /** receipt: the free row. */
  free?: ReceiptRow
  /** receipt: "3 creators found". */
  tally?: string
  /** Free credits a month. */
  freeMonthly?: number
  /** open: what is free, label and value. */
  freeRows?: { label: string; value: string }[]
  /** open: "Find 20 creators, use 20 credits." */
  example?: string
  /** plans: the plans. */
  plans?: PricingPlanLine[]
  /** plans: what the records are called: "creators". */
  noun?: string
  /** rate: the second line beside the rate. */
  missing?: string
  /** Prefix for the heading id. */
  id?: string
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const fmt = (n: number) => n.toLocaleString('en-US')
const credits = (n: number) => `${fmt(n)} ${n === 1 ? 'credit' : 'credits'}`
const each = (value: string) => { const n = Number.parseInt(value, 10); return Number.isFinite(n) && n > 0 ? n : 1 }
const leading = (line?: string) => { const m = line?.match(/^[\d,]+/); return m ? Number(m[0].replace(/,/g, '')) : null }

function Actions({ primary, secondary, className }: { primary?: ProductPricingAction; secondary?: ProductPricingAction; className?: string }) {
  if (!primary && !secondary) return null
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {primary && <Button href={primary.href}>{primary.label}</Button>}
      {secondary && <Button href={secondary.href} variant="secondary">{secondary.label}</Button>}
    </div>
  )
}

function Picture({ src }: { src?: string }) {
  return src
    ? <img src={src} alt="" width={64} height={80} className="block aspect-4/5 h-auto w-12 rounded-ds-sm object-cover md:w-16" />
    : <span aria-hidden="true" className="block aspect-4/5 w-12 rounded-ds-sm bg-surface-inset md:w-16" />
}

export function ProductPricing({
  variant = 'receipt',
  value,
  unit,
  headline,
  lead,
  note = '500 free credits every month. No card required.',
  primary = { label: 'Get a free API key', href: '#' },
  secondary = { label: 'See pricing', href: '/pricing' },
  product = '',
  rows = [],
  free = { name: 'Add a missing brand', meta: 'Indexed automatically' },
  tally = '',
  freeMonthly = 500,
  freeRows = [],
  example,
  plans = [],
  noun = 'records',
  missing = 'Missing a brand or creator? Add it for free. Spyglass indexes it automatically.',
  id = 'product',
  className,
}: ProductPricingProps) {
  const headingId = `${id}-pricing-heading`
  const per = each(value)

  if (variant === 'open') {
    return (
      <section data-ds="product-pricing" aria-labelledby={headingId} className={cn('border-t border-edge py-(--ds-layout-section) text-fg', className)}>
        <style href="ds-product-pricing" precedence="ds">{css}</style>
        <div className={cn(WRAP, 'ds-pp-open grid grid-cols-[minmax(0,1fr)] gap-y-12 lg:gap-x-16 xl:gap-x-24')}>
          <div className="[grid-area:head]">
            <h2 id={headingId} className="type-section">{headline ?? 'Pay for what you get back.'}</h2>
            <p className="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{lead ?? 'No per-call fee. You are charged for the records a search returns, nothing else.'}</p>
          </div>
          <p className="flex flex-col items-start [grid-area:rate]">
            <span className="ds-pp-value whitespace-nowrap tabular-nums">{value}</span>
            <span className="mt-1 whitespace-nowrap type-body-lg md:type-body-xl">{unit}</span>
            {example && <span className="mt-4 whitespace-nowrap type-body text-fg-soft tabular-nums md:type-body-lg">{example}</span>}
          </p>
          <dl className="border-b border-edge [grid-area:free]">
            {freeRows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-4 border-t border-edge py-4">
                <dt className="min-w-0 truncate type-body md:type-body-lg">{r.label}</dt>
                <dd className="flex-none type-body text-fg-soft md:type-body-lg">{r.value}</dd>
              </div>
            ))}
          </dl>
          <Actions primary={primary} secondary={secondary} className="self-start [grid-area:actions]" />
        </div>
      </section>
    )
  }

  if (variant === 'plans') {
    const lines = (headline ?? 'Start free. Pay for what you use').split(/(?<=\.)\s+/)
    return (
      <section data-ds="product-pricing" aria-labelledby={headingId} className={cn('border-t border-edge py-(--ds-layout-section) text-fg', className)}>
        <style href="ds-product-pricing" precedence="ds">{css}</style>
        <div className={cn(WRAP, 'ds-pp-plans grid grid-cols-[minmax(0,1fr)] gap-y-8 lg:items-end lg:gap-x-16 lg:gap-y-16 xl:gap-x-24')}>
          <h2 id={headingId} className="type-section [grid-area:headline]">{lines.map((l) => <span key={l} className="block">{l}</span>)}</h2>
          <div className="[grid-area:rate]">
            <p className="whitespace-nowrap type-body-lg tabular-nums md:type-body-xl">{value} {unit}</p>
            <p className="mt-1 max-w-(--ds-layout-measure) type-body text-fg-soft md:type-body-lg">{lead ?? 'Here is what each plan buys. The API and the MCP server share one pool of credits.'}</p>
          </div>
          <ul role="list" className="grid grid-cols-[minmax(0,1fr)] border-b border-edge [grid-area:plans] lg:grid-cols-4 lg:border-t lg:border-b-0">
            {plans.map((p) => {
              const at = p.price.search(/[$\d]/)
              const prefix = at > 0 ? p.price.slice(0, at).trim() : ''
              const amount = at > 0 ? p.price.slice(at) : p.price
              const n = leading(p.credits)
              return (
                <li key={p.name} className="ds-pp-plan grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-t border-edge py-4 lg:grid-cols-[minmax(0,1fr)] lg:gap-y-2 lg:border-t-0 lg:border-l lg:px-6 lg:pt-6 lg:pb-0 lg:first:border-l-0 lg:first:pl-0">
                  <h3 className="type-heading-4 [grid-area:name]">{p.name}</h3>
                  <p className="whitespace-nowrap [grid-area:price] lg:mt-4">
                    {prefix && <span className="type-ui text-fg-muted">{prefix} </span>}
                    <span className="ds-pp-amount tabular-nums">{amount}</span>{' '}
                    {p.unit && <span className="type-ui text-fg-muted">{p.unit}</span>}
                  </p>
                  <p className="min-w-0 truncate type-body tabular-nums [grid-area:gets] lg:type-body-lg">{n === null ? p.after : `${fmt(Math.floor(n / per))} ${noun} a month`}</p>
                </li>
              )
            })}
          </ul>
          <Actions primary={primary} secondary={secondary} className="mt-4 [grid-area:actions] lg:mt-0" />
        </div>
      </section>
    )
  }

  if (variant === 'rate') {
    return (
      <section data-ds="product-pricing" aria-labelledby={headingId} className={cn('border-t border-edge py-(--ds-layout-section) text-fg', className)}>
        <style href="ds-product-pricing" precedence="ds">{css}</style>
        <div className={WRAP}>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-y-8 rounded-panel border border-edge bg-surface p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-x-12 md:p-12 lg:p-16">
            <h2 id={headingId} className="flex flex-col gap-2">
              <span className="ds-pp-value tabular-nums">{value}</span>{' '}
              <span className="max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{unit}</span>
            </h2>
            <div className="flex flex-col items-start">
              <p className="max-w-(--ds-layout-measure) type-body-lg">{note}</p>
              {missing && <p className="mt-2 max-w-(--ds-layout-measure) type-body text-pretty text-fg-soft">{missing}</p>}
              <Actions primary={primary} secondary={secondary} className="mt-8" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  const total = per * rows.length
  return (
    <section data-ds="product-pricing" aria-labelledby={headingId} className={cn('py-(--ds-layout-section) text-fg', className)}>
      <div className={cn(WRAP, 'grid grid-cols-[minmax(0,1fr)] items-center gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16 xl:gap-x-24')}>
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h2 id={headingId} className="type-section">{headline ?? 'You pay for what comes back'}</h2>
          <p className="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{lead ?? 'No per-call fee. You pay per record returned, and the API and the MCP server share one pool.'}</p>
          {note && <p className="mt-4 type-ui text-fg-muted">{note}</p>}
          <Actions primary={primary} secondary={secondary} className="mt-8 flex-col justify-center self-stretch md:flex-row md:self-auto" />
        </div>
        <figure className="min-w-0 rounded-panel bg-surface-subtle p-4 md:p-8">
          <figcaption className="flex justify-between gap-4 type-ui text-fg-muted">
            <span className="min-w-0 truncate">{product}<span className="hidden md:inline">, {value} {unit}</span></span>
            <span aria-hidden="true" className="flex-none">Credits</span>
          </figcaption>
          <ul role="list" className="mt-3">
            {[...rows.map((r) => ({ ...r, cost: credits(per), zero: false })), { ...free, cost: 'Free', zero: true }].map((r) => (
              <li key={`${r.name}, ${r.meta}`} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 border-t border-edge py-3 md:grid-cols-[64px_minmax(0,1fr)_auto] md:py-4">
                {r.zero && !r.picture
                  ? <span aria-hidden="true" className="relative grid aspect-4/5 w-12 place-items-center border border-edge-strong text-fg-soft md:w-16"><svg viewBox="0 0 16 16" width="16" height="16" fill="none"><path d="M8 0v16M0 8h16" stroke="currentColor" strokeWidth="2" /></svg></span>
                  : <Picture src={r.picture} />}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate type-body">{r.name}</span>
                  <span className="truncate type-ui text-fg-muted">{r.meta}</span>
                </span>
                <span className={cn('whitespace-nowrap type-ui md:type-body', r.zero ? 'text-fg' : 'text-fg-soft tabular-nums')}>{r.cost}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-baseline justify-between gap-4 border-t border-edge-strong pt-4">
            <span className="min-w-0 truncate type-body md:type-body-lg">{tally}</span>
            <span className="flex-none type-heading-3 tabular-nums md:type-heading-2">{credits(total)}</span>
          </p>
          <p className="mt-2 flex justify-between gap-4 type-ui text-fg-muted">
            <span>Free credits left this month</span>
            <span className="tabular-nums">{fmt(freeMonthly - total)} of {fmt(freeMonthly)}</span>
          </p>
        </figure>
      </div>
    </section>
  )
}

export default ProductPricing

const css = `
.ds-pp-value { font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular); font-size: var(--ds-text-display-phone); line-height: var(--ds-text-display-phone-leading); }
.ds-pp-amount { font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular); font-size: var(--ds-text-heading-4); line-height: var(--ds-text-heading-4-leading); }
.ds-pp-open { grid-template-areas: "head" "rate" "free" "actions"; }
.ds-pp-plans { grid-template-areas: "headline" "rate" "plans" "actions"; }
.ds-pp-plan { grid-template-areas: "name price" "gets gets"; }
@media (min-width: 768px) { .ds-pp-value { font-size: var(--ds-text-display-s); line-height: var(--ds-text-display-s-leading); } }
@media (min-width: 1024px) {
  .ds-pp-value { font-size: var(--ds-text-display); line-height: var(--ds-text-display-leading); }
  .ds-pp-amount { font-size: var(--ds-text-display-phone); line-height: var(--ds-text-display-phone-leading); }
  .ds-pp-open { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); grid-template-rows: auto 1fr; grid-template-areas: "head rate" "actions free"; }
  .ds-pp-plans { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); grid-template-areas: "headline rate" "plans plans" "actions actions"; }
  .ds-pp-plan { grid-template-areas: "name" "price" "gets"; }
}
`
