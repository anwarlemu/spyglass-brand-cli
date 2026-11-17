import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// A placeholder in the shape of what is loading: a #1A1A1A block with the brand corner (or a circle) that breathes
// between full and half opacity every 2 seconds, never a shimmer. Size it with classes (h-4 w-48) to the part it holds
// the place of, so nothing moves when the content lands. Still with reduced motion. Hidden from assistive tech: say
// "Loading" once on the region (aria-busy) instead.
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** A circle (an avatar or a logo) in place of the brand corner. */
  circle?: boolean
}

export function Skeleton({ circle, className, ...rest }: SkeletonProps) {
  return (
    <>
      <style href="ds-skeleton" precedence="ds">{css}</style>
      <div data-ds="skeleton" aria-hidden="true" className={cn('ds-skeleton bg-surface-subtle', circle ? 'rounded-full' : 'rounded-control', className)} {...rest} />
    </>
  )
}

export default Skeleton

const css = `
.ds-skeleton { animation: ds-skeleton-breathe 2s var(--ds-easing-in-out) infinite; }
@keyframes ds-skeleton-breathe { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .ds-skeleton { animation: none; } }
`
