import { html, nothing } from 'lit'
import { ChevronRight } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Item.tsx as <spyglass-item>: a row with media, a title in DM Sans Medium with a muted line under it, and actions at
// the end. `variant` default (no fill), outline (a hairline box) or muted (the card's fill); `size` sm is tighter. With
// `href` the whole row is one link that takes the ghost fill under the pointer; `arrow` adds a chevron that brightens
// with it and never moves. A link holds no buttons: the actions slot only shows on a row without href.

const VARIANTS = {
	default: 'bg-transparent',
	outline: 'rounded-container border border-edge',
	muted: 'rounded-container bg-surface-raised',
} as const
const SIZES = { default: 'gap-4 p-4', sm: 'gap-3 px-4 py-3' } as const

/**
 * @summary A row: media, a title and a muted line, and actions; with href, the whole row is a link.
 * @slot - The title, in place of `heading`.
 * @slot media - Before the title: an icon, a logo, a thumbnail.
 * @slot actions - At the end, on a row without href only.
 */
export class Item extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="item"]'))
	static properties = { heading: {}, description: {}, variant: { reflect: true }, size: { reflect: true }, href: {}, arrow: { type: Boolean } }

	/** The title (React's `title`; `title` is HTML's tooltip attribute). */
	heading?: string
	/** A muted line under the title. */
	description?: string
	/** default, outline or muted. */
	variant: keyof typeof VARIANTS = 'default'
	/** default or sm. */
	size: keyof typeof SIZES = 'default'
	/** The whole row opens this. */
	href?: string
	/** A chevron at the end of a link row. */
	arrow = false

	render() {
		const classes = ['group/item flex min-w-0 items-center', VARIANTS[this.variant] ?? VARIANTS.default, SIZES[this.size] ?? SIZES.default].join(' ')
		const body = html`${this.hasSlot('media') ? html`<span class="flex shrink-0 items-center justify-center text-fg-soft"><slot name="media"></slot></span>` : nothing}<span class="flex min-w-0 flex-1 flex-col gap-1"><span class="truncate type-ui-strong text-fg"><slot></slot>${this.hasSlot() ? nothing : this.heading}</span>${this.description ? html`<span class="line-clamp-2 type-ui text-fg-muted">${this.description}</span>` : nothing}</span>`
		if (this.href) {
			return html`<a data-ds="item" href=${this.href} class=${`${classes} cursor-pointer rounded-container transition-[background-color] duration-150 ease-standard hover:bg-action-ghost-hover`}>${body}${this.arrow ? icon(ChevronRight, 'chevron-right', { size: 16, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted transition-[color] duration-150 ease-standard group-hover/item:text-fg', attrs: { 'aria-hidden': 'true' } }) : nothing}</a>`
		}
		return html`<div data-ds="item" class=${classes}>${body}${this.hasSlot('actions') ? html`<span class="flex shrink-0 items-center gap-2"><slot name="actions"></slot></span>` : nothing}</div>`
	}
}

define('item', Item)
