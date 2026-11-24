import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { useCasesContent, type UseCasesContent } from '@/lib/pages/use-cases'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/site/resource-cards'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// UseCasesPage.tsx as <spyglass-use-cases-page>: the header, the page head, the use cases as linked cards (three across
// from 1024), the closing section with the connect menu, then the footer. `content` replaces the copy.
const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The use-cases hub page.
 */
export class UseCasesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="use-cases-page"]'))
	static properties = { content: { type: Object } }
	/** The copy as JSON (lib/pages/use-cases.ts by default). */
	content: UseCasesContent = useCasesContent

	render() {
		const c = this.content ?? useCasesContent
		return html`<div data-ds="use-cases-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><div class=${`${CONTAINER} relative z-10`}><spyglass-site-header .links=${c.chrome.header.nav} .secondary=${c.chrome.header.secondary} .cta=${c.chrome.header.cta}></spyglass-site-header></div><main id="main"><spyglass-page-head head-id=${c.id} .lines=${c.head.lines} .lead=${c.head.lead}></spyglass-page-head><section aria-label=${c.head.lines.join(' ')}><div class=${`${CONTAINER} pb-(--ds-layout-section)`}><spyglass-resource-cards .cards=${c.cards} columns="3"></spyglass-resource-cards></div></section><spyglass-page-close></spyglass-page-close></main><spyglass-site-footer .columns=${c.chrome.footer.columns} legal=${c.chrome.footer.legal}></spyglass-site-footer></div>`
	}
}

define('use-cases-page', UseCasesPage)
