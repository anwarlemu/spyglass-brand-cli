import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define } from '@/elements/lib/element'
import { navIcon, navIconStyles } from '@/elements/components/site/nav-icon'
import { GLYPH, menuPanelsStyles, offerRowBody, ROW, STRIP, STRIP_LINK } from '@/elements/components/site/menu-panels'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import { headerMenus, LIVE_CROSSFADE_MS, type OfferRow, type ProductsMenu, type SoonRow } from '@/lib/site-header'
import '@/elements/components/site/product-visual'
import styles from 'virtual:tw'

// ProductsLivePanel.tsx as a template function (the header's nav renders it with these styles) and as
// <spyglass-products-live-panel menu='{...}'> on its own: the offers and the live soon row beside the live card that
// crossfades to the active row (its picture over the texture, or the texture and its glyph, or the live soon groups in
// words); the pictures load ahead, hidden; the build strip at the foot.
export const productsLivePanelStyles = styles

export const productsPanel = (menu: ProductsMenu, active: number, leaving: number | null, onShow: (i: number) => void) => {
	const rows: (OfferRow | SoonRow)[] = [...menu.offers, ...(menu.soon ? [menu.soon] : [])]
	const current = rows[active] ?? rows[0]
	const groups = current && 'groups' in current ? current.groups : undefined
	return html`<div data-ds="products-live-panel" class="contents"><div class="flex gap-1 p-1"><ul class="flex w-80 flex-none flex-col gap-1">${rows.map((item, i) => html`<li><a class=${ROW} href=${item.href} data-active=${ifDefined(i === active ? '' : undefined)} @pointerenter=${() => onShow(i)} @focus=${() => onShow(i)}>${offerRowBody(item)}</a></li>`)}</ul>${current ? html`<a href=${current.href} tabindex="-1" aria-hidden="true" class="relative grid w-(--ds-header-live-card-w) flex-none overflow-hidden rounded-ds-sm bg-surface-raised">${repeat([leaving, active].filter((i): i is number => i !== null && Boolean(rows[i])), (i) => rows[i].key, (i) => {
		const item = rows[i]
		const picture = 'picture' in item ? item.picture : undefined
		const visual = 'visual' in item ? item.visual : undefined
		const platforms = 'platforms' in item ? item.platforms : undefined
		return html`<span data-on=${ifDefined(i === active ? '' : undefined)} class="ds-live-stage relative isolate grid h-full place-items-center overflow-hidden rounded-ds-sm bg-surface-raised opacity-0 [grid-area:1/1] data-on:z-1 data-on:opacity-100"><span aria-hidden="true" class="pointer-events-none absolute inset-0 -z-1 select-none" style=${asciiDriftStyle('mass', 'centre', 'faint')}></span>${visual ? html`<span class=${VISUAL}><spyglass-product-visual kind=${visual} texture="none" fill class="h-full"></spyglass-product-visual></span>` : picture ? html`<img src=${picture} alt="" class="absolute inset-0 size-full object-cover">` : 'groups' in item ? nothing : html`<span class=${`${GLYPH} size-16 rounded-control [--glyph-body:var(--ds-color-neutral-7)] [--glyph-lit:var(--ds-color-fg)]`}>${navIcon(item.icon, 24)}</span>`}${platforms?.length ? html`<span class="absolute top-3 left-3 z-2 flex rounded-ds-sm bg-surface px-2 py-1 type-caption text-fg-soft">${platforms.join(', ')}</span>` : nothing}</span>`
	})}${groups ? html`<span aria-hidden="true" class="pointer-events-none absolute inset-0 z-2 grid place-items-center content-center gap-8">${groups.map((g) => html`<span class="grid justify-items-center gap-4"><span class="type-ui text-fg-soft">${g.label}</span><span class="flex flex-wrap justify-center gap-x-6 gap-y-2 px-6">${g.items.map((w) => html`<span class="type-body font-medium text-fg">${w}</span>`)}</span></span>`)}</span>` : nothing}</a>` : nothing}<div hidden aria-hidden="true" inert>${rows.map((item) => ('picture' in item && item.picture ? html`<img src=${item.picture} alt="" loading="eager">` : nothing))}</div></div><div class=${STRIP}><span class="type-ui text-fg-muted">${menu.strip.label}</span><ul class="flex gap-1">${menu.strip.links.map((link) => html`<li><a class=${STRIP_LINK} href=${link.href}>${link.label}</a></li>`)}</ul></div></div>`
}

// The product's scene fills the card at the menu's quicker reading pace (site --dur-read-first-menu, -hold-menu).
const VISUAL = 'absolute inset-0 grid [--ds-read-first:var(--ds-read-first-menu)] [--ds-read-hold:var(--ds-read-hold-menu)]'

/** A controller for the live card's active row and its crossfade, shared by the panel and the header's nav. */
export class LiveState {
	active = 0
	leaving: number | null = null
	private timer = 0
	constructor(private readonly update: () => void) {}
	show(i: number) {
		if (i === this.active) return
		clearTimeout(this.timer)
		this.leaving = this.active
		this.active = i
		this.update()
		this.timer = window.setTimeout(() => {
			this.leaving = null
			this.update()
		}, LIVE_CROSSFADE_MS)
	}
	stop() {
		clearTimeout(this.timer)
	}
}

/** @summary The header's products menu on its own: offers beside the live card. */
export class ProductsLivePanel extends DsElement {
	static styles = [DsElement.styles, navIconStyles, menuPanelsStyles, styles]
	static properties = { menu: { type: Object } }
	/** The menu's content (lib/site-header.ts headerMenus.products by default). */
	menu: ProductsMenu = headerMenus.products
	private live = new LiveState(() => this.requestUpdate())

	disconnectedCallback() {
		super.disconnectedCallback()
		this.live.stop()
	}

	render() {
		return productsPanel(this.menu ?? headerMenus.products, this.live.active, this.live.leaving, (i) => this.live.show(i))
	}
}

define('products-live-panel', ProductsLivePanel)
