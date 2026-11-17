import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Pagination.tsx as <spyglass-pagination>: Previous and Next around the page numbers, 32px ghost buttons that fill
// under the pointer, the current page in a #363636 hairline box in White. First and last always show, `siblings`
// either side of the current page, an ellipsis for the rest. On phones Previous and Next keep only their chevrons.
// `page` (from 1) with `page-change` (detail.value).

/** The pages to draw: numbers, and 'gap' where an ellipsis stands for the rest. */
export function pageRange(page: number, pages: number, siblings = 1): (number | 'gap')[] {
	const out: (number | 'gap')[] = []
	const from = Math.max(2, page - siblings)
	const to = Math.min(pages - 1, page + siblings)
	out.push(1)
	if (from > 2) out.push(from === 3 ? 2 : 'gap')
	for (let p = from; p <= to; p++) out.push(p)
	if (to < pages - 1) out.push(to === pages - 2 ? pages - 1 : 'gap')
	if (pages > 1) out.push(pages)
	return out
}

const BASE = 'inline-flex h-control-sm min-w-control-sm cursor-pointer items-center justify-center gap-1.5 rounded-control px-2 type-ui whitespace-nowrap select-none transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100 disabled:cursor-not-allowed disabled:text-fg-faint'
const IDLE = 'text-fg-muted hover:not-disabled:bg-action-ghost-hover hover:not-disabled:text-fg'
const CURRENT = 'border border-edge-strong text-fg'

/**
 * @summary Previous and next around the page numbers.
 * @fires page-change - The page changed (detail.value; read `page`).
 */
export class Pagination extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('nav'))
	static properties = { page: { type: Number, reflect: true }, pages: { type: Number }, siblings: { type: Number }, label: {} }

	/** The page shown, from 1. */
	page = 1
	/** How many pages. */
	pages = 1
	/** Pages shown either side of the current one. */
	siblings = 1
	/** The nav's name for assistive tech. */
	label = 'Pages'

	private go(p: number) {
		this.commit(Math.min(this.pages, Math.max(1, p)), 'page')
	}

	render() {
		const page = this.page
		return html`<nav data-ds="pagination" aria-label=${this.label} class="flex justify-center"><ul class="flex items-center gap-1">
			<li><button type="button" class=${`${BASE} ${IDLE}`} aria-label="Go to previous page" ?disabled=${page <= 1} @click=${() => this.go(page - 1)}>${icon(ChevronLeft, 'chevron-left', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}<span class="max-sm:hidden">Previous</span></button></li>
			${pageRange(page, this.pages, this.siblings).map((p) => html`<li>${p === 'gap'
				? html`<span class="flex size-control-sm items-center justify-center text-fg-muted" aria-hidden="true">${icon(Ellipsis, 'ellipsis', { size: 16, strokeWidth: 1.5 })}</span>`
				: html`<button type="button" class=${`${BASE} ${p === page ? CURRENT : IDLE}`} aria-current=${ifDefined(p === page ? 'page' : undefined)} aria-label=${`Page ${p}`} @click=${() => this.go(p)}>${p}</button>`}</li>`)}
			<li><button type="button" class=${`${BASE} ${IDLE}`} aria-label="Go to next page" ?disabled=${page >= this.pages} @click=${() => this.go(page + 1)}><span class="max-sm:hidden">Next</span>${icon(ChevronRight, 'chevron-right', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button></li>
		</ul></nav>`
	}
}

define('pagination', Pagination)
