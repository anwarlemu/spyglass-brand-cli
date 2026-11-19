import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/card'
import styles from 'virtual:tw'

// FeatureGridBlock.tsx as <spyglass-feature-grid-block>: a `heading` (React's `title`) and a `body` line over cards
// (`features`, a list of { title, body }), three across or two (`columns`), one on phones.
export interface Feature { title: string; body: string }

/**
 * @summary What the product does, as a grid of cards.
 */
export class FeatureGridBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="feature-grid-block"]'))
	static properties = { features: { type: Array }, heading: {}, body: {}, columns: { type: Number } }
	features: Feature[] = []
	/** A heading above the cards (React's `title`). */
	heading?: string
	/** A line under the heading. */
	body?: string
	/** Cards across on wide screens: 2 or 3. */
	columns: 2 | 3 = 3

	render() {
		return html`<section data-ds="feature-grid-block" class="grid gap-10 text-fg max-sm:gap-8">${this.heading || this.body ? html`<div class="grid max-w-3xl gap-4">${this.heading ? html`<h2 class="type-heading-1 text-balance max-sm:type-heading-2">${this.heading}</h2>` : nothing}${this.body ? html`<p class="type-body-lg text-fg-soft">${this.body}</p>` : nothing}</div>` : nothing}<div class=${['grid gap-4 max-md:grid-cols-1', this.columns === 2 ? 'grid-cols-2' : 'grid-cols-3'].join(' ')}>${(this.features ?? []).map((f) => html`<spyglass-card heading=${f.title} description=${f.body}></spyglass-card>`)}</div></section>`
	}
}

define('feature-grid-block', FeatureGridBlock)
