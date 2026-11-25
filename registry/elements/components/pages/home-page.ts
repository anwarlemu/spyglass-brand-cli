import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { homeContent, homeSections, type HomeBlocks, type HomeContent, type HomeSection } from '@/lib/pages/home'
import { pageSections } from '@/lib/image'
import '@/elements/components/site/site-header'
import '@/elements/components/site/proof-block'
import '@/elements/components/visuals/ascii-trail'
import '@/elements/components/blocks/playground-hero'
import '@/elements/components/blocks/features-block'
import '@/elements/components/blocks/why-block'
import '@/elements/components/blocks/how-it-works-block'
import '@/elements/components/blocks/case-stories-block'
import '@/elements/components/blocks/pricing-panels-block'
import '@/elements/components/blocks/faq-block'
import '@/elements/components/blocks/close-block'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'

// HomePage.tsx as <spyglass-home-page>: the site's home in its order: the ASCII trail, the header, the playground hero, the proof row,
// the features, the reasons, the set-up steps, the case stories, the pricing strip, the questions, the close and the
// footer. `content` replaces the header, proof row, questions and footer (lib/pages/home.ts); `blocks` passes each
// block its own data, pictures included; `sections` (a list) shows those sections in that order.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The home page template.
 */
export class HomePage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="home-page"]'))
	static properties = { content: { type: Object }, blocks: { type: Object }, sections: { type: Array } }
	/** The page's copy (lib/pages/home.ts by default). */
	content: HomeContent = homeContent
	/** Each block's data, pictures included: hero, features, why, steps, stories, pricing, close. */
	blocks: HomeBlocks = {}
	/** The sections to show, in order (hero, proof, features, why, steps, stories, pricing, faq, close); all by default. */
	sections?: HomeSection[]

	render() {
		const c = this.content ?? homeContent
		const b = this.blocks ?? {}
		const parts: Record<HomeSection, unknown> = {
			hero: html`<spyglass-playground-hero .session=${b.hero?.session}></spyglass-playground-hero>`,
			proof: html`<spyglass-proof-block heading=${c.proof.title} .logos=${c.proof.logos}></spyglass-proof-block>`,
			features: html`<spyglass-features-block .ads=${b.features?.ads} .burst=${b.features?.burst} .ring=${b.features?.ring} .tally=${b.features?.tally}></spyglass-features-block>`,
			why: html`<spyglass-why-block .creatives=${b.why?.creatives} .logo=${b.why?.logo}></spyglass-why-block>`,
			steps: html`<spyglass-how-it-works-block .session=${b.steps?.session}></spyglass-how-it-works-block>`,
			stories: html`<spyglass-case-stories-block .cases=${b.stories?.cases} .quotes=${b.stories?.quotes}></spyglass-case-stories-block>`,
			pricing: html`<spyglass-pricing-panels-block .sets=${b.pricing?.sets}></spyglass-pricing-panels-block>`,
			faq: html`<div class=${`${WRAP} py-(--ds-layout-section)`}><spyglass-faq-block head-id="home-faq" heading=${c.faq.title} body=${c.faq.lead} .action=${c.faq.action} .items=${c.faq.items}></spyglass-faq-block></div>`,
			close: html`<spyglass-close-block .creatives=${b.close?.creatives}></spyglass-close-block>`,
		}
		return html`<div data-ds="home-page" class="bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main id="main">${pageSections(homeSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('home-page', HomePage)
