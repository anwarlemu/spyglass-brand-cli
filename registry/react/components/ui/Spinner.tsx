import type { SVGAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// Work in progress with no known end: a quarter arc in the color around it (White on Black) turning on a #363636
// ring, one turn every 750ms at a constant speed (linear, as constant motion is). With reduced motion it stops turning
// and breathes instead. sm is 16px (beside UI text, in a button), md 20px. It announces itself as a status with
// `label`.
export type SpinnerSize = 'sm' | 'md'

const SIZES: Record<SpinnerSize, string> = { sm: 'size-icon-sm', md: 'size-icon-md' }

export interface SpinnerProps extends Omit<SVGAttributes<SVGSVGElement>, 'role'> {
  /** sm (16px) or md (20px). */
  size?: SpinnerSize
  /** What is loading, for assistive tech. */
  label?: string
}

export function Spinner({ size = 'sm', label = 'Loading', className, ...rest }: SpinnerProps) {
  return (
    <>
      <style href="ds-spinner" precedence="ds">{css}</style>
      <svg data-ds="spinner" role="status" aria-label={label} viewBox="0 0 24 24" fill="none" className={cn('ds-spinner shrink-0', SIZES[size] ?? SIZES.sm, className)} {...rest}>
        <circle cx="12" cy="12" r="9" strokeWidth="2.5" className="stroke-edge-strong" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </>
  )
}

export default Spinner

const css = `
.ds-spinner { animation: ds-spinner-turn 750ms linear infinite; }
@keyframes ds-spinner-turn { to { transform: rotate(360deg); } }
@keyframes ds-spinner-breathe { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .ds-spinner { animation: ds-spinner-breathe 2s var(--ds-easing-in-out) infinite; } }
`
