import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { legalContent, type LegalContent } from '@/lib/pages/legal'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// LegalPage.tsx as <spyglass-legal-page>: the title and date, the list of sections and the sections in a 720px column.
// The sections live in the shadow root, where the page's #fragment cannot reach them, so the list scrolls to them
// itself (and puts the fragment in the address bar). `content` replaces the text.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The legal page template.
 */
export class LegalPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="legal-page"]'))
	static properties = { content: { type: Object } }
	/** The text (lib/pages/legal.ts by default). */
	content: LegalContent = legalContent

	private go(event: Event, id: string) {
		const target = (this.renderRoot as ShadowRoot).getElementById(id)
		if (!target) return
		event.preventDefault()
		target.scrollIntoView()
		history.replaceState(null, '', `#${id}`)
	}

	render() {
		const c = this.content ?? legalContent
		return html`<div data-ds="legal-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main>
<div class=${`${WRAP} grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8`}><h1 class="type-display max-md:type-hero max-sm:type-heading-1">${c.title}</h1><p class="type-label text-fg-muted">${c.updated}</p></div>
<div class=${`${WRAP} grid grid-cols-4 gap-12 pt-12 pb-24 max-md:grid-cols-1 max-md:gap-8 max-sm:pb-16`}><nav aria-label=${c.contents} class="self-start md:sticky md:top-8"><p class="mb-3 type-label text-fg-faint">${c.contents}</p><ul class="grid gap-2">${c.sections.map((s) => html`<li><a href=${`#${s.id}`} class="rounded-control type-ui text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg" @click=${(e: Event) => this.go(e, s.id)}>${s.title}</a></li>`)}</ul></nav><div class="col-span-3 grid max-w-180 gap-12 max-md:col-span-1">${c.sections.map((s) => html`<section id=${s.id} class="grid scroll-mt-8 gap-4"><h2 class="type-heading-2">${s.title}</h2>${s.body.map((p) => html`<p class="type-body text-fg-soft">${p}</p>`)}</section>`)}</div></div>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('legal-page', LegalPage)
