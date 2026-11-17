import { html, nothing } from 'lit'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import '@/elements/components/ui/dropdown-menu'
import '@/elements/components/ui/menu-item'
import styles from 'virtual:tw'

// DataTable.tsx as <spyglass-data-table>: a table people filter, sort and page through. Over it, a dropdown per filter
// (radio rows, the trigger saying what is picked) and a way to clear them; heads in DM Sans Medium capitals, muted,
// that sort when they can (aria-sort; the arrow shows the order, a faint pair where it could); 40px rows on hairlines
// that take the #171717 fill under the pointer; numbers right-aligned in tabular figures; the whole in a hairline box
// with the 8px corner that scrolls sideways on its own. Under it, where the page is and Previous and Next. Filters and
// sort go back to the first page. Cells render the value (numbers in en-US), or what `cells[key]({ row, value })`
// returns (a node or text: React's `cell`). Nothing matching shows one line with a way to clear the filters, or the
// `empty` slot. `columns`, `rows` and `filters` are JSON attributes or properties.

export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, muted?: boolean }
export type DataFilter = { key: string, label: string, options: string[], any?: string }
export type DataRow = Record<string, unknown>
export type DataCell = (slot: { row: DataRow, value: unknown }) => unknown

const display = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : String(v ?? ''))
const FILTER = 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 rounded-control border border-edge-strong bg-surface px-3 type-ui text-fg transition-[border-color] duration-150 ease-standard hover:border-action-secondary-edge-hover aria-expanded:border-edge-focus max-md:h-control-touch'
const SORT = '-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-ds-sm px-1 uppercase transition-[color] duration-150 ease-standard hover:text-fg'

/**
 * @summary A table people filter, sort and page through.
 * @slot empty - In place of the line shown when nothing matches the filters.
 */
