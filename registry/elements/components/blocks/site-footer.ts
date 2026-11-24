import { html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { LOGOS } from '@/lib/logos'
import '@/elements/components/ui/badge'
import '@/elements/components/visuals/brand-light'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// SiteFooter.tsx as <spyglass-site-footer>: the wordmark in the footer gray with the brand light through its lower
// half, and the #262626 card over its descender with the link `columns` ({ title, links: { label, href? }[], wide? }),
// the lockup and the `legal` line. A link without `href` shows the `soon` badge. Nothing moves.
export interface SiteFooterLink { label: string; href?: string }
export interface SiteFooterColumn { title: string; links: SiteFooterLink[]; wide?: boolean }

const LINK = 'flex min-h-10 items-center rounded-ds-sm type-body text-fg-soft transition-[color] duration-160 ease-out hover:text-fg md:block md:min-h-0 md:py-1'

function wordmarkMask() {
	const w = LOGOS.wordmark
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.width} ${w.height}" fill="#000">${w.body}</svg>`
	return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/**
 * @summary The site's footer: the big wordmark with the light, and the card of link columns.
 */
export class SiteFooter extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="site-footer"]'))
	static properties = { columns: { type: Array }, legal: {}, homeHref: { attribute: 'home-href' }, soon: {}, wordmark: { type: Boolean }, seed: { type: Number }, label: {} }
	columns: SiteFooterColumn[] = []
	/** The line beside the lockup. */
	legal?: string
	/** Where the lockup links. */
	homeHref = '/'
	/** The badge on a link that is not live yet. */
	soon = 'Coming soon'
	/** The big wordmark and its light (on by default; set the property to false to leave them out). */
	wordmark = true
	/** The light's seed. */
	seed = 0
	/** The lockup's accessible name. */
	label = 'Spyglass'

	render() {
		const w = LOGOS.wordmark
		const mask = wordmarkMask()
		const masked = { maskImage: mask, WebkitMaskImage: mask, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat' }
		const columns = this.columns ?? []
		return html`<footer data-ds="site-footer" class="relative isolate bg-surface pt-(--ds-layout-section) text-fg"><div class="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">${this.wordmark ? html`<div aria-hidden="true" class="relative w-full" style=${styleMap({ aspectRatio: `${w.width} / ${w.height}` })}><svg viewBox="0 0 ${w.width} ${w.height}" class="absolute inset-0 block size-full fill-wordmark-gray">${unsafeSVG(w.body)}</svg><div class="absolute inset-0" style=${styleMap(masked)}><spyglass-brand-light variant="curved-strip" seed=${this.seed} ground="false" cover class="absolute inset-x-0 top-1/4 h-3/4 mix-blend-screen"></spyglass-brand-light></div></div>` : nothing}<div class=${this.wordmark ? 'relative z-1 pb-8 -mt-[2.54%]' : 'relative z-1 pb-8'}><div class="rounded-panel border border-edge bg-surface-raised px-12 pt-12 max-md:px-6 max-md:pt-8"><nav aria-label="Footer"><div class="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 md:gap-y-12 xl:grid-cols-6">${columns.map((c) => html`<div class=${c.wide ? 'max-md:col-span-full' : ''}><h2 class="mb-4 type-heading-4 text-fg">${c.title}</h2><ul role="list" class=${c.wide ? 'max-md:grid max-md:grid-cols-2 max-md:gap-x-6' : ''}>${c.links.map((l) => html`<li>${l.href ? html`<a href=${l.href} class=${LINK}>${l.label}</a>` : html`<span aria-disabled="true" class="flex min-h-10 flex-wrap items-center gap-x-2 type-body text-fg-faint md:min-h-0 md:py-1">${l.label}<spyglass-badge variant="secondary">${this.soon}</spyglass-badge></span>`}</li>`)}</ul></div>`)}</div></nav><div class="mt-16 flex items-center justify-between gap-6 border-t border-edge pt-5 pb-6 max-md:mt-12 max-sm:flex-col max-sm:items-start"><a href=${this.homeHref} aria-label=${this.label} class="rounded-ds-sm"><spyglass-logo height="20" aria-label=${this.label}></spyglass-logo></a>${this.legal ? html`<p class="type-ui text-fg-muted">${this.legal}</p>` : nothing}</div></div></div></div></footer>`
	}
}

define('site-footer', SiteFooter)
