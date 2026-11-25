import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { dashboardContent, type DashboardContent, dashboardSections, type DashboardSection } from '@/lib/pages/dashboard'
import { ifDefined } from 'lit/directives/if-defined.js'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'

// DashboardPage.tsx as <spyglass-dashboard-page>: the side rail, the title and button, four figures and the latest
// rows. `content` replaces the data.
const LINK = 'flex h-control-xs items-center rounded-control px-3 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out hover:bg-surface-raised hover:text-fg aria-[current=page]:bg-surface-raised aria-[current=page]:text-fg'

/**
 * @summary A product dashboard: a rail, figures and a table.
 */
export class DashboardPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="dashboard-page"]'))
	static properties = { content: { type: Object }, sections: { type: Array } }
	/** The data (lib/pages/dashboard.ts by default). */
	content: DashboardContent = dashboardContent
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: DashboardSection[]

	render() {
		const c = this.content ?? dashboardContent
		const parts: Record<DashboardSection, unknown> = {
			head: html`<div class="flex flex-wrap items-center justify-between gap-4"><h1 class="type-heading-2">${c.title}</h1><spyglass-button href=${c.action.href}>${c.action.label}</spyglass-button></div>`,
			stats: html`<ul role="list" class="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">${c.stats.map((s) => html`<li class="grid gap-2 rounded-container bg-surface-raised p-6"><span class="type-figure">${s.value}</span><span class="type-ui text-fg-muted">${s.label}</span></li>`)}</ul>`,
			table: html`<section class="grid gap-4 rounded-container bg-surface-raised p-6"><h2 class="type-heading-3">${c.tableTitle}</h2><div class="overflow-x-auto fade-x"><table class="w-full border-collapse type-ui"><thead><tr>${c.columns.map((col, i) => html`<th class=${i === 0 ? 'border-b border-edge-surface py-2.5 type-label font-medium text-fg-muted text-left' : 'border-b border-edge-surface py-2.5 type-label font-medium text-fg-muted text-right'}>${col}</th>`)}</tr></thead><tbody>${c.rows.map((r) => html`<tr>${r.map((cell, i) => html`<td class=${i === 0 ? 'border-b border-edge-surface py-3 text-left text-fg' : 'border-b border-edge-surface py-3 text-right tabular-nums text-fg-soft'}>${cell}</td>`)}</tr>`)}</tbody></table></div></section>`,
		}
		return html`<div data-ds="dashboard-page" class="grid min-h-dvh grid-cols-[minmax(0,1fr)] bg-surface text-fg lg:grid-cols-[256px_minmax(0,1fr)]"><aside class="flex min-w-0 flex-col gap-6 border-b border-edge bg-surface-subtle p-4 lg:border-r lg:border-b-0"><a href="/" aria-label="Home" class="self-start rounded-control px-2 py-2"><spyglass-logo height="20"></spyglass-logo></a><nav aria-label="Sections"><ul role="list" class="m-0 flex list-none gap-1 overflow-x-auto p-0 fade-x lg:flex-col">${c.nav.map((n) => html`<li class="shrink-0"><a href=${n.href} aria-current=${ifDefined(n.current ? 'page' : undefined)} class=${LINK}>${n.label}</a></li>`)}</ul></nav></aside><main class="grid min-w-0 content-start gap-8 p-6 lg:p-10">${pageSections(dashboardSections, this.sections).map((k) => parts[k])}</main></div>`
	}
}

define('dashboard-page', DashboardPage)
