import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// CreativeCard.tsx as <spyglass-creative-card>: a creative in the brand corner, the image's color as posted. `src` is
// the image; without one it draws the neutral placeholder (the advertiser from 112px wide, a headline from 192px).
// `ratio` is 4/5, 1/1, 3/4, 7/5, 3/5, 9/16 or fill; `href` makes it a link. It does not move on hover.
export type CreativeRatio = '4/5' | '1/1' | '3/4' | '7/5' | '3/5' | '9/16' | '16/9' | 'fill'
export type CreativeTone = 1 | 2 | 3 | 4

const TONES: Record<CreativeTone, string> = {
	1: 'bg-linear-to-b from-ds-neutral-4 to-ds-neutral-2',
	2: 'bg-linear-to-b from-ds-neutral-5 to-ds-neutral-3',
	3: 'bg-linear-to-b from-ds-neutral-6 to-ds-neutral-4',
	4: 'bg-linear-to-b from-ds-neutral-7 to-ds-neutral-5',
}

/**
 * @summary A creative: an image as posted in the brand corner, or a neutral placeholder.
 */
export class CreativeCard extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="creative-card"]'))
	static properties = { src: {}, alt: {}, ratio: {}, brand: {}, caption: {}, tone: { type: Number }, href: {} }
	/** The image, used exactly as posted. */
	src?: string
	/** What the creative shows. */
	alt = ''
	/** 4/5, 1/1, 3/4, 7/5, 3/5, 9/16, 16/9 or fill. */
	ratio: CreativeRatio = '4/5'
	/** The placeholder's advertiser. */
	brand?: string
	/** The placeholder's headline. */
	caption?: string
	/** The placeholder's neutral gradient, 1 to 4. */
	tone: CreativeTone = 2
	/** Makes the creative a link. */
	href?: string

	render() {
		const ratio = this.ratio || '4/5'
		const box = ratio === 'fill' ? {} : { aspectRatio: ratio.replace('/', ' / ') }
		const classes = ['@container relative block overflow-hidden rounded-container', this.src ? 'bg-surface-subtle' : TONES[this.tone] ?? TONES[2], ratio === 'fill' ? 'size-full' : ''].filter(Boolean).join(' ')
		const body = this.src
			? html`<img src=${this.src} alt=${this.alt} loading="lazy" decoding="async" class="block size-full object-cover">`
			: html`${this.caption ? html`<span aria-hidden="true" class="absolute inset-x-4 top-4 hidden type-heading-4 text-fg @min-[12rem]:block">${this.caption}</span>` : nothing}${this.brand ? html`<span aria-hidden="true" class="absolute bottom-3 left-3 hidden type-label text-fg @min-[7rem]:block">${this.brand}</span>` : nothing}`
		const label = this.src ? undefined : this.alt || [this.brand, this.caption].filter(Boolean).join(', ') || undefined
		return this.href
			? html`<a data-ds="creative-card" href=${this.href} aria-label=${ifDefined(label)} style=${styleMap(box)} class=${classes}>${body}</a>`
			: html`<div data-ds="creative-card" role=${ifDefined(label ? 'img' : undefined)} aria-label=${ifDefined(label)} style=${styleMap(box)} class=${classes}>${body}</div>`
	}
}

define('creative-card', CreativeCard)
