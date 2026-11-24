import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { notFoundContent, type NotFoundContent } from '@/lib/pages/not-found'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// NotFoundPage.tsx as <spyglass-not-found-page>: the site's 404 page, the header, the page head (title, the plain
// sentence, the way home and the docs, the ASCII drift) and the footer. `content` replaces the copy.

/**
 * @summary The 404 page.
 */
export class NotFoundPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="not-found-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/not-found.ts by default). */
	content: NotFoundContent = notFoundContent

	render() {
		const c = this.content ?? notFoundContent
		return html`<div data-ds="not-found-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><div class="relative z-10 mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)"><spyglass-site-header .links=${c.shell.header.nav} .secondary=${c.shell.header.secondary}></spyglass-site-header></div><main id="main"><div class="-mb-6 md:-mb-5 lg:-mb-3"><spyglass-page-head head-id="not-found" .lines=${c.lines} .lead=${c.lead} .primary=${c.primary} .secondary=${c.secondary}></spyglass-page-head></div></main><spyglass-site-footer .columns=${c.shell.footer.columns} legal=${c.shell.footer.legal}></spyglass-site-footer></div>`
	}
}

define('not-found-page', NotFoundPage)
