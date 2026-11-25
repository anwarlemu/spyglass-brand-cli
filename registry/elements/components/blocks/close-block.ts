import { html, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/site/connect-menu'
import '@/elements/components/site/creative-card'
import { asciiDriftStyle, type AsciiDriftCrop, type AsciiDriftFrom } from '@/lib/ascii-drift'
import type { ConnectContent } from '@/lib/connect'
import { closeContent, closeCreatives, closeTags, phoneRunSpots, phoneSpots, runSpots, spots, startCloseLight, startCloseTags, type CloseContent, type CloseCreative, type Spot } from '@/lib/home/close'
import styles from 'virtual:tw'

// CloseBlock.tsx as <spyglass-close-block>: the headline and the connect menu in a screen-tall field of creatives the
// light wakes once, the pointer lighting the ones near it and a tag naming the one under it; a plain centered close on
// phones. `content`, `creatives`, `tags` and `connect` as JSON.

const DRIFTS: [string, AsciiDriftCrop, AsciiDriftFrom][] = [['mass', 'mass', 'left'], ['high', 'scatter', 'right'], ['low', 'cluster', 'bottom']]

/** @summary The home's close: the headline and the connect menu among creatives the light wakes. */
export class CloseBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="close-block"]'))
	static properties = { content: { type: Object }, creatives: { type: Array }, tags: { type: Array }, connect: { type: Object } }
	/** { headline, secondary }. */
	content: CloseContent = closeContent
	/** The creatives cycled through the field: { src?, alt?, tone? }. */
	creatives: CloseCreative[] = closeCreatives
	/** What the tag says over each creative. */
	tags: string[] = closeTags
	/** The connect menu's rows (lib/connect.ts). */
	connect?: ConnectContent
	private stops: (() => void)[] = []

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stops.forEach((s) => s())
		this.stops = []
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('creatives') && !changed.has('tags') && this.stops.length) return
		this.stops.forEach((s) => s())
		const q = (s: string) => this.renderRoot.querySelector<HTMLElement>(s)
		const section = q('.ds-close')
		const band = q('.ds-close-sweep')
		const tag = q('.ds-close-tag')
		this.stops = section && band && tag ? [startCloseLight(section, band), startCloseTags(section, tag)] : []
	}

	private field(list: Spot[], name: string, layer: string) {
		const creatives = this.creatives ?? closeCreatives
		const tags = this.tags ?? closeTags
		return html`<div class="ds-close-field" data-field=${name} data-layer=${layer} aria-hidden="true">${list.map((spot) => {
			const item = creatives[spot.creative % creatives.length] ?? {}
			return html`<span class="ds-close-spot" data-spot="" data-off=${ifDefined(spot.off.length ? spot.off.join(' ') : undefined)} data-tag=${tags[spot.creative % tags.length]} style=${`--x: ${spot.x}; --y: ${spot.y}; --s: ${spot.size}`}><span class="ds-close-picture"><spyglass-creative-card ratio="fill" src=${ifDefined(item.src)} alt=${item.alt ?? ''} fit=${ifDefined(item.fit)} position=${ifDefined(item.position)} tone=${item.tone ?? 2}></spyglass-creative-card></span></span>`
		})}</div>`
	}

	render() {
		const c = this.content ?? closeContent
		return html`<section data-ds="close-block" class="ds-close text-fg">${DRIFTS.map(([at, crop, from]) => html`<span aria-hidden="true" class="ds-close-ascii" data-at=${at} style=${`${asciiDriftStyle(crop, from)}; opacity: var(--ds-close-ascii)`}></span>`)}<div class="ds-close-sweep" aria-hidden="true"></div><span class="ds-close-tag" aria-hidden="true"></span>${this.field(spots, 'wide', 'scatter')}${this.field(runSpots, 'wide', 'run')}${this.field(phoneSpots, 'phone', 'scatter')}${this.field(phoneRunSpots, 'phone', 'run')}<div class="ds-close-content"><h2 class="ds-close-line type-section">${c.headline}</h2><div class="ds-close-actions"><div class="ds-close-connect"><spyglass-connect-menu .content=${this.connect}></spyglass-connect-menu></div><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div></div></section>`
	}
}

define('close-block', CloseBlock)
