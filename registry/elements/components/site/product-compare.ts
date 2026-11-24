import { html, svg, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// ProductCompare.tsx as <spyglass-product-compare>: the site's product comparison, the head over a table of what the
// product does against two other ways (checks, crosses or a few words), the last column yours with the logomark; on
// phones each row is the label over its cells. `rows` as JSON: [{ label, cells: ["yes" | "no" | words] }].

export type CompareCell = string
export interface CompareRow { label: string; cells: CompareCell[] }

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The product comparison table: checks and words against two other ways, the last column yours.
 * @slot mark - Replaces the logomark beside the last column's name.
 */
export class ProductCompare extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-compare"]'))
	static properties = { headline: {}, lead: {}, columns: { type: Array }, rows: { type: Array }, yes: {}, no: {}, prefix: {} }
	headline = 'See the difference'
	lead = 'Ad libraries show what is live. Scrapers hand you raw pages. Spyglass keeps the whole record, ready to ask.'
	/** The column names; the last is yours and gets the mark. */
	columns: string[] = ['Ad libraries', 'Scrapers', 'Spyglass']
	rows: CompareRow[] = []
	yes = 'Yes'
	no = 'No'
	/** Prefix for the heading id (React's `id`). */
	prefix = 'product'

	private mark(value: string, ours: boolean) {
		if (value === 'yes' || value === 'no') {
			const on = value === 'yes'
			return html`<span class=${`inline-grid size-6 place-items-center ${on ? (ours ? 'text-fg' : 'text-fg-soft') : 'text-fg-muted'}`}><svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false">${svg`<path d=${on ? 'M3.5 8.5 6.5 11.5 12.5 4.5' : 'M4.5 4.5l7 7M11.5 4.5l-7 7'} fill="none" stroke="currentColor" stroke-width="1.5"></path>`}</svg><span class="sr-only">${on ? this.yes : this.no}</span></span>`
		}
		return html`<span class="type-caption text-balance text-fg-muted md:type-ui">${value}</span>`
	}

	render() {
		const columns = this.columns ?? []
		const rows = this.rows ?? []
		const last = columns.length - 1
		const heads = columns.map((c, i) => html`<th scope="col" class=${`w-22 pb-4 text-center align-top type-caption md:w-40 md:align-bottom md:type-ui ${i === last ? 'font-medium text-fg' : 'font-normal text-fg-muted'}`}>${i === last ? html`<span class="inline-flex items-center gap-2"><slot name="mark"><spyglass-logo variant="mark" height="12" aria-label="" class="flex-none"></spyglass-logo></slot>${c}</span>` : c}</th>`)
		const cells = (row: CompareRow, phone: boolean) => (row.cells ?? []).map((cell, i) => html`<td class=${`text-center ${phone ? 'pt-3 pb-4 align-top' : 'py-4 align-middle'}`}>${this.mark(cell, i === last)}</td>`)
		return html`<section data-ds="product-compare" aria-labelledby=${`${this.prefix}-compare-heading`} class="py-(--ds-layout-section) text-fg"><div class=${WRAP}><header class="mb-12 flex flex-col items-center text-center md:items-start md:text-left lg:mb-16"><h2 id=${`${this.prefix}-compare-heading`} class="type-section">${this.headline}</h2>${this.lead ? html`<p class="mt-6 max-w-(--ds-layout-measure) type-body-lg text-fg-soft">${this.lead}</p>` : nothing}</header><table class="hidden w-full table-fixed border-collapse md:table"><thead><tr><td></td>${heads}</tr></thead><tbody>${rows.map((row) => html`<tr class="border-t border-edge last:border-b"><th scope="row" class="py-5 pr-4 text-left type-body font-normal text-pretty text-fg">${row.label}</th>${cells(row, false)}</tr>`)}</tbody></table><table class="w-full table-fixed border-collapse md:hidden"><thead><tr>${heads}</tr></thead>${rows.map((row) => html`<tbody class="border-t border-edge last:border-b"><tr><th scope="rowgroup" colspan=${columns.length} class="pt-4 text-left type-ui font-normal text-pretty text-fg">${row.label}</th></tr><tr>${cells(row, true)}</tr></tbody>`)}</table></div></section>`
	}
}

define('product-compare', ProductCompare)
