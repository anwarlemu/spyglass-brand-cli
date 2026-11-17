import { html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { type DayPoint, compactNumber, dayMarks, formatDay, formatNumber, niceTicks } from '@/lib/chart'
import styles from 'virtual:tw'

// BarChart.tsx as <spyglass-bar-chart>: a White bar per day on the Black ground. The axis starts at 0 and ends on a
// round number in about four steps; grid lines are #262626 hairlines; axis figures are DM Sans 12px muted in tabular
// figures. Pointing at a bar names its day and value in the caption and quiets the others to #4D4D4D. The bars rise
// from the axis once, then only their color changes. `focus` (React's `focus`; the property is `lit`, as `focus` is
// HTMLElement's own method): bars lit from outside; `note`: what the caption says meanwhile. `points` is a property
// (or a JSON attribute).

/** @summary A White bar per day, with its axis, grid and dates. */
export class BarChart extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { points: { type: Array }, label: {}, height: { type: Number }, lit: { type: Array, attribute: 'focus' }, note: {}, hover: { state: true } }

	/** One value per day: [{ day (ISO), value }]. */
	points: DayPoint[] = []
	/** The caption: what the bars count. */
	label = ''
	/** The bars' height in px. */
	height = 160
	/** Indexes lit from outside, the rest quiet (the focus attribute). */
	lit?: number[]
	/** What the caption says while nothing is pointed at. */
	note?: string
	private hover: number | null = null

	render() {
		const points = this.points ?? []
		const ticks = niceTicks(points.map((p) => p.value))
		const top = ticks[ticks.length - 1]!
		const n = points.length
		const marks = dayMarks(points)
		const shown = this.hover === null ? null : points[this.hover] ?? null
		const peak = formatNumber(Math.max(0, ...points.map((p) => p.value)))
		const h = `height: ${this.height}px`
		const body = !n
			? html`<p class="flex items-center justify-center type-ui text-fg-muted" style=${h}>No activity yet.</p>`
			: html`<div class="grid grid-cols-[40px_minmax(0,1fr)] gap-x-2">
				<div class="relative" style=${h} aria-hidden="true">${ticks.map((t) => html`<span class="absolute right-0 -translate-y-1/2 type-caption text-fg-muted tabular-nums" style=${`top: ${(1 - t / top) * 100}%`}>${compactNumber(t)}</span>`)}</div>
				<div class="relative" style=${h} role="img" aria-label=${`${this.label}: ${n} days, peak ${peak}`} @pointerleave=${() => { this.hover = null }}>
					${ticks.map((t) => html`<div class="pointer-events-none absolute inset-x-0 border-t border-data-grid" style=${`top: ${(1 - t / top) * 100}%`}></div>`)}
					<div class="absolute inset-0 flex items-end">${repeat(points, (p) => p.day, (p, i) => html`<div class="flex h-full flex-1 items-end" @pointerenter=${() => { this.hover = i }}><div class="ds-bar mx-auto w-[70%] rounded-t-ds-sm bg-data-3 data-lit:bg-data-1" data-lit=${ifDefined(this.hover === i || (this.hover === null && (!this.lit || this.lit.includes(i))) ? 'true' : undefined)} style=${`height: ${p.value > 0 ? `max(2px, ${(p.value / top) * 100}%)` : '0'}; --i: ${(i * 120) / n}`}></div></div>`)}</div>
				</div>
				<div></div>
				<div class="relative mt-2 h-4" aria-hidden="true">${marks.map((m, i) => html`<span class=${['absolute whitespace-nowrap type-caption text-fg-muted tabular-nums', i === 0 ? 'left-0' : i === marks.length - 1 ? 'right-0' : '-translate-x-1/2'].join(' ')} style=${ifDefined(i === 0 || i === marks.length - 1 ? undefined : `left: ${m.left}`)}>${m.text}</span>`)}</div>
			</div>`
		return html`<figure data-ds="bar-chart" class="flex min-w-0 flex-col gap-3">
			<figcaption class="flex h-5 items-baseline justify-between gap-4">
				<span class="type-label text-fg-muted">${this.label}</span>
				${shown ? html`<span class="type-caption text-fg-muted tabular-nums">${`${formatDay(shown.day, true)} `}<span class="font-medium text-fg">${formatNumber(shown.value)}</span></span>` : this.note ? html`<span class="type-caption text-fg-muted">${this.note}</span>` : nothing}
			</figcaption>
			${body}
		</figure>`
	}
}

define('bar-chart', BarChart)
