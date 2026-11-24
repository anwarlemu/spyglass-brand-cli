import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { startGrain } from '@/lib/effects/grain'
import { LIGHT_ART, type LightArtName } from '@/lib/effects/light-art'
import { LIGHT_IMAGE_CSS } from '@/lib/effects/light-image'
import { pointerEffectsOn } from '@/lib/effects/pointer'
import styles from 'virtual:tw'

// LightImage.tsx as <spyglass-light-image>: a light picture with the ASCII grain where its light falls off, and with a
// `mask` (a fine pointer, no reduced motion) the WebGL lens that magnifies the light and widens its colour split around
// the pointer. The host is the box: the page's classes size, place and position it. `picture`, `mask`, `width`,
// `height` (the frame, px), `split`, `grain` (on unless "false"), `still`, `priority`. Decoration: aria-hidden.

/**
 * @summary A light picture with its ASCII grain and pointer lens.
 */
export class LightImage extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(LIGHT_IMAGE_CSS(':host', ':host([data-gl])'))]
	static properties = {
		art: {},
		picture: {},
		mask: {},
		width: { type: Number },
		height: { type: Number },
		split: { type: Number },
		grain: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		still: { type: Boolean },
		priority: { type: Boolean },
	}
	/** One of the site's own light pictures, with its mask, frame and split: hero-band or pricing. */
	art: LightArtName = 'hero-band'
	/** Your own light picture (a URL or a data URI), instead of `art`. */
	picture?: string
	/** Its mask, for the WebGL lens. */
	mask?: string
	/** The frame the picture was drawn for, in px. */
	width?: number
	height?: number
	/** How far apart the lens draws the Blue, Green and Red copies, in the frame's px. */
	split?: number
	/** Draw the ASCII grain around the light. */
	grain = true
	/** No lens: the picture and its grain as they are. */
	still = false
	/** Load the picture first. */
	priority = false
	private stopGrain: (() => void) | null = null
	private stopLens: (() => void) | null = null
	private lensRun = 0

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop()
	}

	private stop() {
		this.stopGrain?.()
		this.stopGrain = null
		this.lensRun++
		this.stopLens?.()
		this.stopLens = null
	}

	/** The picture, mask, frame and split it draws: its own, or the art's. */
	private get resolved() {
		const set = this.picture ? undefined : (LIGHT_ART[this.art] ?? LIGHT_ART['hero-band'])
		return {
			picture: this.picture ?? set?.picture ?? '',
			mask: this.picture ? this.mask : set?.mask,
			width: this.width ?? set?.width ?? 1,
			height: this.height ?? set?.height ?? 1,
			split: this.split ?? set?.split ?? 0,
		}
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (![...changed.keys()].some((k) => ['art', 'picture', 'mask', 'width', 'height', 'split', 'grain', 'still'].includes(String(k)))) return
		this.stop()
		const { picture, mask, width, height, split } = this.resolved
		const grainCanvas = this.renderRoot.querySelector<HTMLCanvasElement>('.ds-light-grain')
		if (this.grain && grainCanvas && picture) this.stopGrain = startGrain(this, grainCanvas, picture, width, height, this.still)
		const lensCanvas = this.renderRoot.querySelector<HTMLCanvasElement>('.ds-light-lens')
		if (!lensCanvas || !mask || this.still || !pointerEffectsOn()) return
		const run = this.lensRun
		void import('@/lib/effects/lens-gl').then(({ startLens }) => {
			if (run === this.lensRun) this.stopLens = startLens({ box: this, canvas: lensCanvas, mask, width, height, split })
		})
	}

	render() {
		const { picture, mask, width, height } = this.resolved
		return html`<img class="ds-light-picture" src=${picture} alt="" width=${width} height=${height} loading=${this.priority ? 'eager' : 'lazy'} fetchpriority=${this.priority ? 'high' : 'auto'} decoding="async" draggable="false" />${mask && !this.still ? html`<canvas class="ds-light-lens"></canvas>` : nothing}${this.grain ? html`<canvas class="ds-light-grain"></canvas>` : nothing}`
	}
}

define('light-image', LightImage)
