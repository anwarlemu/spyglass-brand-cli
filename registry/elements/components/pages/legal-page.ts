import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { legalContent, legalPrivacyContent, type LegalContent } from '@/lib/pages/legal'
import '@/elements/components/site/site-header'
import '@/elements/components/site/page-head'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/ascii-trail'
import styles from 'virtual:tw'

// LegalPage.tsx as <spyglass-legal-page>: the header, the page head, the sections in the left columns and their list
// staying in view in the right ones, then the footer. The sections live in the shadow root, where the page's #fragment
// cannot reach them, so the list scrolls to them itself (and puts the fragment in the address bar). `page` picks terms or privacy;
// `content` replaces the text.
const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The legal page (terms, privacy).
 */
export class LegalPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="legal-page"]'))
	static properties = { page: {}, content: { type: Object }, preparing: { type: Boolean } }
	/** Which page's copy to show when there is no `content`: terms or privacy. */
	page: 'terms' | 'privacy' = 'terms'
	/** Only the page head, its lead saying the text is being prepared. */
	preparing = false
	/** The text as JSON (lib/pages/legal.ts by default). */
	content?: LegalContent

	private go(event: Event, id: string) {
		const target = (this.renderRoot as ShadowRoot).getElementById(id)
		if (!target) return
		event.preventDefault()
		target.scrollIntoView()
		history.replaceState(null, '', `#${id}`)
	}

	render() {
		const c = this.content ?? (this.page === 'privacy' ? legalPrivacyContent : legalContent)
		return html`<div data-ds="legal-page" class="isolate bg-surface text-fg"><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.shell.header.nav} .secondary=${c.shell.header.secondary} .cta=${c.shell.header.cta}></spyglass-site-header><main id="main"><spyglass-page-head head-id=${c.id} .lines=${[c.title]} .lead=${this.preparing ? c.preparing : c.lead}></spyglass-page-head>${this.preparing ? nothing : html`<div class=${`${CONTAINER} grid grid-cols-[minmax(0,1fr)] gap-12 pb-(--ds-layout-section) md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16`}><nav aria-label=${c.contents} class="self-start md:sticky md:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))] md:order-last"><p class="mb-4 type-label text-fg-muted">${c.contents}</p><ul role="list" class="grid gap-2">${c.sections.map((s) => html`<li><a href=${`#${s.id}`} class="rounded-ds-sm type-ui text-fg-soft transition-[color] duration-160 ease-out hover:text-fg" @click=${(e: Event) => this.go(e, s.id)}>${s.title}</a></li>`)}</ul></nav><div class="grid max-w-measure gap-10"><p class="type-ui text-fg-muted">${c.updated}</p>${c.sections.map((s) => html`<section id=${s.id} aria-labelledby=${`${s.id}-title`} class="grid scroll-mt-[calc(var(--ds-size-header)+var(--ds-space-2xl))] gap-4"><h2 id=${`${s.id}-title`} class="type-heading-4 text-balance md:type-heading-3">${s.title}</h2>${s.body.map((p) => html`<p class="type-body text-pretty text-fg">${p}</p>`)}</section>`)}</div></div>`}</main><spyglass-site-footer .columns=${c.shell.footer.columns} legal=${c.shell.footer.legal}></spyglass-site-footer></div>`
	}
}

define('legal-page', LegalPage)
