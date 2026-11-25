import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { homeContent, type HomeContent } from '@/lib/pages/home'
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
// footer. `content` replaces the header, proof row, questions and footer (lib/pages/home.ts).
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

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
		return html`<div data-ds="home-page" class="bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main id="main"><spyglass-playground-hero></spyglass-playground-hero><spyglass-proof-block heading=${c.proof.title} .logos=${c.proof.logos}></spyglass-proof-block><spyglass-features-block></spyglass-features-block><spyglass-why-block></spyglass-why-block><spyglass-how-it-works-block></spyglass-how-it-works-block><spyglass-case-stories-block></spyglass-case-stories-block><spyglass-pricing-panels-block></spyglass-pricing-panels-block><div class=${`${WRAP} py-(--ds-layout-section)`}><spyglass-faq-block head-id="home-faq" heading=${c.faq.title} body=${c.faq.lead} .action=${c.faq.action} .items=${c.faq.items}></spyglass-faq-block></div><spyglass-close-block></spyglass-close-block></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('home-page', HomePage)
