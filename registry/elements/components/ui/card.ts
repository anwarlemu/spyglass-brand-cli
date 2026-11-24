import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Card.tsx as <spyglass-card>: a #262626 fill on Black with the 4px corner, no border, no shadow, 24px in. `heading` is the
// Funnel Display card title (React's `title`; `title` is HTML's tooltip), `description` a line under it, the default
// slot the body and the `actions` slot a row at the foot.

/**
 * @summary A card: the brand's #262626 fill, a title, a line and actions.
 * @slot - The body.
 * @slot actions - Buttons or links at the foot.
 */
export class Card extends DsElement {
	static styles = [DsElement.styles, styles]
	// Layout classes on the element (w-150, max-w-full) land on the card, as on the React root.
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="card"]'))
	static properties = { heading: {}, description: {} }
	/** The card title (React's `title`). */
	heading?: string
	description?: string

	render() {
		const head = this.heading || this.description
		return html`<div data-ds="card" class="flex flex-col gap-6 rounded-container bg-surface-raised p-6 text-fg">${head ? html`<div class="flex flex-col gap-2">${this.heading ? html`<h3 class="type-heading-3">${this.heading}</h3>` : nothing}${this.description ? html`<p class="type-body text-fg-soft">${this.description}</p>` : nothing}</div>` : nothing}<slot></slot>${this.hasSlot('actions') ? html`<div class="mt-2 flex flex-wrap gap-3"><slot name="actions"></slot></div>` : nothing}</div>`
	}
}

define('card', Card)
