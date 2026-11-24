import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { formatResourceDate, resourceListContent, type ResourceList, type ResourceListContent } from '@/lib/pages/resources'
import '@/elements/components/ui/button'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// ResourceListPage.tsx as <spyglass-resource-list-page>: the header, the page head, the entries newest first as
// hairline rows (or the empty panel with a quiet way back), the closing section and the footer. `list` (JSON) sets the
// list; `content` (JSON) the rest of the copy (lib/pages/resources.ts).

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary A list of posts or guides, or its empty state.
 */
export class ResourceListPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="resource-list-page"]'))
	static properties = { list: { type: Object }, content: { type: Object } }
	/** The list: { key, title, line, entries: { title, line, href, date }[], empty }. */
	list?: ResourceList
	/** The copy (lib/pages/resources.ts by default). */
	content: ResourceListContent = resourceListContent

	render() {
		const c = this.content ?? resourceListContent
		const l = this.list ?? c.list
		const entries = [...l.entries].sort((a, b) => b.date.localeCompare(a.date))
		const body = entries.length
			? html`<ul role="list" class="m-0 list-none border-t border-edge p-0">${entries.map((e) => html`<li><a href=${e.href} class="group grid gap-1 border-b border-edge py-6 focus-visible:-outline-offset-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8"><time datetime=${e.date} class="type-ui text-fg-muted">${formatResourceDate(e.date)}</time><span class="type-body-lg text-fg">${e.title}</span><span class="type-body text-pretty text-fg-soft md:col-start-2">${e.line}</span></a></li>`)}</ul>`
			: html`<div class="flex min-h-80 flex-col items-center justify-center gap-6 rounded-panel bg-surface-subtle p-8 text-center text-fg-soft"><p class="type-body-lg">${l.empty}</p><spyglass-button href=${c.back.href} variant="secondary">${c.back.label}</spyglass-button></div>`
		return html`<div data-ds="resource-list-page" class="isolate overflow-x-clip bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><div class=${CONTAINER}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div><main><spyglass-page-head head-id=${l.key} .lines=${[l.title]} lead=${l.line}></spyglass-page-head><section aria-label=${l.title} class="pb-(--ds-layout-section)"><div class=${CONTAINER}>${body}</div></section><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('resource-list-page', ResourceListPage)
