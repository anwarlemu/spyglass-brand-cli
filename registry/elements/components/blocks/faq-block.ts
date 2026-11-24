import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// FaqBlock.tsx as <spyglass-faq-block>: the `heading` (React's `title`) in the first of three columns, the `items`
// ({ q, a }) in the other two, each under a hairline.
export interface FaqItem { q: string; a: string }

/**
 * @summary Questions and answers.
 */
export class FaqBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="faq-block"]'))
	static properties = { items: { type: Array }, heading: {} }
	items: FaqItem[] = []
	/** The heading (React's `title`). */
	heading = 'Questions.'

	render() {
		return html`<section data-ds="faq-block" class="grid grid-cols-3 gap-12 text-fg max-md:grid-cols-1 max-md:gap-8"><h2 class="type-section">${this.heading}</h2><dl class="col-span-2 m-0 grid max-md:col-span-1">${(this.items ?? []).map((i) => html`<div class="grid gap-2 border-t border-edge py-5"><dt class="type-body text-fg">${i.q}</dt><dd class="m-0 max-w-measure type-body text-fg-soft">${i.a}</dd></div>`)}</dl></section>`
	}
}

define('faq-block', FaqBlock)
