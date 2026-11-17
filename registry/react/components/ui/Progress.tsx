import { cn } from '@/react/lib/cn'

// How far a task has got: a White bar on a 6px #262626 track with round ends. The fill slides to a new value over
// 250ms on the strong ease-out, on transform only. Leave out `value` when the end is not known: a short White bar
// sweeps across the track at a steady pace, and with reduced motion it rests and breathes instead. `label` names it
// for assistive tech (a progressbar); say the number in text beside it too.
export interface ProgressProps {
  /** How far, from 0 to max; leave it out for work with no known end. */
  value?: number | null
  /** The value that means done. */
  max?: number
  /** What is in progress, for assistive tech. */
  label?: string
  className?: string
}

export function Progress({ value, max = 100, label, className }: ProgressProps) {
  const known = typeof value === 'number'
  const share = known ? Math.max(0, Math.min(1, value / (max || 1))) : 0
  return (
    <>
      <style href="ds-progress" precedence="ds">{css}</style>
      <div
        data-ds="progress"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={known ? value : undefined}
        className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-action-secondary', className)}
      >
        {known
          ? <div className="h-full w-full rounded-full bg-action-primary transition-transform duration-250 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${(1 - share) * 100}%)` }} />
          : <div className="ds-progress-sweep h-full w-2/5 rounded-full bg-action-primary" />}
      </div>
    </>
  )
}

export default Progress

const css = `
.ds-progress-sweep { animation: ds-progress-sweep 1.5s var(--ds-easing-in-out) infinite; }
@keyframes ds-progress-sweep { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
@keyframes ds-progress-breathe { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .ds-progress-sweep { width: 100%; animation: ds-progress-breathe 2s var(--ds-easing-in-out) infinite; } }
`
