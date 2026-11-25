import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/blocks/faq-accordion'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// FaqBlock.tsx as <spyglass-faq-block>: the site's FAQ, the head (`heading`, React's `title`; `body`; `action` as a quiet
// button) on the left from 1024, held under the header while the questions (`items`, { q, a }) scroll by on the right;
// `layout="stack"` puts the head over a narrow list. `head-id` names the heading; `default-open` the first open row.
export interface FaqItem { q: string; a: string; id?: string }

/**
 * @summary Questions and answers, as the site sets them.
 */
export class FaqBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="faq-block"]'))
	static properties = { items: { type: Array }, heading: {}, body: {}, action: { type: Object }, headId: { attribute: 'head-id' }, arrangement: { attribute: 'layout' }, defaultOpen: { type: Number, attribute: 'default-open' } }
	items: FaqItem[] = []
	/** The heading (React's `title`). */
	heading = 'Questions.'
	/** A line under the heading. */
	body?: string
	/** A quiet button under the heading. */
	action?: { label: string; href?: string }
	/** Names the heading (React's `id`). */
	headId = 'faq'
	/** split (head left, questions right) or stack (head over a narrow list); the `layout` attribute (React's `layout`). */
	arrangement: 'split' | 'stack' = 'split'
	defaultOpen = 0

	render() {
		const stack = this.arrangement === 'stack'
		return html`<section data-ds="faq-block" aria-labelledby=${`${this.headId}-heading`} class=${`grid grid-cols-[minmax(0,1fr)] text-fg ${stack ? 'gap-y-16 lg:gap-y-20' : 'gap-y-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-start lg:gap-x-16'}`}><header class=${`flex flex-col ${stack ? 'items-center text-center' : 'items-start max-md:items-center max-md:text-center lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]'}`}><h2 id=${`${this.headId}-heading`} class="type-section max-lg:[text-box:trim-start_cap_alphabetic]">${this.heading}</h2>${this.body ? html`<p class="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">${this.body}</p>` : nothing}${this.action ? html`<spyglass-button href=${ifDefined(this.action.href)} variant="secondary" class="mt-8 max-md:w-full">${this.action.label}</spyglass-button>` : nothing}</header><div class="min-w-0"><spyglass-faq-accordion .items=${this.items ?? []} .defaultOpen=${this.defaultOpen} edge=${stack ? 'bottom' : 'top'} ?narrow=${stack}></spyglass-faq-accordion></div></section>`
	}
}

define('faq-block', FaqBlock)
