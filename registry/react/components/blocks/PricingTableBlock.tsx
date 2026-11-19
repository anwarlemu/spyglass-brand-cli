import type { ReactNode } from 'react'
import { PlanCard } from '@/react/components/site/PlanCard'
import { cn } from '@/react/lib/cn'

// Plans side by side: an optional centered Funnel Display heading and line over plan cards (the Creator plan card from
// the ad), each the same width and height, centered as a row; one plan sits alone in the middle. Up to three across,
// one on phones. Every price and feature is what the plan states.
export interface Plan {
  title: string
  price?: string
  features?: string[]
  cta?: string
  href?: string
}

export interface PricingTableBlockProps {
  plans: Plan[]
  /** A heading above the plans. */
  title?: ReactNode
  /** A line under the heading. */
  body?: ReactNode
  className?: string
}

export function PricingTableBlock({ plans, title, body, className }: PricingTableBlockProps) {
  return (
    <section data-ds="pricing-table-block" className={cn('flex flex-col gap-12 text-fg max-sm:gap-8', className)}>
      {(title || body) && (
        <div className="mx-auto grid max-w-3xl gap-4 text-center">
          {title && <h2 className="type-heading-1 text-balance max-sm:type-heading-2">{title}</h2>}
          {body && <p className="type-body-lg text-fg-soft">{body}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-stretch justify-center gap-4">
        {plans.map((p) => <PlanCard key={p.title} title={p.title} price={p.price} features={p.features} cta={p.cta} href={p.href} className="w-100 max-w-full" />)}
      </div>
    </section>
  )
}

export default PricingTableBlock
