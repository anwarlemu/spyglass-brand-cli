import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The site's card: a #262626 fill on Black with the 4px corner, no border and no shadow, 24px in. `title` is a Funnel
// Display card title (24/28 at 400, as the site's resource cards), `description` a #D4D4D4 line of DM Sans under it, the children the body, and `actions` a row at the foot (a full
// width button in the plan card).
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  /** Buttons or links at the foot. */
  actions?: ReactNode
}

export function Card({ title, description, actions, className, children, ...rest }: CardProps) {
  return (
    <div data-ds="card" {...rest} className={cn('flex flex-col gap-6 rounded-container bg-surface-raised p-6 text-fg', className)}>
      {(title || description) && (
        <div className="flex flex-col gap-2">
          {title && <h3 className="type-heading-3">{title}</h3>}
          {description && <p className="type-body text-fg-soft">{description}</p>}
        </div>
      )}
      {children}
      {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}

export default Card
