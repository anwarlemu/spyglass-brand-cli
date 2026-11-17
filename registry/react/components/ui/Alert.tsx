import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's alert in the brand: a #171717 box on Black with the brand corner and no border or shadow, a 16px Lucide
// icon, the subject in DM Sans Medium and a line of muted DM Sans under it, and a button at the end if one helps.
// `destructive` turns the icon and the subject red for what broke. role="alert" so it is read out; for a note that
// was there from the start, pass role="status".
export type AlertVariant = 'default' | 'destructive'

const VARIANTS: Record<AlertVariant, string> = {
  default: 'text-fg',
  destructive: 'text-fg-danger',
}

export interface AlertProps {
  /** The subject, in DM Sans Medium. */
  title: ReactNode
  /** default, or destructive (red) for what broke. */
  variant?: AlertVariant
  /** A 16px Lucide icon before it. */
  icon?: ReactNode
  /** A button at the end. */
  action?: ReactNode
  /** alert (read out at once) or status (polite). */
  role?: 'alert' | 'status'
  className?: string
  /** The line under the subject. */
  children?: ReactNode
}

export function Alert({ title, variant = 'default', icon, action, role = 'alert', className, children }: AlertProps) {
  return (
    <div data-ds="alert" role={role} className={cn('flex w-full items-start gap-3 rounded-container bg-surface-raised p-4 max-sm:flex-wrap', className)}>
      {icon && <span className={cn('mt-0.5 flex shrink-0', VARIANTS[variant] ?? VARIANTS.default)} aria-hidden="true">{icon}</span>}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn('type-ui-strong', VARIANTS[variant] ?? VARIANTS.default)}>{title}</p>
        {children && <div className="type-ui text-fg-muted">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center max-sm:basis-full max-sm:pl-7">{action}</div>}
    </div>
  )
}

export default Alert
