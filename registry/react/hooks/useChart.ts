// What the charts share (usageMetrics.ts, BarChart.vue): numbers in en-US, an axis that ends on a round number in four
// steps, and the week's change.

export type DayPoint = { day: string, value: number }
export type ChartMetric = { key: string, label: string, points: DayPoint[] }

const whole = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 186402 -> "186,402". */
export const formatNumber = (n: number) => whole.format(n)
/** 186402 -> "186.4K", for axis labels. */
export const compactNumber = (n: number) => compact.format(n)

/** The axis: a step of 1, 2, 2.5 or 5 times a power of ten that covers the largest value in four. Starts at 0. */
export function niceTicks(values: number[]) {
  const max = Math.max(0, ...values)
  if (max === 0) return [0, 1]
  const raw = max / 4
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].find(m => m * power >= raw) ?? 10) * power
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step)
}

/** "Oct 2", or "Oct 2, 2026" with the year, from an ISO day. */
export const formatDay = (value: string, year = false) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' })

/** The sum of a metric's points over its range. */
export const totalOf = (points: DayPoint[]) => points.reduce((a, p) => a + p.value, 0)

/** The last seven days against the seven before, as a share; null without both. */
export function weekChange(points: DayPoint[]): number | null {
  if (points.length < 14) return null
  const before = totalOf(points.slice(-14, -7))
  return before ? (totalOf(points.slice(-7)) - before) / before : null
}
