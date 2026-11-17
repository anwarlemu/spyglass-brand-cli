// What the charts share, in both flavors: the series colors, numbers in en-US, an axis that ends on a round number in
// about four steps, and the days under the bars. Framework-free.

/**
 * The series colors in order: the neutrals first (White, #A3A3A3, #4D4D4D), then the spectrum in the order the brand
 * always shows it (Magenta, Red, Orange, Yellow, Green, Cyan, Blue). Ten series at most; the third is dashed, so a
 * dim gray line still reads, and every series is named in the legend.
 */
export const CHART_COLORS = [
	'var(--ds-color-data-1)',
	'var(--ds-color-data-2)',
	'var(--ds-color-data-3)',
	'var(--ds-color-magenta)',
	'var(--ds-color-red)',
	'var(--ds-color-orange)',
	'var(--ds-color-yellow)',
	'var(--ds-color-green)',
	'var(--ds-color-cyan)',
	'var(--ds-color-blue)',
] as const
/** Each series' dash pattern (SVG stroke-dasharray), by the same index. */
export const CHART_DASH = ['', '', '5 4', '', '', '', '', '', '', '']

export type DayPoint = { day: string, value: number }
export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }

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
	const step = ([1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10) * power
	return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step)
}

/** "Oct 2", or "Oct 2, 2026" with the year, from an ISO day. */
export const formatDay = (value: string, year = false) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' })

/** Four dates under n bars: the first, the last and two between, each with its center as a share of the width. */
export function dayMarks(points: DayPoint[]) {
	const n = points.length
	if (!n) return []
	return [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])].map((i) => ({ left: `${((i + 0.5) / n) * 100}%`, text: formatDay(points[i]!.day) }))
}

/** The plot's drawing box for lines (an SVG viewBox, stretched to the plot). */
export const PLOT = { w: 600, h: 160 }

/** Lines over time laid out in PLOT: paths, the shaded area under the first, the axis top and the hovered values. */
export function lineLayout(series: LineSeries[]) {
	const lines = series.slice(0, CHART_COLORS.length).filter((s) => s.points.length)
	const times = [...new Set(lines.flatMap((s) => s.points.map((p) => p.t)))].sort((a, b) => a - b)
	const span = { from: times[0] ?? 0, to: times[times.length - 1] ?? 1 }
	const ticks = niceTicks(lines.flatMap((s) => s.points.map((p) => p.v)))
	const max = ticks[ticks.length - 1]!
	const x = (t: number) => (span.to === span.from ? PLOT.w / 2 : ((t - span.from) / (span.to - span.from)) * PLOT.w)
	const y = (v: number) => PLOT.h - (v / max) * PLOT.h
	const paths = lines.map((s, i) => ({
		label: s.label,
		color: CHART_COLORS[i]!,
		dash: CHART_DASH[i]!,
		d: s.points.map((p, j) => `${j ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(''),
		area: i ? '' : `M${x(s.points[0]!.t).toFixed(1)},${PLOT.h}${s.points.map((p) => `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('')}L${x(s.points[s.points.length - 1]!.t).toFixed(1)},${PLOT.h}Z`,
		last: s.points[s.points.length - 1]!,
	}))
	/** The time nearest a share (0 to 1) of the width. */
	const nearest = (share: number) => {
		const t = span.from + share * (span.to - span.from)
		let best: number | null = null
		for (const c of times) if (best === null || Math.abs(c - t) < Math.abs(best - t)) best = c
		return best
	}
	const valuesAt = (t: number) => lines.map((s, i) => ({ label: s.label, color: CHART_COLORS[i]!, value: s.points.find((p) => p.t === t)?.v }))
	return { lines, paths, span, ticks, max, x, nearest, valuesAt }
}
