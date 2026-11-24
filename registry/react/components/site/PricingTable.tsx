import { Check } from 'lucide-react'
import { Badge } from '@/react/components/ui/Badge'
import { Button } from '@/react/components/ui/Button'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { cn } from '@/react/lib/cn'

// The site's plan grid (pages/Pricing .plans): up to four plans side by side from 1280 (two from 768, one on phones),
// ruled apart by #363636 hairlines. Each plan: a #262626 tier with the 8px corner, 24px in, the name in Funnel Display
// 32/36, an optional badge, who it is for in #D4D4D4 14/20 and the price in Funnel Display 40/44 with its unit in
// #A3A3A3; the plan's button under it (the featured plan's White, the rest quiet); then, under a hairline, a Medium line
// ("Everything in Free, plus:") and what it includes, each after a check in #A3A3A3. The featured plan is lit as the
// site lights it: the ice fill with Black type and the brand light running down its right edge. Nothing moves.
export interface PricingPlan {
  name: string
  /** Who it is for, one short line. */
  description?: string
  /** "$20" or "Custom". */
  price: string
  /** "/mo". */
  unit?: string
  /** A badge beside the name: "Most popular". */
  badge?: string
  /** Lit as the site's Pro plan. One per grid. */
  featured?: boolean
  cta?: string
  href?: string
  /** The line above the list: "Everything in Free, plus:". */
  ladder?: string
  features?: string[]
}

export interface PricingTableProps {
  plans: PricingPlan[]
  /** The light's seed for the featured plan. */
  seed?: number
  className?: string
}

export function PricingTable({ plans, seed = 0, className }: PricingTableProps) {
  return (
    <ul data-ds="pricing-table" role="list" className={cn('m-0 grid list-none grid-cols-1 gap-px border border-edge bg-edge p-0 text-fg md:grid-cols-2 xl:grid-cols-4', className)}>
      {plans.map((p) => (
        <li key={p.name} className="flex flex-col gap-6 bg-surface p-4 xl:p-6">
          <div className={cn('relative isolate flex min-h-52 flex-col gap-2 overflow-hidden rounded-panel p-6', p.featured ? 'bg-plan-ice text-(--ds-color-black)' : 'bg-surface-raised')}>
            {p.featured && <BrandLight variant="strip-right" seed={seed} cover className="absolute inset-y-0 right-0 -z-10 w-2/5 mask-l-from-40%" />}
            <div className="flex items-center justify-between gap-3">
              <h3 className="type-heading-2">{p.name}</h3>
              {p.badge && <Badge>{p.badge}</Badge>}
            </div>
            {p.description && <p className={cn('max-w-[55%] type-ui', p.featured ? 'text-(--ds-color-neutral-4)' : 'text-fg-soft')}>{p.description}</p>}
            <p className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-8">
              <span className="type-figure">{p.price}</span>
              {p.unit && <span className={cn('type-ui', p.featured ? 'text-(--ds-color-neutral-6)' : 'text-fg-muted')}>{p.unit}</span>}
            </p>
          </div>
          {p.cta && <Button href={p.href} variant={p.featured ? 'primary' : 'secondary'} className="w-full">{p.cta}</Button>}
          {(p.ladder || p.features?.length) && (
            <div className="flex flex-col gap-3 border-t border-edge pt-6">
              {p.ladder && <p className="type-ui-strong text-fg">{p.ladder}</p>}
              {p.features?.length ? (
                <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0 type-ui text-fg-soft">
                  {p.features.map((f) => <li key={f} className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-x-2"><Check size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 text-fg-muted" />{f}</li>)}
                </ul>
              ) : null}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default PricingTable
