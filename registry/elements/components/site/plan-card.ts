import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// PlanCard.tsx as <spyglass-plan-card>: the Creator plan card, the #171717 fill with the brand corner, the plan's name
// (`heading`, React's `title`), the price line, the lines it includes (`features`, a list) and one full-width White
// button (`cta`, a link with `href`). Pressing the button fires `select`.

/**
 * @summary The plan card: name, price, what it includes and one White button.
 * @fires select - The button was pressed.
 */
export class PlanCard extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="plan-card"]'))
	static properties = { heading: {}, price: {}, features: { type: Array }, cta: {}, href: {} }
	/** The plan's name (React's `title`). */
	heading = ''
	/** The price, as a sentence with concrete numbers. */
	price?: string
	/** What the plan includes, one line each. */
	features: string[] = []
	/** The button's label. */
	cta?: string
	/** Makes the button a link. */
	href?: string

	render() {
		const features = this.features ?? []
		return html`<div data-ds="plan-card" class="flex flex-col rounded-container bg-surface-raised p-8 text-fg max-sm:p-6"><h3 class="type-heading-2">${this.heading}</h3>${this.price ? html`<p class="mt-4 type-body text-fg">${this.price}</p>` : nothing}${features.length ? html`<ul class="mt-6 flex flex-col gap-2 type-ui text-fg">${features.map((f) => html`<li>${f}</li>`)}</ul>` : nothing}${this.cta ? html`<spyglass-button href=${ifDefined(this.href)} class="mt-6 w-full" @click=${() => this.emit('select')}>${this.cta}</spyglass-button>` : nothing}</div>`
	}
}

define('plan-card', PlanCard)
