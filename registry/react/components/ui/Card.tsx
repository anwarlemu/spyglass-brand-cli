import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The brand's card: a #171717 fill on Black with the brand corner, no border and no shadow (the plan card in the
// ads: 48px in on the canvas, 32px here). `title` is a Funnel Display card title (40px at 1.0 on the canvas, 28px
// here), `description` a line of DM Sans under it, the children the body, and `actions` a row at the foot (a full
// width button in the plan card).
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Buttons or links at the foot. */
  actions?: ReactNode
}

export function Card({ title, description, actions, className, children, ...rest }: CardProps) {
  return (
    <div data-ds="card" {...rest} className={cn('flex flex-col gap-6 rounded-container bg-surface-raised p-8 text-fg max-sm:p-6', className)}>
      {(title || description) && (
        <div className="flex flex-col gap-4">
          {title && <h3 className="type-heading-2">{title}</h3>}
          {description && <p className="type-body text-fg">{description}</p>}
        </div>
      )}
      {children}
      {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export default Card
