import { BarChart } from '@/react/components/ui/BarChart'
import { formatNumber, type DayPoint } from '@/lib/chart'
// A month of searches on a #262626 card: the total in Funnel Display, the bars per day under it. Point at a bar to
// read it. Sample data.
const days = Array.from({ length: 30 }, (_, i) => `2026-10-${String(i + 2).padStart(2, '0')}`)
const points: DayPoint[] = days.map((day, i) => ({ day, value: Math.round(1800 * (0.2 + (((i * 7) % 23) / 23) ** 2 * 0.8)) }))
const total = points.reduce((a, p) => a + p.value, 0)

export default function Searches() {
  return (
    <div className="flex w-full max-w-150 flex-col gap-6 rounded-container bg-surface-raised p-6 max-sm:p-4">
      <div className="flex flex-col gap-2">
        <p className="type-label text-fg-muted">Searches, October</p>
        <p className="type-heading-1 tabular-nums">{formatNumber(total)}</p>
      </div>
      <BarChart points={points} label="Searches per day" height={140} />
    </div>
  )
}
