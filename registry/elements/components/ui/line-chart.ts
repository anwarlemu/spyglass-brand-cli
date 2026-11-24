import { html, nothing, svg } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { type LineSeries, PLOT, compactNumber, lineLayout } from '@/lib/chart'
import styles from 'virtual:tw'

// LineChart.tsx as <spyglass-line-chart>: lines over time: one axis from 0 on #363636 hairlines, 2px lines in the
// brand's series order (White, #A3A3A3, #4D4D4D dashed, then the spectrum: Magenta, Red, Orange, Yellow, Green, Cyan,
// Blue), the first series shading the area under it, a legend when there is more than one, and a crosshair with the
// values under the pointer on the #262626 overlay panel. Ten series at most. On a #262626 card by default; `bare`
// drops the card. React's `title` is `heading`; `series`, `format`, `formatAxis` and `formatTime` are properties.
export type { LineSeries }

const day = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

/** @summary Lines over time, with a legend and a crosshair. */
export class LineChart extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, series: { type: Array }, format: { attribute: false }, formatAxis: { attribute: false }, formatTime: { attribute: false }, bare: { type: Boolean }, hover: { state: true } }

	/** The caption (React's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** [{ label, points: [{ t (ms), v }] }], ten at most. */
	series: LineSeries[] = []
	/** A value as written in the crosshair (a property: a function). */
	format: (value: number) => string = String
	/** An axis figure as written (a property: a function). */
	formatAxis: (value: number) => string = compactNumber
	/** How a time reads (a property: a function). */
	formatTime: (t: number) => string = day
	/** No card, inside one already. */
	bare = false
	private hover: number | null = null

	private move(event: PointerEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
		this.hover = lineLayout(this.series ?? []).nearest((event.clientX - box.left) / box.width)
	}

	render() {
		const { lines, paths, span, ticks, max, x, valuesAt } = lineLayout(this.series ?? [])
		const format = this.format
		const hover = this.hover
		const hovered = hover === null ? null : { left: `${(x(hover) / PLOT.w) * 100}%`, right: x(hover) > PLOT.w * 0.6, time: this.formatTime(hover), values: valuesAt(hover) }
		const legend = lines.length > 1
			? html`<span class="flex flex-wrap gap-x-4 gap-y-1 type-caption text-fg-muted">${paths.map((p) => html`<span class="inline-flex items-center gap-1.5"><svg width="16" height="4" aria-hidden="true">${svg`<line x1="0" y1="2" x2="16" y2="2" stroke=${p.color} stroke-width="2" stroke-dasharray=${ifDefined(p.dash || undefined)}></line>`}</svg>${p.label}</span>`)}</span>`
			: nothing
		const body = !lines.length
			? html`<p class="type-ui text-fg-muted">No data in this range.</p>`
			: html`<div class="flex gap-2">
				<div class="relative h-40 w-10 shrink-0" aria-hidden="true">${ticks.map((t) => html`<span class="absolute right-0 -translate-y-1/2 whitespace-nowrap type-caption text-fg-muted tabular-nums" style=${`top: ${(1 - t / max) * 100}%`}>${this.formatAxis(t)}</span>`)}</div>
				<div class="min-w-0 flex-1">
					<div class="relative h-40 touch-none" role="img" aria-label=${`${this.heading}: ${paths.map((p) => `${p.label} last ${format(p.last.v)}`).join(', ')}`} @pointermove=${this.move} @pointerleave=${() => { this.hover = null }}>
						<svg class="absolute inset-0 h-full w-full overflow-visible" viewBox=${`0 0 ${PLOT.w} ${PLOT.h}`} preserveAspectRatio="none" aria-hidden="true">
							${ticks.map((t) => svg`<line x1="0" y1=${PLOT.h - (t / max) * PLOT.h} x2=${PLOT.w} y2=${PLOT.h - (t / max) * PLOT.h} stroke="var(--ds-color-data-grid)" stroke-width="1" vector-effect="non-scaling-stroke"></line>`)}
							${paths.filter((q) => q.area).map((p) => svg`<path d=${p.area} fill=${p.color} fill-opacity="0.08"></path>`)}
							${paths.map((p) => svg`<path d=${p.d} fill="none" stroke=${p.color} stroke-width="2" stroke-dasharray=${ifDefined(p.dash || undefined)} stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>`)}
						</svg>
						${hovered
							? html`<div class="pointer-events-none absolute inset-y-0 w-px bg-edge-strong" style=${`left: ${hovered.left}`}></div><div class="pointer-events-none absolute top-0 z-10 flex flex-col gap-1 rounded-control border border-edge bg-surface-raised px-3 py-2 type-caption" style=${hovered.right ? `right: calc(100% - ${hovered.left} + 8px)` : `left: calc(${hovered.left} + 8px)`}><p class="text-fg-muted tabular-nums">${hovered.time}</p>${hovered.values.map((v) => html`<p class="flex items-center gap-2 whitespace-nowrap tabular-nums"><span class="inline-block h-0.5 w-3" style=${`background: ${v.color}`}></span>${lines.length > 1 ? html`<span class="text-fg-muted">${v.label}</span>` : nothing}<span class="ml-auto font-medium text-fg">${v.value === undefined ? 'None' : format(v.value)}</span></p>`)}</div>`
							: nothing}
					</div>
					<div class="mt-2 flex justify-between type-caption text-fg-muted tabular-nums"><span>${this.formatTime(span.from)}</span><span>${this.formatTime(span.to)}</span></div>
				</div>
			</div>`
		return html`<figure data-ds="line-chart" class=${this.bare ? 'flex min-w-0 flex-col gap-4' : 'flex min-w-0 flex-col gap-4 rounded-container bg-surface-raised p-6 max-sm:p-4'}>
			<figcaption class="flex min-h-5 flex-wrap items-baseline justify-between gap-x-4 gap-y-2"><span class="type-label text-fg-muted">${this.heading}</span>${legend}</figcaption>
			${body}
		</figure>`
	}
}

define('line-chart', LineChart)
