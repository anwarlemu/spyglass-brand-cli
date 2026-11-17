import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { RING_FRAME, RING_SLOTS, placeAt } from '@/lib/creative-layouts'
import '@/elements/components/site/creative-card'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// CreativeRing.tsx as <spyglass-creative-ring>: twelve tiles around a square in the post's places, eight creatives
// (`items`, clockwise from the top) and four light tiles (from `seed`). The default slot sits in the middle.
export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }

/**
 * @summary The creative ring: creatives and light tiles around the lockup.
 * @slot - What sits in the middle (the lockup).
 */
export class CreativeRing extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="creative-ring"]'))
	static properties = { items: { type: Array }, seed: { type: Number } }
	/** Up to eight creatives, clockwise from the top. */
	items: CreativeItem[] = []
	/** The first light tile's seed. */
	seed = 0

	render() {
		const items = this.items ?? []
		let n = 0
		let lights = 0
		return html`<div data-ds="creative-ring" class="relative aspect-square">${RING_SLOTS.map((slot) => {
			const at = styleMap(placeAt(slot, RING_FRAME, RING_FRAME))
			if (slot.light) return html`<div class="absolute" style=${at}><spyglass-brand-light variant="tile" seed=${this.seed + lights++} cover class="size-full rounded-container"></spyglass-brand-light></div>`
			const it: CreativeItem = items.length ? items[n++ % items.length] : {}
			return html`<div class="absolute" style=${at}><spyglass-creative-card ratio="fill" src=${ifDefined(it.src)} alt=${ifDefined(it.alt)} brand=${ifDefined(it.brand)} caption=${ifDefined(it.caption)} tone=${ifDefined(it.tone)} href=${ifDefined(it.href)}></spyglass-creative-card></div>`
		})}${this.hasSlot() ? html`<div class="absolute inset-0 flex items-center justify-center"><slot></slot></div>` : nothing}</div>`
	}
}

define('creative-ring', CreativeRing)
