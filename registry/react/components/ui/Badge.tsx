import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's badge in the site's look (globals.css .t-badge, the plan badge): a short label for a state or a kind, DM
// Sans Medium 12/16 in sentence case, 24px tall with a 4px corner. default is White with a Black label (one per group,
// for what matters most: the plan badge); secondary the site's #363636 inset fill with a #D4D4D4 label ("Coming soon");
// outline a #666666 hairline on Black; destructive a red wash with a red label. `dot` leads it with a
// small spectrum color, the only place a badge takes one; the word still carries the meaning, never the color alone.
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'
export type BadgeDot = 'magenta' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'border-transparent bg-action-primary text-action-primary-fg',
  secondary: 'border-transparent bg-surface-inset text-fg-soft',
  outline: 'border-edge-strong bg-transparent text-fg',
  destructive: 'border-transparent bg-surface-danger text-fg-danger',
}
const DOTS: Record<BadgeDot, string> = {
  magenta: 'bg-magenta',
  red: 'bg-red',
  orange: 'bg-orange',
  yellow: 'bg-yellow',
  green: 'bg-green',
  cyan: 'bg-cyan',
  blue: 'bg-blue',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** default (White), secondary, outline or destructive. */
  variant?: BadgeVariant
  /** A small spectrum color before the word. */
  dot?: BadgeDot
}

export function Badge({ variant = 'default', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span data-ds="badge" className={cn('inline-flex h-6 shrink-0 items-center gap-1.5 rounded-ds-sm border px-2 type-caption font-medium whitespace-nowrap', VARIANTS[variant] ?? VARIANTS.default, className)} {...rest}>
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', DOTS[dot])} aria-hidden="true" />}
      {children}
    </span>
  )
}

export default Badge
