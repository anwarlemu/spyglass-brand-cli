import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import '@/elements/components/site/plan-card'
import '@/elements/components/blocks/offer-block'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// PricingPage.tsx as <spyglass-pricing-page>: the Creator plan ad as the top and the questions. `content` replaces the copy.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The pricing page template.
 */
export class PricingPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/pricing.ts by default). */
	content: PricingContent = pricingContent

	render() {
		const c = this.content ?? pricingContent
		return html`<div data-ds="pricing-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main>
<spyglass-offer-block headline=${c.offer.headline} light="field" seed="0"><div class="flex w-full flex-wrap justify-center gap-4">${c.plans.map((p) => html`<spyglass-plan-card heading=${p.title} price=${p.price} .features=${p.features} cta=${p.cta} href=${p.href} class="w-150 max-w-full text-left"></spyglass-plan-card>`)}</div></spyglass-offer-block>
<section class=${`${WRAP} grid grid-cols-3 gap-12 py-24 max-md:grid-cols-1 max-md:gap-8 max-sm:py-16`}><h2 class="type-heading-1 max-sm:type-heading-2">${c.faq.title}</h2><dl class="col-span-2 m-0 grid max-md:col-span-1">${c.faq.items.map((i) => html`<div class="grid gap-2 border-t border-edge py-6"><dt class="type-heading-4">${i.q}</dt><dd class="m-0 type-body text-fg-soft">${i.a}</dd></div>`)}</dl></section>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('pricing-page', PricingPage)
