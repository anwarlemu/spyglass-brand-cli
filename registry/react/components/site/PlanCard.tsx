import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The site's plan tier (pages/Pricing .tier): a #262626 fill on Black with the 8px corner, 24px in; the plan's name in
// Funnel Display 32/36 at 400, the price line in DM Sans, what the plan includes as #D4D4D4 14/20 lines under a
// #4D4D4D hairline, and one full-width White button. The price 16px under the name, the lines 24px under it and 8px
// apart, the button 24px below
// (cards stretched side by side keep their buttons on one line: the lines take the extra height).
export interface PlanCardProps {
  /** The plan's name. */
  title: ReactNode
  /** The price, as a sentence with concrete numbers. */
  price?: ReactNode
  /** What the plan includes, one line each. */
  features?: string[]
  /** The button's label. */
  cta?: string
  /** Makes the button a link. */
  href?: string
  /** Called when the button is pressed. */
  onSelect?: () => void
  className?: string
}

export function PlanCard({ title, price, features = [], cta, href, onSelect, className }: PlanCardProps) {
  return (
    <div data-ds="plan-card" className={cn('flex flex-col rounded-panel bg-surface-raised p-6 text-fg', className)}>
      <h3 className="type-heading-2">{title}</h3>
      {price && <p className="mt-4 type-body text-fg">{price}</p>}
      {features.length > 0 && (
        <ul className="mt-6 flex grow flex-col gap-2 border-t border-edge-surface pt-6 type-ui text-fg-soft">
          {features.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      {cta && <Button href={href} onClick={onSelect} className="mt-6 w-full">{cta}</Button>}
    </div>
  )
}

export default PlanCard
