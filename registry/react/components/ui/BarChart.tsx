'use client'
import { useState, type CSSProperties } from 'react'
import { type DayPoint, compactNumber, dayMarks, formatDay, formatNumber, niceTicks } from '@/lib/chart'
import { cn } from '@/react/lib/cn'

// A White bar per day on the Black ground. The axis starts at 0 and ends on a round number in about four steps; grid
// lines are #363636 hairlines; axis figures are DM Sans 12px muted in tabular figures. A day with any activity keeps a
// visible bar. Pointing at a bar names its day and value in the caption and quiets the others to #4D4D4D. The bars
// rise from the axis once (360ms, ease-out, staggered over 120ms), then only their color changes; with reduced motion
// they are simply there. `focus`: bars lit from outside, the rest quiet; `note`: what the caption says meanwhile.
export interface BarChartProps {
  /** One value per day: [{ day (ISO), value }]. */
  points: DayPoint[]
  /** The caption: what the bars count. */
  label: string
  /** The bars' height in px. */
  height?: number
  /** Indexes lit from outside, the rest quiet. */
  focus?: number[]
  /** What the caption says while nothing is pointed at. */
  note?: string
}

export function BarChart({ points, label, height = 160, focus, note }: BarChartProps) {
  const ticks = niceTicks(points.map(p => p.value))
  const top = ticks[ticks.length - 1]!
  const marks = dayMarks(points)
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover === null ? null : points[hover] ?? null
  const peak = formatNumber(Math.max(0, ...points.map(p => p.value)))
  return (
    <figure data-ds="bar-chart" className="flex min-w-0 flex-col gap-3">
      <style href="ds-bar-chart" precedence="ds">{css}</style>
      <figcaption className="flex h-5 items-baseline justify-between gap-4">
        <span className="type-label text-fg-muted">{label}</span>
        {shown
          ? <span className="type-caption text-fg-muted tabular-nums">{`${formatDay(shown.day, true)} `}<span className="font-medium text-fg">{formatNumber(shown.value)}</span></span>
          : note ? <span className="type-caption text-fg-muted">{note}</span> : null}
      </figcaption>
      {!points.length
        ? <p className="flex items-center justify-center type-ui text-fg-muted" style={{ height: `${height}px` }}>No activity yet.</p>
        : (
            <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2">
              <div className="relative" style={{ height: `${height}px` }} aria-hidden="true">
                {ticks.map(t => <span key={t} className="absolute right-0 -translate-y-1/2 type-caption text-fg-muted tabular-nums" style={{ top: `${(1 - t / top) * 100}%` }}>{compactNumber(t)}</span>)}
              </div>
              <div className="relative" style={{ height: `${height}px` }} role="img" aria-label={`${label}: ${points.length} days, peak ${peak}`} onPointerLeave={() => setHover(null)}>
                {ticks.map(t => <div key={t} className="pointer-events-none absolute inset-x-0 border-t border-data-grid" style={{ top: `${(1 - t / top) * 100}%` }} />)}
                <div className="absolute inset-0 flex items-end">
                  {points.map((p, i) => (
                    <div key={p.day} className="flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
                      <div
                        className="ds-bar mx-auto w-[70%] rounded-t-ds-sm bg-data-3 data-lit:bg-data-1"
                        data-lit={hover === i || (hover === null && (!focus || focus.includes(i))) || undefined}
                        style={{ height: p.value > 0 ? `max(2px, ${(p.value / top) * 100}%)` : '0', '--i': (i * 120) / points.length } as CSSProperties}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div />
              <div className="relative mt-2 h-4" aria-hidden="true">
                {marks.map((m, i) => (
                  <span
                    key={m.text}
                    className={cn('absolute whitespace-nowrap type-caption text-fg-muted tabular-nums', i === 0 ? 'left-0' : i === marks.length - 1 ? 'right-0' : '-translate-x-1/2')}
                    style={i === 0 || i === marks.length - 1 ? {} : { left: m.left }}
                  >{m.text}</span>
                ))}
              </div>
            </div>
          )}
    </figure>
  )
}

export default BarChart

const css = `
.ds-bar { transform-origin: bottom; animation: ds-bar-in var(--ds-duration-entrance) var(--ds-easing-out) both; animation-delay: calc(var(--i, 0) * 1ms); transition: background-color var(--ds-duration-glide) var(--ds-easing-standard); }
@keyframes ds-bar-in { from { transform: scaleY(0.02); } }
@media (prefers-reduced-motion: reduce) { .ds-bar { animation: none; } }
`
