import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { homeContent, type HomeContent } from '@/lib/pages/home'
import '@/elements/components/ui/button'
import '@/elements/components/ui/card'
import '@/elements/components/product/search-bar'
import '@/elements/components/site/creative-corridor'
import '@/elements/components/site/creative-grid'
import '@/elements/components/site/creative-ring'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import '@/elements/components/site/testimonial'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/blocks/offer-block'
import '@/elements/components/blocks/stat-block'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// HomePage.tsx as <spyglass-home-page>: the home page template from the library's elements. `content` (an object, as
// lib/pages/home.ts) replaces the copy.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The home page template.
 */
export class HomePage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="home-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/home.ts by default). */
	content: HomeContent = homeContent

	render() {
		const c = this.content ?? homeContent
		return html`<div data-ds="home-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.nav} .secondary=${c.secondary} .cta=${c.cta}></spyglass-site-header></div>
<main>
<spyglass-hero-block headline=${c.hero.headline} body=${c.hero.body} light="band" seed="2" texture><spyglass-button slot="actions" href=${c.hero.action.href}>${c.hero.action.label}</spyglass-button><spyglass-search-bar placeholder=${c.hero.search} aria-label="Search creatives"></spyglass-search-bar></spyglass-hero-block>
<section aria-label="Results" class=${`${WRAP} pt-12 pb-24 max-sm:pt-8 max-sm:pb-16`}><spyglass-creative-grid .items=${c.results} ratio="3/4" gap="md"></spyglass-creative-grid></section>
<section class=${`${WRAP} flex flex-col items-center gap-12 py-24 text-center max-sm:gap-8 max-sm:py-16`}><h2 class="max-w-3xl type-heading-1 text-balance max-sm:type-heading-2">${c.index.headline}</h2><spyglass-creative-corridor .items=${c.index.corridor} class="max-w-page"></spyglass-creative-corridor><p class="max-w-120 type-body-lg text-fg-soft">${c.index.body}</p></section>
<section aria-label="What it does" class=${`${WRAP} grid grid-cols-3 gap-4 py-24 max-md:grid-cols-1 max-sm:py-16`}>${c.features.map((f) => html`<spyglass-card heading=${f.title} description=${f.body}></spyglass-card>`)}</section>
<div class=${`${WRAP} py-24 max-sm:py-16`}><spyglass-stat-block heading=${c.stats.title} .stats=${c.stats.items}></spyglass-stat-block></div>
<section class=${`${WRAP} grid grid-cols-2 items-center gap-12 py-24 max-md:grid-cols-1 max-sm:py-16`}><h2 class="max-w-xl type-heading-1 text-balance max-sm:type-heading-2">${c.agents.headline}</h2><spyglass-creative-ring .items=${c.agents.ring} class="w-full"><spyglass-logo height="20"></spyglass-logo></spyglass-creative-ring></section>
<div class=${`${WRAP} py-24 max-sm:py-16`}><spyglass-testimonial layout="side" quote=${c.testimonial.quote} name=${c.testimonial.name} position=${c.testimonial.position}></spyglass-testimonial></div>
<spyglass-offer-block headline=${c.offer.headline} note=${c.offer.note} .cta=${c.offer.cta}></spyglass-offer-block>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('home-page', HomePage)
