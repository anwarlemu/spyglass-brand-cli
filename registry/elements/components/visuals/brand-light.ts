import { html, svg } from 'lit'
import { DsElement, define, uid } from '@/elements/lib/element'
import { LIGHT_LAYERS, lightGeometry, type LightSource, type LightVariant } from '@/lib/light'
import styles from 'virtual:tw'

// BrandLight.tsx as <spyglass-brand-light>: the brand light from the seeded generator (lib/light.ts), the shape three
// times in Blue, Green and Red, shifted, blurred and blended plus-lighter on Black. The element is the box (size it
// with classes as the React root); it keeps the frame's proportions unless `cover`. Decoration: aria-hidden.

/** Each variant's frame in the brand assets (px on the 1080 canvas). */
const FRAMES: Record<LightVariant, [number, number]> = {
	band: [1080, 240],
	field: [1080, 612],
	corner: [1080, 1080],
	'strip-left': [160, 1080],
	'strip-right': [160, 1080],
	tile: [200, 200],
	'close-up': [280, 208],
	'curved-strip': [1920, 619],
}
const r2 = (n: number) => Math.round(n * 100) / 100

/**
 * @summary The brand light, generated from a seed.
 */
export class BrandLight extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		variant: {},
		seed: { type: Number },
		source: {},
		width: { type: Number },
		height: { type: Number },
		ground: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		cover: { type: Boolean },
	}
	/** band, field, corner, strip-left, strip-right, tile, close-up or curved-strip. */
	variant: LightVariant = 'band'
	/** The same seed draws the same light. */
	seed = 0
	/** 'brand' (windows onto the brand's heat map) or 'generated'. */
	source: LightSource = 'brand'
	/** The frame it is drawn for, in px. */
	width?: number
	height?: number
	/** Paint the Black ground under it (ground="false" to leave it out). */
	ground = true
	/** Fill the box its classes give it instead of keeping the frame's proportions. */
	cover = false
	private lightId = uid('sg-light')

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		const frame = FRAMES[this.variant] ?? FRAMES.band
		const w = this.width ?? frame[0]
		const h = this.height ?? frame[1]
		const g = lightGeometry({ width: w, height: h, variant: this.variant, seed: this.seed, source: this.source })
		this.style.aspectRatio = this.cover ? '' : `${w} / ${h}`
		this.toggleAttribute('data-ground', this.ground)
		return html`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" class="block size-full isolate"><defs><path id="${this.lightId}-shape" fill-rule="evenodd" d=${g.d}></path><filter id="${this.lightId}-blur" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation=${r2(g.blur)}></feGaussianBlur></filter></defs>${LIGHT_LAYERS.map((l) => svg`<use href="#${this.lightId}-shape" x=${r2(g.offset * l.shift)} fill=${l.color} opacity=${l.opacity} filter="url(#${this.lightId}-blur)" style="mix-blend-mode:plus-lighter"></use>`)}</svg>`
	}
}

define('brand-light', BrandLight)
