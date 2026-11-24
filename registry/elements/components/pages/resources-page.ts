import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { resourcesContent, type ResourcesContent } from '@/lib/pages/resources'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/site/resource-cards'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// ResourcesPage.tsx as <spyglass-resources-page>: the header, the page head, the hub's cards and rows, the closing
// section and the footer. `content` (JSON) replaces the copy (lib/pages/resources.ts).

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The resources page.
 */
export class ResourcesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="resources-page"]'))
	static properties = { content: { type: Object } }
	/** The copy (lib/pages/resources.ts by default). */
	content: ResourcesContent = resourcesContent

	render() {
		const c = this.content ?? resourcesContent
		return html`<div data-ds="resources-page" class="isolate overflow-x-clip bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><div class=${CONTAINER}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div><main><spyglass-page-head head-id=${c.head.id} .lines=${c.head.lines} lead=${c.head.lead}></spyglass-page-head><section aria-label=${c.head.lines.join(' ')}><div class=${CONTAINER}><spyglass-resource-cards class="mb-(--ds-layout-section)" .cards=${c.cards} .rows=${c.rows} rows-label=${c.rowsLabel}></spyglass-resource-cards></div></section><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('resources-page', ResourcesPage)
