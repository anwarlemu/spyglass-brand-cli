import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/visuals/ascii-texture'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// HeroBlock.tsx as <spyglass-hero-block>: the Funnel Display headline (`headline`, or a `headline` slot for inline
// creatives), `body`, `eyebrow`, the `actions` slot and the media in the default slot, on Black with the light
// (`light`: field, corner, band, strip or none) and the `texture`. `placement` is left, center or right.
export type HeroPlacement = 'left' | 'center' | 'right'
export type HeroLight = 'field' | 'corner' | 'band' | 'strip' | 'none'

const ALIGN: Record<HeroPlacement, string> = {
	left: 'items-start text-left',
	center: 'items-center text-center',
	right: 'items-end text-right',
}

const CLEAR: Record<HeroPlacement, { x: number; y: number; w: number; h: number }[]> = {
	left: [{ x: 0, y: 0, w: 920, h: 720 }],
	center: [{ x: 200, y: 80, w: 1040, h: 680 }],
	right: [{ x: 520, y: 0, w: 920, h: 720 }],
}

/**
 * @summary The top of a page: headline, a line, actions and media, over the light.
 * @slot - The media under the copy.
 * @slot headline - The headline with inline creatives (instead of the attribute).
 * @slot actions - Buttons.
 */
export class HeroBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="hero-block"]'))
	static properties = { headline: {}, body: {}, eyebrow: {}, placement: {}, light: {}, seed: { type: Number }, texture: { type: Boolean }, size: {} }
	headline = ''
	/** A line or two of DM Sans under the headline. */
	body?: string
	/** A label in capitals above the headline. */
	eyebrow?: string
	/** left, center or right (not `align`, which the browser reads as a text alignment). */
	placement: HeroPlacement = 'left'
	/** field, corner, band, strip or none. */
	light: HeroLight = 'field'
	seed = 0
	/** The ASCII texture behind everything. */
	texture = false
	/** section (the site's page head, by default) or display (the larger display line). */
	size: 'section' | 'display' = 'section'

	render() {
		const light = this.light
		const media = light === 'band' || light === 'strip'
		const kids = this.hasSlot()
		const top = ['mx-auto flex w-full max-w-page-wide flex-col gap-6 px-12 max-sm:px-4', ALIGN[this.placement] ?? ALIGN.left, light === 'field' ? 'pt-72 max-sm:pt-44' : light === 'corner' ? 'pt-24 max-sm:pt-44' : 'pt-24 max-sm:pt-16', kids ? 'pb-12 max-sm:pb-10' : 'pb-24 max-sm:pb-16'].join(' ')
		return html`<section data-ds="hero-block" class="relative isolate overflow-hidden bg-surface text-fg">${this.texture ? html`<spyglass-ascii-texture seed=${this.seed} width="1440" height="900" density="0.4" .clear=${CLEAR[this.placement] ?? CLEAR.left} cover class="absolute inset-0 -z-10 size-full"></spyglass-ascii-texture>` : nothing}${light === 'field' ? html`<spyglass-brand-light variant="field" seed=${this.seed} ground="false" cover class="absolute inset-x-0 top-0 -z-10 h-80 mask-b-from-40% max-sm:h-48"></spyglass-brand-light>` : nothing}${light === 'corner' ? html`<spyglass-brand-light variant="corner" seed=${this.seed} ground="false" cover class="absolute inset-0 -z-10 size-full max-sm:hidden"></spyglass-brand-light><spyglass-brand-light variant="field" seed=${this.seed} ground="false" cover class="absolute inset-x-0 top-0 -z-10 h-48 mask-b-from-40% sm:hidden"></spyglass-brand-light>` : nothing}<div class=${top}>${this.eyebrow ? html`<p class="type-label text-fg-muted">${this.eyebrow}</p>` : nothing}<h1 class=${this.size === 'display' ? 'max-w-4xl text-balance type-display-fluid' : 'max-w-4xl text-balance type-section'}>${this.hasSlot('headline') ? html`<slot name="headline"></slot>` : this.headline}</h1>${this.body ? html`<p class="max-w-measure type-body-lg text-fg-soft">${this.body}</p>` : nothing}${this.hasSlot('actions') ? html`<div class="mt-2 flex flex-wrap gap-3"><slot name="actions"></slot></div>` : nothing}</div>${kids ? html`<div class=${['relative', media ? 'py-14 max-sm:py-10' : 'pb-24 max-sm:pb-16'].join(' ')}>${light === 'band' ? html`<spyglass-brand-light variant="band" seed=${this.seed} ground="false" cover class="absolute inset-0 -z-10 size-full"></spyglass-brand-light>` : nothing}${light === 'strip' ? html`<spyglass-brand-light variant="curved-strip" seed=${this.seed} ground="false" cover class="absolute inset-0 -z-10 size-full"></spyglass-brand-light>` : nothing}<div class="mx-auto w-full max-w-page-wide px-12 max-sm:px-4"><slot></slot></div></div>` : nothing}</section>`
	}
}

define('hero-block', HeroBlock)
