import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ProductCards.tsx as <spyglass-product-cards>: products in a hairline-ruled grid of links, the name, the line and the
// endpoint in the code face; the #262626 fill under a mouse. `products` as JSON: [{ name, line, endpoint?, href }].

export interface ProductCardItem { name: string; line: string; endpoint?: string; href: string }

/**
 * @summary Product cards: links in a ruled grid with the name, a line and the endpoint.
 */
export class ProductCards extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-cards"]'))
	static properties = { products: { type: Array }, columns: { type: Number } }
	products: ProductCardItem[] = []
	/** 3 or 4 columns from 1024 (two from 768). */
	columns: 3 | 4 = 3

	render() {
		return html`<ul data-ds="product-cards" role="list" class=${`m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-px bg-edge p-0 text-fg ${this.columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>${(this.products ?? []).map((p) => html`<li class="flex bg-surface"><a href=${p.href} class="flex flex-1 flex-col gap-2 bg-surface py-6 outline-offset-[-4px] transition-[background-color] duration-160 ease-out active:bg-surface-raised pointer-fine:hover:bg-surface-raised md:p-8"><span class="type-heading-4 md:type-heading-3">${p.name}</span><span class="type-body text-pretty text-fg-soft">${p.line}</span>${p.endpoint ? html`<span class="mt-auto pt-2 type-code wrap-anywhere text-fg-muted">${p.endpoint}</span>` : nothing}</a></li>`)}</ul>`
	}
}

define('product-cards', ProductCards)
