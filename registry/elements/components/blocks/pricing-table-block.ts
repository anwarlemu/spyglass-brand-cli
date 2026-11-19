import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/plan-card'
import styles from 'virtual:tw'

// PricingTableBlock.tsx as <spyglass-pricing-table-block>: a centered `heading` (React's `title`) and `body` over plan
// cards (`plans`, a list of { title, price, features, cta, href }), the same width and height, centered as a row.
export interface Plan { title: string; price?: string; features?: string[]; cta?: string; href?: string }

/**
 * @summary Plans side by side.
 */
export class PricingTableBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-table-block"]'))
	static properties = { plans: { type: Array }, heading: {}, body: {} }
	plans: Plan[] = []
	/** A heading above the plans (React's `title`). */
	heading?: string
	/** A line under the heading. */
	body?: string

	render() {
		return html`<section data-ds="pricing-table-block" class="flex flex-col gap-12 text-fg max-sm:gap-8">${this.heading || this.body ? html`<div class="mx-auto grid max-w-3xl gap-4 text-center">${this.heading ? html`<h2 class="type-heading-1 text-balance max-sm:type-heading-2">${this.heading}</h2>` : nothing}${this.body ? html`<p class="type-body-lg text-fg-soft">${this.body}</p>` : nothing}</div>` : nothing}<div class="flex flex-wrap items-stretch justify-center gap-4">${(this.plans ?? []).map((p) => html`<spyglass-plan-card heading=${p.title} .price=${p.price} .features=${p.features ?? []} .cta=${p.cta} .href=${p.href} class="w-100 max-w-full"></spyglass-plan-card>`)}</div></section>`
	}
}

define('pricing-table-block', PricingTableBlock)
