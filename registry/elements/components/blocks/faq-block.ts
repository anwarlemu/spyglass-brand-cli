import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/accordion'
import '@/elements/components/ui/accordion-item'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// FaqBlock.tsx as <spyglass-faq-block>: the site's two-column FAQ, the `heading` (React's `title`), an optional `body`
// and `action` ({ label, href }, a quiet button) on the left, the `items` ({ q, a }) as accordion rows on the right.
export interface FaqItem { q: string; a: string }

/**
 * @summary Questions and answers, as the site sets them.
 */
export class FaqBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="faq-block"]'))
	static properties = { items: { type: Array }, heading: {}, body: {}, action: { type: Object } }
	items: FaqItem[] = []
	/** The heading (React's `title`). */
	heading = 'Questions.'
	/** A line under the heading. */
	body?: string
	/** A quiet button under the heading. */
	action?: { label: string; href?: string }

	render() {
		return html`<section data-ds="faq-block" class="grid gap-12 text-fg lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"><div class="flex flex-col items-start"><h2 class="type-section">${this.heading}</h2>${this.body ? html`<p class="mt-6 max-w-measure type-body-lg text-fg-soft">${this.body}</p>` : nothing}${this.action ? html`<spyglass-button href=${ifDefined(this.action.href)} variant="secondary" class="mt-8">${this.action.label}</spyglass-button>` : nothing}</div><div class="min-w-0 border-t border-edge"><spyglass-accordion>${(this.items ?? []).map((i, n) => html`<spyglass-accordion-item value=${`q${n + 1}`} heading=${i.q}>${i.a}</spyglass-accordion-item>`)}</spyglass-accordion></div></section>`
	}
}

define('faq-block', FaqBlock)
