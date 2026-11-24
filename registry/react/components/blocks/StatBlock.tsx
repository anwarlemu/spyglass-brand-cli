import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Numbers that say what the product does, each a Funnel Display figure over a DM Sans line, the way the brand's copy
// leans on concrete numbers. `rule` sets each under a hairline on Black; `card` sets each on the #262626 fill. Four
// across on wide screens, two on phones. The numbers are facts: never round them up or invent them.
export interface Stat {
  /** The figure: "4", "$10", "1 minute". */
  value: string
  /** What it counts, as a short line. */
  label: string
}

export interface StatBlockProps {
  stats: Stat[]
  /** A heading above the numbers. */
  title?: ReactNode
  /** rule (a hairline above each) or card (the #262626 fill). */
  variant?: 'rule' | 'card'
  className?: string
}

export function StatBlock({ stats, title, variant = 'rule', className }: StatBlockProps) {
  const card = variant === 'card'
  return (
    <section data-ds="stat-block" className={cn('grid gap-10 text-fg max-sm:gap-8', className)}>
      {title && <h2 className="max-w-3xl type-section">{title}</h2>}
      <dl className={cn('m-0 grid grid-cols-4 max-md:grid-cols-2', card ? 'gap-4' : 'gap-x-6 gap-y-10')}>
        {stats.map((s) => (
          <div key={s.label} className={cn('flex flex-col-reverse justify-end gap-3', card ? 'rounded-container bg-surface-raised p-6' : 'border-t border-edge-strong pt-6')}>
            <dt className="type-ui text-fg-soft">{s.label}</dt>
            <dd className="m-0 type-hero max-sm:type-heading-1">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default StatBlock
