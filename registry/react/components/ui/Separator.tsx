import { cn } from '@/react/lib/cn'

// The hairline as its own part: 1px in the #262626 edge step, across or down. Spyglass separates with a fill or a
// hairline, never a shadow. Decorative by default (role none); pass `semantic` when it splits content a screen reader
// should hear as split.
export interface SeparatorProps {
  /** Across (horizontal) or down (vertical, it stretches to its row's height). */
  orientation?: 'horizontal' | 'vertical'
  /** A real separator for assistive tech, not only a line. */
  semantic?: boolean
  className?: string
}

export function Separator({ orientation = 'horizontal', semantic, className }: SeparatorProps) {
  return (
    <div
      data-ds="separator"
      role={semantic ? 'separator' : 'none'}
      aria-orientation={semantic ? orientation : undefined}
      className={cn('shrink-0 bg-edge', orientation === 'vertical' ? 'w-px self-stretch' : 'h-px w-full', className)}
    />
  )
}

export default Separator
