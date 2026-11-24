import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { HERO_BAND } from '@/lib/effects/light-art'
import { LIGHT_TILE_B, LIGHT_TILE_C } from '@/lib/light-tiles'
import { aboutContent, type AboutContent, type AboutPhoto } from '@/lib/pages/about'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// AboutPage.tsx as <spyglass-about-page>: the site's about and careers page, the head centered, the strip of photos in
// front of the drifting band of light (still with reduced motion), the story, the benefits and the footer. `content`
// (JSON) replaces the copy; its `photos` take your team's photos ({ src, alt, light, wide }).
const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const LIGHT = { b: LIGHT_TILE_B, c: LIGHT_TILE_C }

/**
 * @summary The about and careers page.
 */
export class AboutPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="about-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/about.ts by default). */
	content: AboutContent = aboutContent

	private tile(photo: AboutPhoto) {
		const src = photo.light ? LIGHT[photo.light] : photo.src
		const cls = ['relative aspect-4/5 overflow-hidden', photo.light ? 'bg-surface' : 'bg-surface-raised', photo.wide ? 'col-span-2 aspect-auto' : ''].filter(Boolean).join(' ')
		return html`<li aria-hidden=${photo.light || !src ? 'true' : nothing} class=${cls}>${src ? html`<img src=${src} alt=${photo.light ? '' : photo.alt ?? ''} decoding="async" class="absolute inset-0 size-full object-cover">` : nothing}</li>`
	}

	render() {
		const c = this.content ?? aboutContent
		return html`<div data-ds="about-page" class="bg-surface text-fg"><div class=${`${CONTAINER} relative z-10`}><spyglass-site-header .links=${c.shell.header.nav} .secondary=${c.shell.header.secondary}></spyglass-site-header></div><main id="main"><section aria-labelledby=${`${c.id}-heading`} class="pt-32 text-center"><div class=${CONTAINER}><h1 id=${`${c.id}-heading`} class="mx-auto max-w-180 type-figure text-balance md:text-heading-1">${c.head.lines.join(' ')}</h1><p class="mt-8 type-body-lg text-fg-soft">${c.head.lead}</p><div class="mt-14 flex flex-col md:flex-row md:justify-center"><spyglass-button href=${c.head.primary.href}>${c.head.primary.label}</spyglass-button></div></div></section><section aria-label=${c.film} class="relative isolate overflow-clip py-24"><span aria-hidden="true" class="ds-about-band" style=${`background-image: url("${HERO_BAND.picture}")`}></span><ul role="list" class="grid grid-cols-[repeat(7,--spacing(30))] justify-center gap-2 md:grid-cols-7 md:gap-3">${c.photos.map((p) => this.tile(p))}</ul></section><section aria-labelledby=${`${c.id}-story`} class="px-(--ds-layout-gutter) pb-24"><div class="mx-auto w-full max-w-180"><h2 id=${`${c.id}-story`} class="mb-8 type-heading-3 text-balance">${c.story.headline}</h2>${c.story.paragraphs.map((p) => html`<p class="mb-6 type-body text-pretty text-fg last:mb-0">${p}</p>`)}</div></section><section id=${c.perks.id} aria-labelledby=${`${c.id}-perks`} class="px-(--ds-layout-gutter) pb-32"><div class="mx-auto w-full max-w-180"><h2 id=${`${c.id}-perks`} class="mb-2 type-heading-4 font-medium text-balance md:text-heading-3">${c.perks.headline}</h2><p class="mb-16 type-body text-fg">${c.perks.lead}</p><dl class="grid gap-10">${c.perks.groups.map((g) => html`<div class="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[--spacing(60)_minmax(0,1fr)] sm:gap-4"><dt class="type-heading-4 font-medium text-fg">${g.title}</dt><dd><ul role="list" class="grid gap-1 type-body text-fg">${g.items.map((item) => html`<li>${item}</li>`)}</ul></dd></div>`)}</dl></div></section></main><spyglass-site-footer .columns=${c.shell.footer.columns} legal=${c.shell.footer.legal}></spyglass-site-footer></div>`
	}
}

define('about-page', AboutPage)
