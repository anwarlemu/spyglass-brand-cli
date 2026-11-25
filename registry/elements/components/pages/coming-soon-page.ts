import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { comingSoonContent, type ComingSoonContent } from '@/lib/pages/coming-soon'
import { ASCII_TEXTURE_ALPHA } from '@/lib/plan-lights'
import '@/elements/components/site/site-header'
import '@/elements/components/visuals/ascii-trail'
import '@/elements/components/site/page-head'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/side-drifts'
import styles from 'virtual:tw'

// ComingSoonPage.tsx as <spyglass-coming-soon-page>: the site's coming soon page: the page head with two buttons, the
// sources coming next as cards (a cover with the mark over clearing glyphs, the name, a line and the APIs it feeds),
// "Also on the list", the closing section and the footer. `content` replaces the copy (lib/pages/coming-soon.ts); a
// source's `mark` is an image URL, tinted to the faint gray.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const AT = ['0 0', 'var(--ds-coming-ascii-at-2)', 'var(--ds-coming-ascii-at-3)', 'var(--ds-coming-ascii-at-4)', 'var(--ds-coming-ascii-at-5)']

const mark = (src: string | undefined, cls: string) => (src
	? html`<span aria-hidden="true" class=${`block bg-current ${cls}`} style=${`mask-image: url("${src}"); mask-size: contain; mask-repeat: no-repeat; mask-position: center`}></span>`
	: html`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" class=${cls}><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.5"></rect></svg>`)

/**
 * @summary The coming soon page template.
 */
export class ComingSoonPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="coming-soon-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/coming-soon.ts by default). */
	content: ComingSoonContent = comingSoonContent

	render() {
		const c = this.content ?? comingSoonContent
		const odd = c.next.length % 2 === 1
		return html`<div data-ds="coming-soon-page" class="isolate bg-surface text-fg" style=${`--ascii-alpha: url("${ASCII_TEXTURE_ALPHA}")`}><spyglass-ascii-trail mode="page"></spyglass-ascii-trail><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header><main id="main"><spyglass-page-head head-id="coming-soon" .lines=${c.head.lines} lead=${c.head.lead} .primary=${c.head.primary} .secondary=${c.head.secondary}></spyglass-page-head><section aria-label=${c.nextLabel} class="relative isolate pb-16 md:pb-20"><spyglass-side-drifts></spyglass-side-drifts><div class=${WRAP}><ul role="list" class="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-6">${c.next.map((s, i) => {
			const last = odd && i === c.next.length - 1
			return html`<li class=${`flex flex-col rounded-panel bg-surface-raised p-2 ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'} ${last ? 'md:max-lg:col-span-full' : ''}`}><div class=${`ds-coming-cover relative isolate grid h-32 place-items-center overflow-hidden rounded-ds-sm bg-surface md:h-40 ${i < 2 ? 'lg:h-60' : ''}`} style=${`--at: ${AT[i % AT.length]}`}>${mark(s.mark, 'size-12 text-fg-faint')}</div><div class="flex flex-1 flex-col gap-2 p-4"><h2 class="m-0 type-heading-3">${s.name}</h2><p class="m-0 max-w-(--ds-layout-measure) type-body text-pretty text-fg-soft">${s.line}</p>${s.apis.length ? html`<div class="mt-auto flex flex-col items-start gap-2 pt-4"><span class="type-ui text-fg-muted">${c.feedsLabel}</span><ul role="list" class="m-0 flex list-none flex-wrap gap-2 p-0">${s.apis.map((a) => html`<li><a href=${a.href} class="block rounded-ds-sm bg-surface-inset px-2 py-1 type-ui text-fg-soft transition-[color] duration-160 ease-out hover:text-fg focus-visible:outline-offset-2">${a.name}</a></li>`)}</ul></div>` : ''}</div></li>`
		})}</ul></div></section><section aria-labelledby="also-heading" class="pb-(--ds-layout-section)"><div class=${WRAP}><h2 id="also-heading" class="m-0 mb-6 type-heading-4 md:type-heading-3">${c.also.title}</h2><ul role="list" class="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">${c.also.sources.map((s) => html`<li class="flex min-w-0 items-center gap-3 rounded-panel bg-surface-raised p-4">${mark(s.mark, 'size-6 flex-none text-fg-faint')}<span class="flex min-w-0 flex-col"><span class="type-body">${s.name}</span><span class="type-ui text-fg-muted">${c.also.note}</span></span></li>`)}</ul></div></section><spyglass-page-close .lines=${c.close.lines} note=${c.close.note} .primary=${c.close.primary}></spyglass-page-close></main><spyglass-site-footer .columns=${c.footer.columns} legal=${c.footer.legal}></spyglass-site-footer></div>`
	}
}

define('coming-soon-page', ComingSoonPage)
