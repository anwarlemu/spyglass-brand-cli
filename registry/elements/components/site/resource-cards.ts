import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { isExternal, type ResourceCard, type ResourceCover, type ResourceRow } from '@/lib/resource-cards'
import '@/elements/components/site/code'
import '@/elements/components/site/creative-card'
import '@/elements/components/ui/badge'
import styles from 'virtual:tw'

export type { ResourceCard, ResourceCover, ResourceCreative, ResourceRow } from '@/lib/resource-cards'

// ResourceCards.tsx as <spyglass-resource-cards>: the site's resource hub cards (a cover of creatives or code, the
// title, the line and the meta) on the #262626 surface, two columns from 768 or `columns="3"` for the use-cases hub
// (three from 1024), and the hairline rows of what is not ready under them. `cards` and `rows` are lists (JSON
// attributes or properties). A card's surface and a row's name change color under a mouse; nothing moves.

const ROW = 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-edge py-5 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:py-6'

/**
 * @summary The resource hub's cards and rows.
 */
export class ResourceCards extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="resource-cards"]'))
	static properties = { cards: { type: Array }, rows: { type: Array }, rowsLabel: { attribute: 'rows-label' }, columns: { type: Number } }
	/** The cards: { title, line, href, meta?, cover? }. */
	cards: ResourceCard[] = []
	/** Rows under the cards: { title, line, href?, badge? }. */
	rows: ResourceRow[] = []
	/** The rows' list name. */
	rowsLabel = 'More resources'
	/** 2 (resources) or 3 (use cases, from 1024). */
	columns: 2 | 3 = 2

	#cover(cover: ResourceCover, columns: 2 | 3) {
		if (cover.kind === 'code') return html`<span class="max-w-full overflow-hidden"><spyglass-code source=${cover.source} language=${cover.language ?? 'shell'}></spyglass-code></span>`
		const size = columns === 3 ? 'shrink-0 basis-20 lg:basis-16 xl:basis-20 min-[1440px]:basis-24' : 'shrink grow-0 basis-30'
		return html`<span class="flex w-full justify-center gap-3">${cover.items.map((c) => html`<span class=${['block aspect-4/5 min-w-0', size].join(' ')}><spyglass-creative-card ratio="fill" src=${ifDefined(c.src)} alt=${ifDefined(c.alt)} brand=${ifDefined(c.brand)} caption=${ifDefined(c.caption)} tone=${ifDefined(c.tone)}></spyglass-creative-card></span>`)}</span>`
	}

	render() {
		const columns = Number(this.columns) === 3 ? 3 : 2
		const cards = this.cards ?? []
		const rows = this.rows ?? []
		const out = (href: string) => (isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : { target: undefined, rel: undefined })
		return html`<div data-ds="resource-cards" class="flex flex-col gap-12 text-fg"><ul role="list" class=${['m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0 md:grid-cols-2', columns === 3 ? 'lg:grid-cols-3' : ''].join(' ')}>${cards.map((card) => html`<li><a href=${card.href} target=${ifDefined(out(card.href).target)} rel=${ifDefined(out(card.href).rel)} class="flex h-full flex-col rounded-panel bg-surface-raised p-2 transition-[background-color] duration-160 ease-out hover:bg-surface-hover focus-visible:-outline-offset-2"><span aria-hidden="true" class=${['grid h-60 place-items-center overflow-hidden rounded-container bg-surface p-6', columns === 2 ? 'lg:h-80' : ''].join(' ')}>${card.cover ? this.#cover(card.cover, columns) : nothing}</span><span class="flex flex-1 flex-col gap-2 p-4 md:pt-6"><h2 class="type-heading-3">${card.title}</h2><span class="type-body text-pretty text-fg-soft">${card.line}</span>${card.meta ? html`<span class="mt-auto pt-2 type-ui text-fg-muted">${card.meta}</span>` : nothing}</span></a></li>`)}</ul>${rows.length ? html`<ul role="list" aria-label=${this.rowsLabel} class="m-0 list-none border-t border-edge p-0">${rows.map((row) => {
			const body = html`<h2 class="col-start-1 row-start-1 type-body font-medium text-fg-soft transition-[color] duration-160 ease-out group-hover:text-fg">${row.title}</h2><span class="col-span-full row-start-2 type-body text-pretty text-fg-faint lg:col-span-1 lg:col-start-2 lg:row-start-1">${row.line}</span>${row.badge ? html`<span class="col-start-2 row-start-1 flex justify-self-end lg:col-start-3"><spyglass-badge variant="secondary">${row.badge}</spyglass-badge></span>` : nothing}`
			return html`<li>${row.href ? html`<a href=${row.href} target=${ifDefined(out(row.href).target)} rel=${ifDefined(out(row.href).rel)} class=${['group focus-visible:-outline-offset-2', ROW].join(' ')}>${body}</a>` : html`<div class=${ROW}>${body}</div>`}</li>`
		})}</ul>` : nothing}</div>`
	}
}

define('resource-cards', ResourceCards)
