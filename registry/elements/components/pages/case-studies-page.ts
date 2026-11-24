import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { caseStudiesIndexContent, type CaseStudiesIndexContent } from '@/lib/pages/case-studies'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/blocks/case-stories-block'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'

// CaseStudiesPage.tsx as <spyglass-case-studies-page>: the header, the page head, the home's case stories without
// their head (every quote shown), the closing section and the footer. `content` (JSON) replaces the copy, the cases
// and the quotes (lib/pages/case-studies.ts).

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The case studies index.
 */
export class CaseStudiesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="case-studies-page"]'))
	static properties = { content: { type: Object } }
	/** The copy, cases and quotes (lib/pages/case-studies.ts by default). */
	content: CaseStudiesIndexContent = caseStudiesIndexContent

	render() {
		const c = this.content ?? caseStudiesIndexContent
		return html`<div data-ds="case-studies-page" class="overflow-x-clip bg-surface text-fg"><div class=${CONTAINER}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div><main><spyglass-page-head head-id=${c.head.id} .lines=${c.head.lines} lead=${c.head.lead}></spyglass-page-head><div aria-label=${c.head.lines.join(' ')} role="region" class="-mt-(--ds-layout-section) pb-[calc(96px-var(--ds-layout-section))]"><spyglass-case-stories-block .cases=${c.cases} .quotes=${c.quotes} head="false"></spyglass-case-stories-block></div><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('case-studies-page', CaseStudiesPage)