export class DataTable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		columns: { type: Array },
		rows: { type: Array },
		rowKey: { attribute: 'row-key' },
		label: {},
		filters: { type: Array },
		pageSize: { type: Number, attribute: 'page-size' },
		cells: { attribute: false },
		picked: { state: true },
		sort: { state: true },
		page: { state: true },
	}

	/** The columns: key, label, align, sortable, muted. */
	columns: DataColumn[] = []
	rows: DataRow[] = []
	/** The field that tells rows apart. */
	rowKey = 'id'
	/** The table's name for assistive tech. */
	label = ''
	/** A dropdown per filter: key, label, options, and what "any" reads as. */
	filters: DataFilter[] = []
	/** Rows per page. */
	pageSize = 5
	/** How a column's cells render, by key (a property): table.cells = { spend: ({ value }) => text }. */
	cells: Partial<Record<string, DataCell>> = {}
	private picked: Record<string, string> = {}
	private sort: { key: string, dir: 'ascending' | 'descending' } | null = null
	private page = 0

	private get sorted() {
		const filtered = (this.rows ?? []).filter((r) => (this.filters ?? []).every((f) => !this.picked[f.key] || String(r[f.key]) === this.picked[f.key]))
		const s = this.sort
		if (!s) return filtered
		const sign = s.dir === 'ascending' ? 1 : -1
		return [...filtered].sort((a, b) => {
			const x = a[s.key]
			const y = b[s.key]
			return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))
		})
	}
	private pick(next: Record<string, string>) {
		this.picked = next
		this.page = 0
	}
	private toggleSort(key: string) {
		const s = this.sort
		this.sort = s?.key !== key ? { key, dir: 'ascending' } : s.dir === 'ascending' ? { key, dir: 'descending' } : null
		this.page = 0
	}

	render() {
		const filters = this.filters ?? []
		const columns = this.columns ?? []
		const sorted = this.sorted
		const size = this.pageSize
		const pages = Math.max(1, Math.ceil(sorted.length / size))
		const at = Math.min(this.page, pages - 1)
		const visible = sorted.slice(at * size, at * size + size)
		const anyOn = Object.values(this.picked).some(Boolean)
		const sort = this.sort
		const arrow = (c: DataColumn) => sort?.key === c.key && sort.dir === 'ascending'
			? icon(ArrowUp, 'arrow-up', { size: 14, strokeWidth: 1.5, class: 'text-fg', attrs: { 'aria-hidden': 'true' } })
			: sort?.key === c.key
				? icon(ArrowDown, 'arrow-down', { size: 14, strokeWidth: 1.5, class: 'text-fg', attrs: { 'aria-hidden': 'true' } })
				: icon(ArrowUpDown, 'arrow-up-down', { size: 14, strokeWidth: 1.5, class: 'text-fg-faint', attrs: { 'aria-hidden': 'true' } })
		const filterBar = filters.length
			? html`<div class="flex flex-wrap items-center gap-2">${filters.map((f) => {
				const any = f.any ?? 'Any'
				const now = this.picked[f.key] ?? ''
				return html`<spyglass-dropdown-menu label=${f.label} width="200px"><button slot="trigger" type="button" class=${FILTER}><span>${`${f.label}: ${now || any}`}</span>${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: 'text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>${['', ...f.options].map((o) => html`<spyglass-menu-item role="menuitemradio" aria-checked=${String(now === o)} @select=${() => this.pick({ ...this.picked, [f.key]: o })}><span class="min-w-0 flex-1 truncate">${o || any}</span>${now === o ? icon(Check, 'check', { size: 16, strokeWidth: 1.5, class: 'shrink-0', attrs: { 'aria-hidden': 'true' } }) : nothing}</spyglass-menu-item>`)}</spyglass-dropdown-menu>`
			})}${anyOn ? html`<spyglass-button variant="ghost" size="sm" @click=${() => this.pick({})}>Clear filters</spyglass-button>` : nothing}</div>`
			: nothing
		return html`<div data-ds="data-table" class="flex min-w-0 flex-col gap-3">${filterBar}<div class="overflow-x-auto rounded-container border border-edge" role="region" aria-label=${this.label} tabindex="0"><table class="w-full border-collapse type-ui">
			<thead><tr>${columns.map((c) => html`<th scope="col" class=${['h-10 border-b border-edge px-3 type-label whitespace-nowrap text-fg-muted', c.align === 'right' ? 'text-right' : 'text-left'].join(' ')} aria-sort=${ifDefined(sort?.key === c.key ? sort.dir : c.sortable ? 'none' : undefined)}>${c.sortable ? html`<button type="button" class=${[SORT, c.align === 'right' ? 'flex-row-reverse' : ''].filter(Boolean).join(' ')} @click=${() => this.toggleSort(c.key)}>${c.label}${arrow(c)}</button>` : c.label}</th>`)}</tr></thead>
			<tbody>${repeat(visible, (r) => String(r[this.rowKey]), (r) => html`<tr class="transition-[background-color] duration-150 ease-standard hover:bg-surface-raised">${columns.map((c) => html`<td class=${['h-row border-b border-edge px-3 py-1 [tr:last-child>&]:border-b-0', c.align === 'right' ? 'text-right tabular-nums' : '', c.muted ? 'whitespace-nowrap text-fg-muted' : ''].filter(Boolean).join(' ')}>${this.cells?.[c.key] ? this.cells[c.key]!({ row: r, value: r[c.key] }) : display(r[c.key])}</td>`)}</tr>`)}${!visible.length ? html`<tr><td colspan=${columns.length} class="px-3 py-6 text-center text-fg-muted"><slot name="empty">Nothing matches these filters. <button type="button" class="cursor-pointer font-medium text-fg underline-offset-4 hover:underline" @click=${() => this.pick({})}>Clear filters</button></slot></td></tr>` : nothing}</tbody>
		</table></div>${sorted.length > size ? html`<div class="flex items-center justify-between gap-3"><span class="type-caption text-fg-muted tabular-nums" aria-live="polite">${`${at * size + 1} to ${at * size + visible.length} of ${sorted.length}`}</span><div class="flex gap-2"><spyglass-button variant="secondary" size="sm" ?disabled=${at === 0} @click=${() => { this.page = at - 1 }}>Previous</spyglass-button><spyglass-button variant="secondary" size="sm" ?disabled=${at >= pages - 1} @click=${() => { this.page = at + 1 }}>Next</spyglass-button></div></div>` : nothing}</div>`
	}
}

define('data-table', DataTable)
