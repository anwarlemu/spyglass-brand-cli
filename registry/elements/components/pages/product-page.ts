import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { productContent, type ProductContent, type ProductPageContent, productSections, type ProductSection } from '@/lib/pages/product'
import '@/elements/components/site/page-close'
import '@/elements/components/site/product-compare'
import '@/elements/components/site/product-features'
import '@/elements/components/site/product-hero'
import '@/elements/components/site/product-pricing'
import '@/elements/components/site/product-visual'
import '@/elements/components/site/proof-block'
import '@/elements/components/site/site-header'
import '@/elements/components/visuals/ascii-trail'
import '@/elements/components/blocks/faq-block'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'
import { headerMenus, type HeaderMenus } from '@/lib/site-header'

// ProductPage.tsx as <spyglass-product-page>: the site's product page, one template for every product: the header, the
// product hero, the proof row, the feature rows with their product visuals, the comparison where there is one, the
// pricing receipt, the questions, the closing section and the footer. `product` (JSON) is the product's copy
// (lib/pages/product.ts), `content` the page's chrome; `live` draws the hero's light live over its still.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The product page template.
 */
export class ProductPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-page"]'))
	static properties = { product: { type: Object }, content: { type: Object }, live: { type: Boolean }, menus: { type: Object }, sections: { type: Array } }
	/** The product's copy (Creator search by default). */
	product?: ProductPageContent
	/** The page's chrome (lib/pages/product.ts by default). */
	content: ProductContent = productContent
	/** Draw the hero's light live in WebGL over its still, as the site does. */
	live = false
	/** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
	menus?: HeaderMenus
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: ProductSection[]

	render() {
		const c = this.content ?? productContent
		const p = this.product ?? c.product
		const parts: Record<ProductSection, unknown> = {
			hero: html`<spyglass-product-hero prefix=${p.slug} name=${p.name} line=${p.line} .primary=${c.primary} .secondary=${{ label: c.docsLabel, href: p.docs }} .sets=${p.hero.sets} ?unlit=${p.hero.lit === false} ?live=${this.live}></spyglass-product-hero>`,
			proof: html`<spyglass-proof-block head-id=${`${p.slug}-proof`} heading=${c.proof}></spyglass-proof-block>`,
			features: html`<spyglass-product-features prefix=${p.slug} .features=${p.features.map((f) => ({ headline: f.headline, text: f.text, link: f.link }))}>${p.features.map((f, i) => html`<spyglass-product-visual slot=${`visual-${i + 1}`} kind=${f.visual} .data=${f.data} texture="none"></spyglass-product-visual>`)}</spyglass-product-features>`,
			compare: html`${p.compare?.length ? html`<spyglass-product-compare prefix=${p.slug} .rows=${p.compare}></spyglass-product-compare>` : nothing}`,
			pricing: html`<spyglass-product-pricing prefix=${p.slug} value=${p.pricing.value} unit=${p.pricing.unit} product=${p.name} .rows=${p.pricing.rows} .free=${p.pricing.free} tally=${p.pricing.tally} note=${c.pricing.note} .primary=${c.primary} .secondary=${c.pricing.secondary}></spyglass-product-pricing>`,
			faq: html`<div class=${`${WRAP} py-(--ds-layout-section)`}><spyglass-faq-block head-id=${`${p.slug}-faq`} heading=${c.faq.title} body=${c.faq.lead} .action=${{ label: c.docsLabel, href: p.docs }} .items=${p.faq}></spyglass-faq-block></div>`,
			close: html`<spyglass-page-close close-id=${`${p.slug}-close`} .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close>`,
		}
		return html`<div data-ds="product-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .menus=${this.menus ?? headerMenus} .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main id="main">${pageSections(productSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('product-page', ProductPage)
