import { html, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/site/creative-card'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import { startPanelsMotion } from '@/lib/panels-motion'
import { PANEL_RANK, pricingPanelSets, pricingPanelsContent, sentences, type PanelCreative, type PricingPanelsContent } from '@/lib/home/pricing'
import styles from 'virtual:tw'

// PricingPanelsBlock.tsx as <spyglass-pricing-panels-block>: the headline, the terms and two buttons; from 1024 the run
// of five creatives turned away in perspective, the sets taking turns (lib/panels-motion.ts), still with reduced
// motion. `content` and `sets` as JSON (five sets of five: { src?, alt?, brand?, tone? }).

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/** @summary The home's pricing strip: two lines, the terms, two buttons and the run of creatives taking turns. */
export class PricingPanelsBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-panels-block"]'))
	static properties = { content: { type: Object }, sets: { type: Array } }
	/** The copy: { lines, note, primary, secondary }. */
	content: PricingPanelsContent = pricingPanelsContent
	/** Five sets of five creatives: { src?, alt?, brand?, tone? }. */
	sets: PanelCreative[][] = pricingPanelSets
	private stop?: () => void

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = undefined
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('sets') && this.stop) return
		this.stop?.()
		const stage = this.renderRoot.querySelector<HTMLElement>('.ds-pp-stage')
		this.stop = stage ? startPanelsMotion(stage) : undefined
	}

	render() {
		const c = this.content ?? pricingPanelsContent
		const sets = this.sets ?? pricingPanelSets
		const slots = sets[0]?.length ?? 0
		return html`<section data-ds="pricing-panels-block" class="ds-pp relative isolate overflow-x-clip text-fg"><span aria-hidden="true" class="ds-pp-drift" style=${asciiDriftStyle('mass', 'right')}></span><div class=${`${CONTAINER} grid items-center gap-12 lg:grid-cols-[max-content_minmax(0,1fr)]`}><div class="flex flex-col items-center text-center md:items-start md:text-start"><h2 class="ds-pp-head type-section">${c.lines.map((line, i) => html`<span class="block">${line}${i < c.lines.length - 1 ? ' ' : ''}</span>`)}</h2><p class="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${sentences(c.note).map((s, i) => html`<span>${i > 0 ? ' ' : ''}<span class="ds-pp-sentence">${s}</span></span>`)}</p><div class="mt-10 grid gap-3 self-stretch md:inline-grid md:auto-cols-fr md:grid-flow-col md:self-start"><spyglass-button href=${c.primary.href}>${c.primary.label}</spyglass-button><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div></div><div aria-hidden="true" class="ds-pp-stage"><div class="ds-pp-view"><div class="ds-pp-run">${Array.from({ length: slots }, (_, slot) => html`<div class="ds-pp-card" style=${`--i: ${slot}`}>${sets.map((set, s) => {
			const item = set[slot] ?? {}
			return html`<div class="ds-pp-picture" data-set=${s} data-rank=${PANEL_RANK[slot] ?? slot}><spyglass-creative-card ratio="fill" src=${item.src ?? ''} alt="" brand=${item.brand ?? ''} tone=${item.tone ?? 2}></spyglass-creative-card></div>`
		})}</div>`)}</div></div></div></div></section>`
	}
}

define('pricing-panels-block', PricingPanelsBlock)
