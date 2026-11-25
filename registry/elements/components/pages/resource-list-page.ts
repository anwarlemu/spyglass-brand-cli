import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { formatResourceDate, resourceListContent, type ResourceList, type ResourceListContent, resourceListSections, type ResourceListSection } from '@/lib/pages/resources'
import '@/elements/components/ui/button'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'
import { headerMenus, type HeaderMenus } from '@/lib/site-header'

// ResourceListPage.tsx as <spyglass-resource-list-page>: the header, the page head, the entries newest first as
// hairline rows (or the empty panel with a quiet way back), the closing section and the footer. `list` (JSON) sets the
// list; `content` (JSON) the rest of the copy (lib/pages/resources.ts).

/** A row's grid: date, title and line stacked; with a thumbnail, the picture in a 96px column (160 from 768) beside them. */
const resourceRowClass = (thumb: boolean) =>
	thumb
		? 'group grid grid-cols-[--spacing(24)_minmax(0,1fr)] items-start gap-x-5 gap-y-1 border-b border-edge py-6 focus-visible:-outline-offset-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8'
		: 'group grid gap-1 border-b border-edge py-6 focus-visible:-outline-offset-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8'
/** The thumbnail's cell: the first column, across the three lines. */
const RESOURCE_THUMB = 'col-start-1 row-span-3 row-start-1'

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary A list of posts or guides, or its empty state.
 */
export class ResourceListPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="resource-list-page"]'))
	static properties = { list: { type: Object }, content: { type: Object }, menus: { type: Object }, sections: { type: Array } }
	/** The list: { key, title, line, entries: { title, line, href, date, thumb? }[], empty }. */
	list?: ResourceList
	/** The copy (lib/pages/resources.ts by default). */
	content: ResourceListContent = resourceListContent
	/** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
	menus?: HeaderMenus
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: ResourceListSection[]

	render() {
		const c = this.content ?? resourceListContent
		const l = this.list ?? c.list
		const entries = [...l.entries].sort((a, b) => b.date.localeCompare(a.date))
		const body = entries.length
			? html`<ul role="list" class="m-0 list-none border-t border-edge p-0">${entries.map((e) => html`<li><a href=${e.href} class=${resourceRowClass(!!e.thumb)}>${e.thumb ? html`<spyglass-creative-card ratio="16/9" src=${ifDefined(e.thumb.src)} alt=${ifDefined(e.thumb.alt)} fit=${ifDefined(e.thumb.fit)} position=${ifDefined(e.thumb.position)} tone=${ifDefined(e.thumb.tone)} class=${RESOURCE_THUMB}></spyglass-creative-card>` : nothing}<time datetime=${e.date} class=${['type-ui text-fg-muted', e.thumb ? 'col-start-2' : ''].join(' ')}>${formatResourceDate(e.date)}</time><span class=${['type-body-lg text-fg', e.thumb ? 'col-start-2' : ''].join(' ')}>${e.title}</span><span class=${['type-body text-pretty text-fg-soft md:col-start-2', e.thumb ? 'col-start-2' : ''].join(' ')}>${e.line}</span></a></li>`)}</ul>`
			: html`<div class="flex min-h-80 flex-col items-center justify-center gap-6 rounded-panel bg-surface-subtle p-8 text-center text-fg-soft"><p class="type-body-lg">${l.empty}</p><spyglass-button href=${c.back.href} variant="secondary" class="max-md:w-full">${c.back.label}</spyglass-button></div>`
		const parts: Record<ResourceListSection, unknown> = {
			head: html`<spyglass-page-head head-id=${l.key} .lines=${[l.title]} lead=${l.line}></spyglass-page-head>`,
			list: html`<section aria-label=${l.title} class="pb-(--ds-layout-section)"><div class=${CONTAINER}>${body}</div></section>`,
			close: html`<spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close>`,
		}
		return html`<div data-ds="resource-list-page" class="isolate overflow-x-clip bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .menus=${this.menus ?? headerMenus} .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main>${pageSections(resourceListSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('resource-list-page', ResourceListPage)
