import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import { startScene } from '@/lib/home/scene'
import { startDemo } from '@/lib/home/demo'
import { along, barCells, buildArchive, buildMeter, CUSTOM_CELLS, customTimeline, daysLive, endOf, fmt, meterCells, pct, REST_VISIT, runRange, runStatus, SERVER_COLS, TICKS, VISITS, whyContent, whyCreatives, YEARS, type WhyContent, type WhyCreative } from '@/lib/home/why'
import styles from 'virtual:tw'

// WhyBlock.tsx as <spyglass-why-block>: the head and three reasons over their instruments (the archive axis, the
// pricing meter, the tools giving way to one), playing while half on screen and still with reduced motion. `content`
// and `creatives` as JSON; `logo` is the advertiser's mark.

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/** @summary The home's reasons: three instruments over their titles, hairlines between. */
export class WhyBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="why-block"]'))
	static properties = { content: { type: Object }, creatives: { type: Array }, logo: {} }
	/** The copy, the archive's runs, the meter's calls and the tools. */
	content: WhyContent = whyContent
	/** The four creatives the archive's frame visits: { src?, tone? }. */
	creatives: WhyCreative[] = whyCreatives
	/** The advertiser's mark, 20px in a White circle. */
	logo?: string
	private stops: (() => void)[] = []

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stops.forEach((s) => s())
		this.stops = []
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('content') && this.stops.length) return
		this.stops.forEach((s) => s())
		const c = this.content ?? whyContent
		const q = (s: string) => this.renderRoot.querySelector<HTMLElement>(s)
		const ax = q('.ds-ax')
		const mt = q('.ds-mt')
		const cu = q('.ds-why-fill')
		this.stops = [ax && startScene(ax, buildArchive(c.archive.runs)), mt && startScene(mt, buildMeter(c.meter.calls)), cu && startDemo(cu, customTimeline, 400)].filter((s): s is () => void => !!s)
	}

	private archive(c: WhyContent['archive']) {
		const creatives = this.creatives ?? whyCreatives
		const rest = c.runs[VISITS[REST_VISIT]]
		return html`<div class="ds-ax"><div class="ds-ax-canvas" aria-hidden="true" inert><div class="ds-ax-top"><div class="ds-ax-frame">${VISITS.map((_, i) => html`<div class="ds-ax-pic" style=${`opacity: ${i === REST_VISIT ? 1 : 0}; z-index: ${i === REST_VISIT ? 1 : 0}`} data-pic=""><spyglass-creative-card ratio="fill" src=${ifDefined(creatives[i]?.src)} tone=${creatives[i]?.tone ?? 2}></spyglass-creative-card></div>`)}</div><div class="ds-ax-readout"><p class="ds-ax-brand"><span class="ds-ax-logo">${this.logo ? html`<img src=${this.logo} alt="">` : c.brand.slice(0, 1)}</span><span>${c.brand}</span><span class="ds-ax-channel">${c.channel}</span></p><p class="ds-ax-figure" data-fade=""><span class="ds-why-num ds-ax-days" data-days="">${daysLive(rest)}</span><span class="ds-why-label">${c.daysLive}</span></p><p class="ds-ax-when" data-fade=""><span class="ds-ax-status" data-status="" data-running=${ifDefined(rest.stop ? undefined : '')}>${runStatus(rest)}</span><span class="ds-ax-range" data-range="">${runRange(rest)}</span></p></div></div><div class="ds-ax-ledger"><div class="ds-ax-lanes" data-lanes="">${c.runs.map((run, i) => {
			const { a, b } = barCells(run)
			return html`<span class="ds-ax-bar" style=${`left: ${(a / 44) * 100}%; top: calc(${i} * var(--lane) - 4px)`} data-bar="" data-on=${ifDefined(i === VISITS[REST_VISIT] ? '' : undefined)}>${'='.repeat(b - a)}</span>`
		})}</div><div class="ds-ax-axis">${TICKS.map((t) => html`<span class=${t.major ? 'ds-ax-major' : 'ds-ax-tick'} style=${`left: ${t.at >= 1 ? 'calc(100% - 1px)' : pct(t.at)}`} data-tick=""></span>`)}<span class="ds-ax-span" style=${`left: ${pct(along(rest.start))}; width: ${pct(endOf(rest) - along(rest.start))}`} data-span=""></span></div><div class="ds-ax-labels">${YEARS.map((y) => html`<span class="ds-ax-year" style=${`left: ${pct(y.at)}`} data-year="">${y.label}</span>`)}<span class="ds-ax-today">${c.today}</span></div></div></div><p class="sr-only">${c.summary}</p></div>`
	}

	private meter(c: WhyContent['meter']) {
		const cells = meterCells(c.calls, SERVER_COLS)
		const total = c.calls.reduce((sum, call) => sum + call.credits, 0)
		const last = c.calls.length - 1
		return html`<div class="ds-mt"><div class="ds-mt-canvas" aria-hidden="true" inert><div class="ds-mt-readout"><p class="ds-mt-period"><span>${c.period}</span><span class="ds-mt-pool">${c.pool}</span></p><div class="ds-mt-figures"><p class="ds-mt-figure"><span class="ds-why-num ds-mt-total" data-total="">${fmt(total)}</span><span class="ds-why-label">${c.used}</span></p><p class="ds-mt-figure"><span class="ds-why-num ds-mt-seat-price">${c.seatPrice}</span><span class="ds-why-label">${c.seat}</span></p></div></div><div class="ds-mt-ledger"><ol role="list" class="ds-mt-rows">${c.calls.map((call, i) => html`<li class="ds-mt-row" data-row="" data-on=${ifDefined(i === last ? '' : undefined)}><span class="ds-mt-tool">${call.tool}</span><span class="ds-mt-returned">${call.returned ?? c.failed}</span><span class="ds-mt-lane" data-lane=""><span class="ds-why-glyphs ds-mt-bar" style=${`left: ${(cells[i].a / SERVER_COLS) * 100}%`} data-bar="">${'='.repeat(cells[i].b - cells[i].a)}</span></span><span class="ds-mt-credits" data-credits="">${call.credits}</span></li>`)}</ol><p class="ds-mt-rule">${c.rule}</p></div></div><p class="sr-only">${`A month of usage on one credit pool: ${c.calls.length} calls, each charged one credit per record returned, ${total} credits in all, and ${c.seatPrice} per seat.`}</p></div>`
	}

	private cells(at?: number, all = false) {
		return html`<span class="ds-why-glyphs ds-cu-bar" data-one=${ifDefined(all ? '' : undefined)}>${Array.from({ length: CUSTOM_CELLS }, (_, i) => (all || i === at ? html`<span class="ds-cu-cell" data-cell=""><span class="ds-cu-dash" data-dash="">-</span><span class="ds-cu-hash" data-hash="">#</span></span>` : html`<span class="ds-cu-cell">-</span>`))}</span>`
	}

	private custom(c: WhyContent['custom']) {
		return html`<div class="ds-why-fill"><div class="ds-cu-canvas" aria-hidden="true" inert><div class="ds-cu"><div class="ds-cu-tools"><ul class="ds-cu-list" role="list">${c.stack.map((name, i) => html`<li class="ds-cu-row" data-tool=""><span class="ds-cu-name">${name}</span>${this.cells(i)}<span class="ds-cu-used">${c.used}</span></li>`)}</ul><div class="ds-cu-row ds-cu-one"><span class="ds-cu-name">${c.one}</span>${this.cells(undefined, true)}<span class="ds-cu-used">${c.all}</span></div></div></div></div><p class="sr-only">${c.summary}</p></div>`
	}

	render() {
		const c = this.content ?? whyContent
		return html`<section data-ds="why-block" class="py-(--ds-layout-section) text-fg"><div class=${CONTAINER}><header class="ds-why-head mb-16 flex flex-col items-center text-center lg:mb-20"><h2 class="type-section">${c.headline}</h2><p class="mx-auto mt-6 max-w-(--ds-layout-measure) type-body-lg text-balance text-fg-soft">${c.lead}</p></header><ul role="list" class="ds-why-cards">${c.reasons.map((reason) => html`<li class="ds-why-card"><h3 class="row-start-2 mt-6 type-heading-4">${reason.title}</h3><p class="row-start-3 mt-3 type-body text-pretty text-fg-soft">${reason.line}</p><div class="ds-why-panel">${reason.key === 'memory' ? this.archive(c.archive) : reason.key === 'pricing' ? this.meter(c.meter) : reason.key === 'custom' ? this.custom(c.custom) : nothing}</div></li>`)}</ul></div></section>`
	}
}

define('why-block', WhyBlock)
