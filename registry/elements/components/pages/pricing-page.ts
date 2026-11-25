import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { pricingContent, type PricingContent, pricingSections, type PricingSection } from '@/lib/pages/pricing'
import '@/elements/components/site/page-head'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/faq-accordion'
import '@/elements/components/ui/button'
import '@/elements/components/site/compare-table'
import '@/elements/components/site/pricing-table'
import '@/elements/components/site/site-header'
import '@/elements/components/visuals/ascii-trail'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'
import { headerMenus, type HeaderMenus } from '@/lib/site-header'

// PricingPage.tsx as <spyglass-pricing-page>: the site's pricing page: the header, the centered page head, the plan
// cards with the billing switch, the compare table (from 768), the questions, the closing section and the footer. `content`
// replaces the copy (lib/pages/pricing.ts).
const FAQ_SPLIT = 'grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16'
const FAQ_HEAD = 'flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]'
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The pricing page template.
 */
export class PricingPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-page"]'))
	static properties = { content: { type: Object }, menus: { type: Object }, sections: { type: Array } }
	/** The page's copy (lib/pages/pricing.ts by default). */
	content: PricingContent = pricingContent
	/** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
	menus?: HeaderMenus
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: PricingSection[]

	render() {
		const c = this.content ?? pricingContent
		const parts: Record<PricingSection, unknown> = {
			head: html`<spyglass-page-head head-id="pricing" .lines=${c.head.lines} lead=${c.head.lead} align="centre"></spyglass-page-head>`,
			plans: html`<section aria-label="Plans" class="pb-[calc(var(--ds-layout-section)-var(--ds-space-xs))] md:pb-(--ds-layout-section)"><div class=${WRAP}><spyglass-pricing-table .plans=${c.plans} .billing=${c.billing} .note=${c.note}></spyglass-pricing-table></div></section>`,
			compare: html`<section id=${c.compare.id} aria-label=${c.compare.label} class="py-(--ds-layout-section) max-md:hidden"><div class=${WRAP}><spyglass-compare-table .plans=${c.compare.plans} .groups=${c.compare.groups} default-plan=${c.compare.defaultPlan}></spyglass-compare-table></div></section>`,
			faq: html`<section id=${c.faq.id} aria-labelledby=${`${c.faq.id}-heading`} class="py-(--ds-layout-section)"><div class=${`${WRAP} ${FAQ_SPLIT}`}><div class=${FAQ_HEAD}><h2 id=${`${c.faq.id}-heading`} class="type-section [text-box:trim-start_cap_alphabetic]">${c.faq.title}</h2><p class="type-body-lg text-pretty text-fg-soft">${c.faq.lead}</p><spyglass-button href=${c.faq.action.href} variant="secondary" class="mt-4 max-md:w-full">${c.faq.action.label}</spyglass-button></div><div class="min-w-0"><spyglass-faq-accordion .items=${c.faq.items}></spyglass-faq-accordion></div></div></section>`,
			close: html`<spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close>`,
		}
		return html`<div data-ds="pricing-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .menus=${this.menus ?? headerMenus} .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main id="main">${pageSections(pricingSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('pricing-page', PricingPage)
