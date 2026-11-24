import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// BentoBlock.tsx as <spyglass-bento-block>: features as a bento grid from `items` ({ title, body, image, span }), with
// an optional `heading` (React's `title`) and `body`.
export interface BentoItem { title: string; body?: string; image?: string; span?: 'normal' | 'wide' | 'tall' }

const SPAN = { normal: 'lg:col-span-2', wide: 'md:col-span-2 lg:col-span-4', tall: 'lg:col-span-2 lg:row-span-2' }

/**
 * @summary Features as a bento grid of cards.
 */
export class BentoBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="bento-block"]'))
	static properties = { items: { type: Array }, heading: {}, body: {} }
	items: BentoItem[] = []
	/** The heading (React's `title`). */
	heading?: string
	body?: string

	render() {
		return html`<section data-ds="bento-block" class="grid gap-10 text-fg">${this.heading || this.body ? html`<div class="grid max-w-3xl gap-6">${this.heading ? html`<h2 class="type-section">${this.heading}</h2>` : nothing}${this.body ? html`<p class="max-w-measure type-body-lg text-fg-soft">${this.body}</p>` : nothing}</div>` : nothing}<ul role="list" class="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:auto-rows-[minmax(200px,auto)] lg:grid-cols-6">${(this.items ?? []).map((i) => html`<li class=${`flex flex-col gap-4 overflow-hidden rounded-container bg-surface-raised p-6 ${SPAN[i.span ?? 'normal'] ?? SPAN.normal}`}>${i.image ? html`<img src=${i.image} alt="" class="aspect-[16/9] w-full rounded-ds-sm object-cover">` : nothing}<div class="mt-auto grid gap-2"><h3 class="type-heading-3">${i.title}</h3>${i.body ? html`<p class="type-body text-fg-soft">${i.body}</p>` : nothing}</div></li>`)}</ul></section>`
	}
}

define('bento-block', BentoBlock)
