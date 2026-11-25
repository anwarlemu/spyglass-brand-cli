import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { proofPlaceholders, type ProofLogo } from '@/elements/components/site/proof-strip'
import type { RunItem } from '@/lib/automation-run'
import { runPlaceholders } from '@/lib/automation-run'
import type { RingCard } from '@/lib/enterprise-ring'
import { ringPlaceholders } from '@/lib/enterprise-ring'
import { enterpriseFeaturesContent, type EnterpriseFeaturesContent } from '@/lib/enterprise-features'
import { enterprisePageContent, type EnterprisePageContent, enterpriseSections, type EnterpriseSection } from '@/lib/pages/enterprise'
import '@/elements/components/site/site-header'
import '@/elements/components/visuals/ascii-trail'
import '@/elements/components/site/enterprise-hero'
import '@/elements/components/site/proof-strip'
import '@/elements/components/site/automation-run'
import '@/elements/components/site/enterprise-features'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'

// EnterprisePage.tsx as <spyglass-enterprise-page>: the header, the hero in its ring, the logo row, the automation run,
// the eight features, the close with two buttons and the footer. `content`, `cards`, `logos`, `run` and `features` (JSON).

/**
 * @summary The enterprise page.
 */
export class EnterprisePage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="enterprise-page"]'))
	static properties = { content: { type: Object }, cards: { type: Array }, logos: { type: Array }, run: { type: Array }, features: { type: Object }, sections: { type: Array } }
	/** The copy (lib/pages/enterprise.ts by default). */
	content: EnterprisePageContent = enterprisePageContent
	/** The hero ring's sets of creatives. */
	cards: RingCard[][] = ringPlaceholders
	/** The logo row's marks. */
	logos: ProofLogo[] = proofPlaceholders
	/** The automation run's batch. */
	run: RunItem[] = runPlaceholders
	/** The features' copy, data and pictures. */
	features: EnterpriseFeaturesContent = enterpriseFeaturesContent
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: EnterpriseSection[]

	render() {
		const c = this.content ?? enterprisePageContent
		const wrap = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
		const parts: Record<EnterpriseSection, unknown> = {
			hero: html`<spyglass-enterprise-hero .content=${c.hero} .cards=${this.cards ?? ringPlaceholders}></spyglass-enterprise-hero>`,
			proof: html`<section aria-label=${c.proof} class="pt-(--ds-ent-logos-above) pb-(--ds-layout-section) md:pt-(--ds-ent-logos-above-md)"><div class=${`${wrap} flex justify-center`}><spyglass-proof-strip .logos=${this.logos ?? proofPlaceholders}></spyglass-proof-strip></div></section>`,
			run: html`<spyglass-automation-run .items=${this.run ?? runPlaceholders} section-id="monday-report"></spyglass-automation-run>`,
			features: html`<spyglass-enterprise-features .content=${this.features ?? enterpriseFeaturesContent}></spyglass-enterprise-features>`,
			close: html`<spyglass-page-close close-id="enterprise-close" .lines=${c.close.title} .note=${c.close.note} .primary=${c.close.primary} .secondary=${c.close.secondary} connect="false" texture="false"></spyglass-page-close>`,
		}
		return html`<div data-ds="enterprise-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.header.links} .secondary=${c.header.secondary} variant="centered"></spyglass-site-header><main id="main">${pageSections(enterpriseSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} .legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('enterprise-page', EnterprisePage)
