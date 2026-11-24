import type { CSSProperties } from 'react'
import { cn } from '@/react/lib/cn'

// The site's instrument marks (instrument/marks): four hairline corner brackets in the text colour around a target,
// `offset` outside its edges (4px), each arm `arm` long (8px), like a viewfinder locking on. Put it inside a positioned
// box (the target); it sits above it (z 2) and takes no pointer. Decoration: hidden from assistive tech.
export type Strength = 'subtle' | 'stronger'
export interface BracketsProps {
  /** How far outside the target's edges, in px. */
  offset?: number
  /** Each arm's length, in px. */
  arm?: number
  className?: string
}

const ARM = 'absolute size-[var(--b-arm,var(--ds-space-sm))] border-0 border-solid border-fg'

export function Brackets({ offset, arm, className }: BracketsProps) {
  const style = { ...(offset !== undefined && { '--b-off': `${offset}px` }), ...(arm !== undefined && { '--b-arm': `${arm}px` }) } as CSSProperties
  return (
    <span data-ds="brackets" data-brackets="" aria-hidden="true" style={style} className={cn('pointer-events-none absolute inset-[calc(-1*var(--b-off,var(--ds-space-xs)))] z-2 origin-center', className)}>
      <i className={cn(ARM, 'top-0 left-0 border-t border-l')} />
      <i className={cn(ARM, 'top-0 right-0 border-t border-r')} />
      <i className={cn(ARM, 'bottom-0 left-0 border-b border-l')} />
      <i className={cn(ARM, 'right-0 bottom-0 border-r border-b')} />
    </span>
  )
}

export default Brackets
