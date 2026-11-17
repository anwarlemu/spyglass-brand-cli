'use client'
import { useState, type PointerEvent } from 'react'
import { type LineSeries, PLOT, compactNumber, lineLayout } from '@/lib/chart'
import { cn } from '@/react/lib/cn'

// Lines over time: one axis from 0 on #262626 hairlines, 2px lines in the brand's series order (White, #A3A3A3,
// #4D4D4D dashed, then the spectrum: Magenta, Red, Orange, Yellow, Green, Cyan, Blue), the first series shading the
// area under it, a legend when there is more than one, and a crosshair with the values under the pointer on the
// #171717 overlay panel. Ten series at most. On a #171717 card by default; `bare` drops the card, for a chart already
// inside one. `format` writes a value (axis figures use the compact form unless `formatAxis` is given).
export type { LineSeries }

export interface LineChartProps {
  /** The caption: what the lines count. */
  title: string
  /** [{ label, points: [{ t (ms), v }] }], ten at most. */
  series: LineSeries[]
  /** A value as written in the crosshair. */
  format?: (value: number) => string
  /** An axis figure as written. */
  formatAxis?: (value: number) => string
  /** How a time reads under the plot and in the crosshair. */
  formatTime?: (t: number) => string
  /** No card, inside one already. */
  bare?: boolean
}

const day = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export function LineChart({ title, series, format = String, formatAxis = compactNumber, formatTime = day, bare }: LineChartProps) {
  const { lines, paths, span, ticks, max, x, nearest, valuesAt } = lineLayout(series)
  const [hover, setHover] = useState<number | null>(null)
  function move(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    setHover(nearest((event.clientX - box.left) / box.width))
  }
  const hovered = hover === null ? null : { left: `${(x(hover) / PLOT.w) * 100}%`, right: x(hover) > PLOT.w * 0.6, time: formatTime(hover), values: valuesAt(hover) }

  return (
    <figure data-ds="line-chart" className={cn('flex min-w-0 flex-col gap-4', !bare && 'rounded-container bg-surface-raised p-6 max-sm:p-4')}>
      <figcaption className="flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="type-label text-fg-muted">{title}</span>
        {lines.length > 1 && (
          <span className="flex flex-wrap gap-x-4 gap-y-1 type-caption text-fg-muted">
            {paths.map(p => (
              <span key={p.label} className="inline-flex items-center gap-1.5">
                <svg width="16" height="4" aria-hidden="true"><line x1="0" y1="2" x2="16" y2="2" stroke={p.color} strokeWidth="2" strokeDasharray={p.dash || undefined} /></svg>
                {p.label}
              </span>
            ))}
          </span>
        )}
      </figcaption>
      {!lines.length
        ? <p className="type-ui text-fg-muted">No data in this range.</p>
        : (
            <div className="flex gap-2">
              <div className="relative h-40 w-10 shrink-0" aria-hidden="true">
                {ticks.map(t => <span key={t} className="absolute right-0 -translate-y-1/2 whitespace-nowrap type-caption text-fg-muted tabular-nums" style={{ top: `${(1 - t / max) * 100}%` }}>{formatAxis(t)}</span>)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative h-40 touch-none" role="img" aria-label={`${title}: ${paths.map(p => `${p.label} last ${format(p.last.v)}`).join(', ')}`} onPointerMove={move} onPointerLeave={() => setHover(null)}>
                  <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} preserveAspectRatio="none" aria-hidden="true">
                    {ticks.map(t => <line key={t} x1="0" y1={PLOT.h - (t / max) * PLOT.h} x2={PLOT.w} y2={PLOT.h - (t / max) * PLOT.h} stroke="var(--ds-color-data-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
                    {paths.filter(q => q.area).map(p => <path key={`${p.label}-area`} d={p.area} fill={p.color} fillOpacity="0.08" />)}
                    {paths.map(p => <path key={p.label} d={p.d} fill="none" stroke={p.color} strokeWidth="2" strokeDasharray={p.dash || undefined} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
                  </svg>
                  {hovered && (
                    <>
                      <div className="pointer-events-none absolute inset-y-0 w-px bg-edge-strong" style={{ left: hovered.left }} />
                      <div className="pointer-events-none absolute top-0 z-10 flex flex-col gap-1 rounded-control border border-edge bg-surface-raised px-3 py-2 type-caption" style={hovered.right ? { right: `calc(100% - ${hovered.left} + 8px)` } : { left: `calc(${hovered.left} + 8px)` }}>
                        <p className="text-fg-muted tabular-nums">{hovered.time}</p>
                        {hovered.values.map(v => (
                          <p key={v.label} className="flex items-center gap-2 whitespace-nowrap tabular-nums">
                            <span className="inline-block h-0.5 w-3" style={{ background: v.color }} />
                            {lines.length > 1 && <span className="text-fg-muted">{v.label}</span>}
                            <span className="ml-auto font-medium text-fg">{v.value === undefined ? 'None' : format(v.value)}</span>
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 flex justify-between type-caption text-fg-muted tabular-nums">
                  <span>{formatTime(span.from)}</span>
                  <span>{formatTime(span.to)}</span>
                </div>
              </div>
            </div>
          )}
    </figure>
  )
}

export default LineChart
