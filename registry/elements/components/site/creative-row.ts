import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { peakWeights } from '@/lib/creative-layouts'
import '@/elements/components/site/creative-card'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// CreativeRow.tsx as <spyglass-creative-row>: a row of 4/5 creatives, `even` (one size) or `peak` (rising to the
// middle, as the deck cover). `items` is a list (JSON attribute or property).
export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }

/**
 * @summary A row of creatives, even or rising to the middle.
 */
export class CreativeRow extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="creative-row"]'))
	static properties = { items: { type: Array }, variant: {} }
	/** The creatives. */
	items: CreativeItem[] = []
	/** even or peak. */
	variant: 'even' | 'peak' = 'even'

	render() {
		const items = this.items ?? []
		const weights = this.variant === 'peak' ? peakWeights(items.length) : items.map(() => 1)
		return html`<div data-ds="creative-row" class="flex items-center gap-4 max-sm:gap-2">${items.map((it, i) => html`<div class="min-w-0 basis-0" style="flex-grow: ${weights[i]}; aspect-ratio: 4 / 5;">${it.light ? html`<spyglass-brand-light variant="tile" seed=${it.seed ?? i} cover class="size-full rounded-container"></spyglass-brand-light>` : html`<spyglass-creative-card ratio="fill" src=${ifDefined(it.src)} alt=${ifDefined(it.alt)} brand=${ifDefined(it.brand)} caption=${ifDefined(it.caption)} tone=${ifDefined(it.tone)} href=${ifDefined(it.href)}></spyglass-creative-card>`}</div>`)}</div>`
	}
}

define('creative-row', CreativeRow)
