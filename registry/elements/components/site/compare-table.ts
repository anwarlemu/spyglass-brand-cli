import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/segmented'
import styles from 'virtual:tw'

// CompareTable.tsx as <spyglass-compare-table>: the site's plan comparison, a table per group with its head sticking
// under the page header, values, White checks or nothing per plan, tips on the names (hover after 80ms, or focus), the
// Soon tag; on phones one plan at a time, picked in each head. `plans` ({ key, name }), `groups` ({ title, rows: [{
// label, tip, href, soon, cells }] }; a cell is true, '' or a value), `default-plan` and `labels` ({ soon, included,
// notIncluded, pick }).
export type CompareCell = true | '' | string
export interface CompareRow { label: string; tip?: string; href?: string; soon?: boolean; cells: CompareCell[] }
export interface CompareGroup { title: string; rows: CompareRow[] }
export interface ComparePlan { key: string; name: string }

const LABELS = { soon: 'Soon', included: 'Included', notIncluded: 'Not included', pick: 'Plan' }
const ROW = 'grid items-center gap-x-4 max-md:grid-cols-[minmax(0,1fr)_auto]! md:gap-x-6'
let uid = 0

/**
 * @summary The plan comparison table.
 */
export class CompareTable extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="compare-table"]'))
	static properties = { plans: { type: Array }, groups: { type: Array }, defaultPlan: { attribute: 'default-plan' }, labels: { type: Object }, pick: { state: true } }
	plans: ComparePlan[] = []
	groups: CompareGroup[] = []
	/** The plan shown first on phones (a plan's key). */
	defaultPlan?: string
	/** The words for assistive tech and the tag. */
	labels?: Partial<typeof LABELS>
	private pick?: string
	private tipBase = `ds-compare-${++uid}`

	private name(r: CompareRow, soon: string, tipId: string) {
		const tag = r.soon ? html`<span class="ds-compare-soon rounded-ds-sm bg-surface-subtle px-2 py-1 text-fg-soft">${soon}</span>` : nothing
		const term = 'ds-compare-link type-body text-fg'
		return html`<span class="inline-flex flex-wrap items-center gap-2">${r.tip ? html`<span class="ds-compare-term relative">${r.href ? html`<a class=${term} href=${r.href} aria-describedby=${tipId}>${r.label}</a>` : html`<button type="button" class=${`${term} cursor-default border-0 bg-transparent p-0 text-start`} aria-describedby=${tipId}>${r.label}</button>`}<span id=${tipId} role="tooltip" class="ds-compare-tip pointer-events-none absolute bottom-[calc(100%+var(--ds-space-sm))] left-0 w-max rounded-panel bg-surface-subtle px-4 py-3 type-ui text-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge)]">${r.tip}</span></span>` : html`<span class="type-body text-fg">${r.label}</span>`}${tag}</span>`
	}

	render() {
		const l = { ...LABELS, ...this.labels }
		const plans = this.plans ?? []
		const pick = this.pick ?? this.defaultPlan ?? plans[0]?.key
		const cols = `grid-template-columns: minmax(0, 2fr) repeat(${plans.length}, minmax(0, 1fr))`
		const options = plans.map((p) => ({ key: p.key, label: p.name }))
		return html`<div data-ds="compare-table" class="grid text-fg">${(this.groups ?? []).map((g, gi) => html`<table aria-label=${g.title} class="block border-collapse pb-16 last:pb-0 md:pb-24"><thead class="ds-compare-head sticky top-16 z-2 block py-4 md:pt-6 md:pb-12 lg:top-header"><tr class=${`${ROW} max-md:block`} style=${cols}><th scope="col" class="p-0 text-start type-heading-2 lg:type-figure">${g.title}</th>${plans.map((p) => html`<th scope="col" class="p-0 text-start type-heading-4 max-md:hidden">${p.name}</th>`)}</tr><tr class="mt-4 block md:hidden"><td class="block p-0" colspan=${plans.length + 1}><spyglass-segmented label=${l.pick} block .options=${options} value=${pick ?? ''} @change=${(e: Event) => { this.pick = (e.target as HTMLElement & { value: string }).value }}></spyglass-segmented></td></tr></thead><tbody class="block">${g.rows.map((r, ri) => html`<tr class=${`${ROW} border-edge py-4 not-first:border-t`} style=${cols}><th scope="row" class="min-w-0 p-0 text-start font-normal">${this.name(r, l.soon, `${this.tipBase}-${gi}-${ri}`)}</th>${r.cells.map((v, i) => html`<td class=${`p-0 text-start max-md:text-end ${plans[i]?.key === pick ? '' : 'max-md:hidden'}`}>${v === true ? html`<span class="inline-grid size-6 place-items-center rounded-full bg-fg align-middle text-(--ds-color-black)"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-4"><path d="M4 8.5 6.75 11.25 12 5.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg><span class="sr-only">${l.included}</span></span>` : v === '' ? html`<span class="sr-only">${l.notIncluded}</span>` : html`<span class="type-body text-fg-muted tabular-nums">${v}</span>`}</td>`)}</tr>`)}</tbody></table>`)}</div>`
	}
}

define('compare-table', CompareTable)
