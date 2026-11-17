import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { CORRIDOR_FRAME, CORRIDOR_LIGHT, corridorWalls, placeAt } from '@/lib/creative-layouts'
import '@/elements/components/site/creative-card'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// CreativeCorridor.tsx as <spyglass-creative-corridor>: twelve creatives as walls receding to a small light, in the
// ad's places, nearest first and alternating left and right (`items`); `seed` draws the light.
export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }

/**
 * @summary The corridor: creatives as walls receding to the light.
 */
export class CreativeCorridor extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="creative-corridor"]'))
	static properties = { items: { type: Array }, seed: { type: Number } }
	/** Up to twelve creatives, nearest first, left then right. */
	items: CreativeItem[] = []
	/** The light's seed. */
	seed = 0

	render() {
		const { width, height } = CORRIDOR_FRAME
		const items = this.items ?? []
		return html`<div data-ds="creative-corridor" class="relative w-full overflow-hidden" style="aspect-ratio: ${width} / ${height};"><div class="absolute" style=${styleMap(placeAt(CORRIDOR_LIGHT, width, height))}><spyglass-brand-light variant="close-up" seed=${this.seed} cover class="size-full"></spyglass-brand-light></div>${corridorWalls().map((wall, i) => {
			const it: CreativeItem = items.length ? items[i % items.length] : {}
			return html`<div class="absolute" style=${styleMap({ ...placeAt(wall, width, height), clipPath: wall.clip })}><spyglass-creative-card ratio="fill" src=${ifDefined(it.src)} alt=${ifDefined(it.alt)} brand=${ifDefined(it.brand)} caption=${ifDefined(it.caption)} tone=${ifDefined(it.tone)} href=${ifDefined(it.href)}></spyglass-creative-card></div>`
		})}</div>`
	}
}

define('creative-corridor', CreativeCorridor)
