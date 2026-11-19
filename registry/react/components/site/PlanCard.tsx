import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The Creator plan card from the ad (Card, Creator plan, 600x452 on the canvas): the #171717 fill on Black with the
// brand corner, no border and no shadow; the plan's name in Funnel Display (40px at 1.0 on the canvas, 28px here), the
// price line in DM Sans, what the plan includes as plain lines, and one full-width White button. The canvas's spacing,
// times 2/3: 32px in, the price 16px under the name, the lines 24px under it and 8px apart, the button 24px below
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
    <div data-ds="plan-card" className={cn('flex flex-col rounded-container bg-surface-raised p-8 text-fg max-sm:p-6', className)}>
      <h3 className="type-heading-2">{title}</h3>
      {price && <p className="mt-4 type-body text-fg">{price}</p>}
      {features.length > 0 && (
        <ul className="mt-6 flex grow flex-col gap-2 type-ui text-fg">
          {features.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      {cta && <Button href={href} onClick={onSelect} className="mt-6 w-full">{cta}</Button>}
    </div>
  )
}

export default PlanCard
