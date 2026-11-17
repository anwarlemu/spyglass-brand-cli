import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// CreativeGrid.tsx as <spyglass-creative-grid>: creatives in a grid, every cell the same shape (`ratio`), an item with
// `light` a tile of the brand light. `items` is a list (JSON attribute or property) of creatives.
export interface CreativeItem { src?: string; alt?: string; brand?: string; caption?: string; tone?: 1 | 2 | 3 | 4; href?: string; light?: boolean; seed?: number }

const COLUMNS: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4 max-sm:grid-cols-2' }
const GAPS: Record<string, string> = { sm: 'gap-2', md: 'gap-6 max-sm:gap-3' }

/**
 * @summary Creatives in a grid, with light tiles among them.
 */
export class CreativeGrid extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="creative-grid"]'))
	static properties = { items: { type: Array }, columns: { type: Number }, ratio: {}, gap: {} }
	/** The creatives (light: true for a light tile). */
	items: CreativeItem[] = []
	/** 2, 3 or 4 columns. */
	columns: 2 | 3 | 4 = 3
	/** Every cell's shape. */
	ratio = '1/1'
	/** sm or md. */
	gap: 'sm' | 'md' = 'sm'

	render() {
		const cls = ['grid', COLUMNS[this.columns] ?? COLUMNS[3], GAPS[this.gap] ?? GAPS.sm].join(' ')
		return html`<div data-ds="creative-grid" class=${cls}>${(this.items ?? []).map((it, i) => html`<div class="min-w-0" style="aspect-ratio: ${this.ratio.replace('/', ' / ')};">${it.light ? html`<spyglass-brand-light variant="tile" seed=${it.seed ?? i} cover class="size-full rounded-container"></spyglass-brand-light>` : html`<spyglass-creative-card ratio="fill" src=${ifDefined(it.src)} alt=${ifDefined(it.alt)} brand=${ifDefined(it.brand)} caption=${ifDefined(it.caption)} tone=${ifDefined(it.tone)} href=${ifDefined(it.href)}></spyglass-creative-card>`}</div>`)}</div>`
	}
}

define('creative-grid', CreativeGrid)
