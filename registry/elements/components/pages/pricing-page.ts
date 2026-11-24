import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import '@/elements/components/ui/accordion'
import '@/elements/components/ui/accordion-item'
import '@/elements/components/ui/button'
import '@/elements/components/site/compare-table'
import '@/elements/components/site/pricing-table'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'

// PricingPage.tsx as <spyglass-pricing-page>: the site's pricing page: the centered head, the plan cards with the
// billing switch, the compare table (from 768), the questions beside their sticky head and the footer. `content`
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
		return html`<div data-ds="pricing-page" class="bg-surface text-fg"><div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div><main><header class=${`${WRAP} flex flex-col items-center gap-6 pt-16 pb-12 text-center md:pt-24 md:pb-16`}><h1 class="m-0 type-section">${c.head.lines.map((l, i) => html`<span class="block">${l}${i < c.head.lines.length - 1 ? ' ' : ''}</span>`)}</h1><p class="m-0 max-w-(--ds-layout-measure) type-body-lg text-fg-soft">${c.head.lead}</p></header><section aria-label="Plans" class="pb-(--ds-layout-section)"><div class=${WRAP}><spyglass-pricing-table .plans=${c.plans} .billing=${c.billing} .note=${c.note}></spyglass-pricing-table></div></section><section aria-label=${c.compare.label} class="py-(--ds-layout-section) max-md:hidden"><div class=${WRAP}><spyglass-compare-table .plans=${c.compare.plans} .groups=${c.compare.groups} default-plan=${c.compare.defaultPlan}></spyglass-compare-table></div></section><section aria-labelledby="pricing-faq-heading" class="py-(--ds-layout-section)"><div class=${`${WRAP} grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16`}><div class="flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]"><h2 id="pricing-faq-heading" class="m-0 type-section">${c.faq.title}</h2><p class="m-0 type-body-lg text-fg-soft">${c.faq.lead}</p><spyglass-button href=${c.faq.action.href} variant="secondary" class="mt-4">${c.faq.action.label}</spyglass-button></div><div class="min-w-0"><spyglass-accordion value="faq-0">${c.faq.items.map((f, i) => html`<spyglass-accordion-item value=${`faq-${i}`} heading=${f.q}>${f.a}</spyglass-accordion-item>`)}</spyglass-accordion></div></div></section></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('pricing-page', PricingPage)
