import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { notFoundContent, type NotFoundContent } from '@/lib/pages/not-found'
import '@/elements/components/ui/button'
import '@/elements/components/product/search-bar'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// NotFoundPage.tsx as <spyglass-not-found-page>: the light from the corners, the plain sentence, the search bar and the way home, filling the window. `content` replaces the copy; the search bar's `search` event carries the query.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The 404 page template.
 */
export class NotFoundPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="not-found-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/not-found.ts by default). */
	content: NotFoundContent = notFoundContent

	render() {
		const c = this.content ?? notFoundContent
		return html`<div data-ds="not-found-page" class="flex min-h-dvh flex-col bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main class="flex flex-1 flex-col">
<spyglass-hero-block eyebrow=${c.eyebrow} headline=${c.headline} body=${c.body} placement="center" light="corner" class="flex-1"><spyglass-button slot="actions" href=${c.home.href} variant="secondary">${c.home.label}</spyglass-button><spyglass-search-bar placeholder=${c.search} aria-label="Search" class="mx-auto max-w-160"></spyglass-search-bar></spyglass-hero-block>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('not-found-page', NotFoundPage)
