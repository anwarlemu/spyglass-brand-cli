import { html } from 'lit'
import { ArrowUpRight } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { careersContent, type CareersContent } from '@/lib/pages/careers'
import { notFoundContent } from '@/lib/pages/not-found'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// CareersPage.tsx as <spyglass-careers-page>: the head, why join as three cards, the open roles as rows. `content`
// replaces the copy.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The careers page template.
 */
export class CareersPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="careers-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/careers.ts by default). */
	content: CareersContent = careersContent

	render() {
		const c = this.content ?? careersContent
		const h = notFoundContent
		return html`<div data-ds="careers-page" class="flex min-h-dvh flex-col bg-surface text-fg"><spyglass-site-header .links=${h.header.nav} .secondary=${h.header.secondary} .cta=${h.header.cta}></spyglass-site-header><main class="flex-1"><spyglass-hero-block eyebrow=${c.eyebrow} headline=${c.headline} body=${c.body} light="field"></spyglass-hero-block><section class=${`${WRAP} grid gap-4 pb-16 md:grid-cols-3`}>${c.values.map((v) => html`<div class="grid content-start gap-2 rounded-container bg-surface-raised p-6"><h2 class="type-heading-3">${v.title}</h2><p class="type-body text-fg-soft">${v.body}</p></div>`)}</section><section class=${`${WRAP} grid gap-8 pb-24`}><h2 class="type-section">${c.rolesTitle}</h2>${c.roles.length ? html`<ul role="list" class="m-0 list-none border-b border-edge p-0">${c.roles.map((r) => html`<li class="border-t border-edge"><a href=${r.href} class="group flex items-center gap-6 rounded-ds-sm py-6 transition-[color] duration-160 ease-out"><span class="grid flex-1 gap-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6"><span class="type-heading-3 text-fg">${r.title}</span><span class="type-ui text-fg-muted">${r.team} · ${r.location}</span></span>${icon(ArrowUpRight, 'arrow-up-right', { size: 20, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted transition-[color] duration-160 ease-out group-hover:text-fg', attrs: { 'aria-hidden': 'true' } })}</a></li>`)}</ul>` : html`<p class="type-body text-fg-soft">${c.none}</p>`}</section></main><footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${h.footer.domain} home-href="/" .links=${h.footer.links}></spyglass-footer-row></div></footer></div>`
	}
}

define('careers-page', CareersPage)
