import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { notFoundContent, type NotFoundContent, notFoundSections, type NotFoundSection } from '@/lib/pages/not-found'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'
import { headerMenus, type HeaderMenus } from '@/lib/site-header'

// NotFoundPage.tsx as <spyglass-not-found-page>: the site's 404 page, the header, the page head (title, the plain
// sentence, the way home and the docs, the ASCII drift) and the footer. `content` replaces the copy.

/**
 * @summary The 404 page.
 */
export class NotFoundPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="not-found-page"]'))
	static properties = { content: { type: Object }, menus: { type: Object }, sections: { type: Array } }
	/** The page's copy (lib/pages/not-found.ts by default). */
	content: NotFoundContent = notFoundContent
	/** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
	menus?: HeaderMenus
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: NotFoundSection[]

	render() {
		const c = this.content ?? notFoundContent
		const parts: Record<NotFoundSection, unknown> = {
			head: html`<div class="-mb-6 md:-mb-5 lg:-mb-3"><spyglass-page-head head-id="not-found" .lines=${c.lines} .lead=${c.lead} .primary=${c.primary} .secondary=${c.secondary}></spyglass-page-head></div>`,
		}
		return html`<div data-ds="not-found-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .menus=${this.menus ?? headerMenus} .links=${c.shell.header.nav} .secondary=${c.shell.header.secondary}></spyglass-site-header><main id="main">${pageSections(notFoundSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.shell.footer.columns} legal=${c.shell.footer.legal}></spyglass-site-footer></div>`
	}
}

define('not-found-page', NotFoundPage)
