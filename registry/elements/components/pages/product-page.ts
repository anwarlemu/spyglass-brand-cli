import { html, nothing, type TemplateResult } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { productContent, type ProductContent } from '@/lib/pages/product'
import '@/elements/components/ui/button'
import '@/elements/components/ui/card'
import '@/elements/components/product/search-bar'
import '@/elements/components/site/creative-grid'
import '@/elements/components/site/creative-ring'
import '@/elements/components/site/creative-row'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/blocks/offer-block'
import '@/elements/components/blocks/stat-block'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// ProductPage.tsx as <spyglass-product-page>: the deck cover's hero, one section per thing the product does (copy and
// picture side by side, alternating) and the offer. `content` replaces the copy.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

const split = (headline: string, body: string | undefined, reverse: boolean, media: TemplateResult) =>
	html`<section class=${`${WRAP} grid grid-cols-2 items-center gap-12 py-24 max-md:grid-cols-1 max-sm:gap-8 max-sm:py-16`}><div class=${reverse ? 'grid gap-6 md:order-last' : 'grid gap-6'}><h2 class="type-heading-1 text-balance max-sm:type-heading-2">${headline}</h2>${body ? html`<p class="type-body-lg text-fg-soft">${body}</p>` : nothing}</div><div class="min-w-0">${media}</div></section>`

/**
 * @summary The product page template.
 */
export class ProductPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/product.ts by default). */
	content: ProductContent = productContent

	render() {
		const c = this.content ?? productContent
		return html`<div data-ds="product-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main>
<spyglass-hero-block headline=${c.hero.headline} body=${c.hero.body} placement="right" light="strip" texture><spyglass-button slot="actions" href=${c.hero.action.href}>${c.hero.action.label}</spyglass-button><spyglass-creative-row .items=${c.hero.row} variant="peak" class="mt-32 max-sm:mt-16"></spyglass-creative-row></spyglass-hero-block>
${split(c.search.headline, c.search.body, false, html`<div class="grid gap-4"><spyglass-search-bar placeholder=${c.search.prompt} aria-label="Search creatives"></spyglass-search-bar><spyglass-creative-grid .items=${c.search.results} ratio="3/4"></spyglass-creative-grid></div>`)}
${split(c.brief.headline, c.brief.body, true, html`<spyglass-card heading=${c.brief.card.title}><ul class="flex flex-col gap-2 type-ui text-fg">${c.brief.card.lines.map((l) => html`<li>${l}</li>`)}</ul></spyglass-card>`)}
${split(c.category.headline, c.category.body, false, html`<spyglass-stat-block .stats=${c.category.stats} variant="card"></spyglass-stat-block>`)}
${split(c.add.headline, undefined, true, html`<spyglass-creative-grid .items=${c.add.grid}></spyglass-creative-grid>`)}
${split(c.agents.headline, undefined, false, html`<spyglass-creative-ring .items=${c.agents.ring} class="w-full"><spyglass-logo height="20"></spyglass-logo></spyglass-creative-ring>`)}
<spyglass-offer-block headline=${c.offer.headline} note=${c.offer.note} .cta=${c.offer.cta}></spyglass-offer-block>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('product-page', ProductPage)
