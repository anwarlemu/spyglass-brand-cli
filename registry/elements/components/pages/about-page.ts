import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { aboutContent, type AboutContent } from '@/lib/pages/about'
import '@/elements/components/ui/button'
import '@/elements/components/ui/card'
import '@/elements/components/site/creative-row'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/blocks/stat-block'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// AboutPage.tsx as <spyglass-about-page>: the deck's line under the light, a row of creatives, what the company keeps to, the numbers and a way in. `content` replaces the copy.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The about page template.
 */
export class AboutPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="about-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/about.ts by default). */
	content: AboutContent = aboutContent

	render() {
		const c = this.content ?? aboutContent
		return html`<div data-ds="about-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main>
<spyglass-hero-block eyebrow=${c.hero.eyebrow} headline=${c.hero.headline} body=${c.hero.body} placement="center" light="field"></spyglass-hero-block>
<div class=${`${WRAP} pb-24 max-sm:pb-16`}><spyglass-creative-row .items=${c.row}></spyglass-creative-row></div>
<section class=${`${WRAP} grid gap-10 py-24 max-sm:gap-8 max-sm:py-16`}><h2 class="type-heading-1 text-balance max-sm:type-heading-2">${c.beliefs.title}</h2><div class="grid grid-cols-3 gap-4 max-md:grid-cols-1">${c.beliefs.items.map((b) => html`<spyglass-card heading=${b.title} description=${b.body}></spyglass-card>`)}</div></section>
<div class=${`${WRAP} py-24 max-sm:py-16`}><spyglass-stat-block heading=${c.stats.title} .stats=${c.stats.items}></spyglass-stat-block></div>
<section class=${`${WRAP} flex flex-col items-start gap-6 py-24 max-sm:py-16`}><h2 class="type-heading-1 text-balance max-sm:type-heading-2">${c.join.title}</h2><p class="max-w-140 type-body-lg text-fg-soft">${c.join.body}</p><spyglass-button href=${c.join.cta.href} class="mt-2">${c.join.cta.label}</spyglass-button></section>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('about-page', AboutPage)
