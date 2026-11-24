import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { templatesPageContent, type TemplatesPageContent } from '@/lib/pages/templates'
import '@/elements/components/site/site-header'
import '@/elements/components/site/automation-run'
import '@/elements/components/site/row-fan'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/templates-wall'
import '@/elements/components/blocks/faq-block'
import '@/elements/components/blocks/site-footer'
import styles from 'virtual:tw'

// TemplatesPage.tsx as <spyglass-templates-page>: the header, the templates wall as the hero, the automation run, what
// each template brings back (a centered head over the row fan), the
// questions, the close with two buttons and the footer. `content` replaces the copy (lib/pages/templates.ts); the `fan`
// slot replaces the row fan with your own arrangement of the rows.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The templates page template.
 * @slot fan - Your own arrangement of the rows in place of the row fan.
 */
export class TemplatesPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="templates-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/templates.ts by default). */
	content: TemplatesPageContent = templatesPageContent

	render() {
		const c = this.content ?? templatesPageContent
		const t = c.cities
		const rows = this.hasSlot('fan') ? html`<slot name="fan"></slot>` : html`<spyglass-row-fan .rows=${t.rows.map((r) => ({ key: r.key, name: r.name, href: r.href, cta: r.line, srLabel: `: ${t.status.toLowerCase()}. ${r.line}`, items: r.items.map((i) => ({ ...i, src: i.src ?? '' })) }))}></spyglass-row-fan>`
		return html`<div data-ds="templates-page" class="bg-surface text-fg"><div class=${`${WRAP} relative z-10`}><spyglass-site-header .links=${c.chrome.header.nav} .secondary=${c.chrome.header.secondary} .cta=${c.chrome.header.cta}></spyglass-site-header></div><main id="main"><spyglass-templates-wall hero .content=${c.wall} section-id="templates"></spyglass-templates-wall><spyglass-automation-run section-id="templates-run"></spyglass-automation-run><section id=${t.id} aria-labelledby=${`${t.id}-heading`} class="ds-tpl-cities overflow-x-clip pt-(--ds-layout-section)"><div class=${`${WRAP} grid justify-items-center text-center`}><h2 id=${`${t.id}-heading`} class="type-section [text-box:trim-start_cap_alphabetic]">${t.headline}</h2><p class="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${t.lead}</p></div><div class="ds-tpl-cities-rows relative">${rows}</div></section><div class=${`${WRAP} py-(--ds-layout-section)`}><spyglass-faq-block head-id=${c.faq.id} heading=${c.faq.headline} body=${c.faq.lead} .action=${c.faq.docs} .items=${c.faq.items}></spyglass-faq-block></div><spyglass-page-close close-id="templates-close" .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary} .secondary=${c.close.secondary} connect="false"></spyglass-page-close></main><spyglass-site-footer .columns=${c.chrome.footer.columns} legal=${c.chrome.footer.legal}></spyglass-site-footer></div>`
	}
}

define('templates-page', TemplatesPage)
