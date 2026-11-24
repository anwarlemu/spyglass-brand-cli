import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import '@/elements/components/site/page-head'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/faq-block'
import '@/elements/components/site/compare-table'
import '@/elements/components/site/pricing-table'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'

// PricingPage.tsx as <spyglass-pricing-page>: the site's pricing page: the header, the centered page head, the plan
// cards with the billing switch, the compare table (from 768), the questions, the closing section and the footer. `content`
// replaces the copy (lib/pages/pricing.ts).
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

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
		return html`<div data-ds="pricing-page" class="bg-surface text-fg"><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main><spyglass-page-head head-id="pricing" .lines=${c.head.lines} lead=${c.head.lead} align="centre"></spyglass-page-head><section aria-label="Plans" class="pb-[calc(var(--ds-layout-section)-var(--ds-space-xs))] md:pb-(--ds-layout-section)"><div class=${WRAP}><spyglass-pricing-table .plans=${c.plans} .billing=${c.billing} .note=${c.note}></spyglass-pricing-table></div></section><section aria-label=${c.compare.label} class="py-(--ds-layout-section) max-md:hidden"><div class=${WRAP}><spyglass-compare-table .plans=${c.compare.plans} .groups=${c.compare.groups} default-plan=${c.compare.defaultPlan}></spyglass-compare-table></div></section><div class=${`${WRAP} py-(--ds-layout-section)`}><spyglass-faq-block heading=${c.faq.title} body=${c.faq.lead} .action=${c.faq.action} .items=${c.faq.items}></spyglass-faq-block></div><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('pricing-page', PricingPage)
