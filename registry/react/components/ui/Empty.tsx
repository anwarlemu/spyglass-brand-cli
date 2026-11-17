import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's empty in the brand: what shows where a list has nothing in it yet. A dashed #363636 hairline with the brand
// corner on Black, a 20px Lucide icon in a #171717 tile, a Funnel Display title, one muted line on what is missing and
// the actions that fill it. No illustrations, and never without a way forward.
export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** What is missing, in Funnel Display. */
  title: string
  /** One muted line on how to fill it. */
  description?: string
  /** A 20px Lucide icon. */
  icon?: ReactNode
}

export function Empty({ title, description, icon, className, children, ...rest }: EmptyProps) {
  return (
    <div data-ds="empty" className={cn('flex w-full flex-col items-center gap-2 rounded-container border border-dashed border-edge-strong px-6 py-12 text-center', className)} {...rest}>
      {icon && <span className="mb-2 flex size-10 items-center justify-center rounded-control bg-surface-raised text-fg" aria-hidden="true">{icon}</span>}
      <p className="type-heading-4 text-fg">{title}</p>
      {description && <p className="max-w-sm type-ui text-fg-muted">{description}</p>}
      {children && <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}

export default Empty
