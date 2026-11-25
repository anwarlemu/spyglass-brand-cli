import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { caseStudiesIndexContent, type CaseStudiesIndexContent, caseStudiesSections, type CaseStudiesSection } from '@/lib/pages/case-studies'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/blocks/case-stories-block'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'

// CaseStudiesPage.tsx as <spyglass-case-studies-page>: the header, the page head, the home's case stories without
// their head (every quote shown), the closing section and the footer. `content` (JSON) replaces the copy, the cases
// and the quotes (lib/pages/case-studies.ts).


/**
 * @summary The case studies index.
 */
export class CaseStudiesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="case-studies-page"]'))
	static properties = { content: { type: Object }, sections: { type: Array } }
	/** The copy, cases and quotes (lib/pages/case-studies.ts by default). */
	content: CaseStudiesIndexContent = caseStudiesIndexContent
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: CaseStudiesSection[]

	render() {
		const c = this.content ?? caseStudiesIndexContent
		const parts: Record<CaseStudiesSection, unknown> = {
			head: html`<spyglass-page-head head-id=${c.head.id} .lines=${c.head.lines} lead=${c.head.lead}></spyglass-page-head>`,
			stories: html`<div aria-label=${c.head.lines.join(' ')} role="region" class="-mt-(--ds-layout-section) pb-[calc(96px-var(--ds-layout-section))]"><spyglass-case-stories-block .cases=${c.cases} .quotes=${c.quotes} .quoteCount=${c.quotes.length} head="false"></spyglass-case-stories-block></div>`,
			close: html`<spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close>`,
		}
		return html`<div data-ds="case-studies-page" class="isolate overflow-x-clip bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main>${pageSections(caseStudiesSections, this.sections).map((k) => parts[k])}</main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('case-studies-page', CaseStudiesPage)
