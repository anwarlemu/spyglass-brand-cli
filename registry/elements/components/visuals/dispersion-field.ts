import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import type { DragSource } from '@/lib/effects/field-drag'
import { mountField, type RippleSource } from '@/lib/effects/field-engine'
import type { Composition } from '@/lib/effects/field-layout'
import { FIELD_CSS, NO_PICTURE } from '@/lib/effects/field'
import type { FieldStill } from '@/lib/effects/field-stills'
import styles from 'virtual:tw'

// DispersionField.tsx as <spyglass-dispersion-field>: the brand light drawn live in WebGL for a `composition` and a
// `seed`, drifting while on screen, a lens under a fine pointer when `interactive`, one fixed frame with reduced motion or
// `still`. The host is the box: the page's classes size and place it. `drag`, `ripple` and `stills` are properties
// (stills also as JSON). The horizon composition finds [data-light-anchor] beside the element. Decoration: aria-hidden.

const on = { fromAttribute: (v: string | null) => v !== 'false' }

/**
 * @summary The brand light drawn live in WebGL.
 */
export class DispersionField extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(FIELD_CSS('.ds-field'))]
	static properties = {
		composition: {},
		seed: { type: Number },
		interactive: { type: Boolean, converter: on },
		still: { type: Boolean },
		overlay: { type: Boolean },
		stills: { type: Array },
		drag: { attribute: false },
		ripple: { attribute: false },
	}
	/** hero, close, band, frame, logo, crown, works, ring, horizon, wordmark or run. */
	composition: Composition = 'hero'
	seed = 0
	/** A fine pointer brings a lens over the light. */
	interactive = true
	/** One fixed frame: no drift, no pointer. */
	still = false
	/** Draw on a transparent ground. */
	overlay = false
	/** Still frames per width range ({ src, media }), shown from 1024 until the field has drawn. */
	stills?: FieldStill[]
	/** The page's cards, which push and stir the light. */
	drag?: DragSource
	/** A ring's ripple. */
	ripple?: RippleSource
	private field: ReturnType<typeof mountField> = null
	private near: IntersectionObserver | null = null

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
		if (this.hasUpdated) this.mount()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.unmount()
	}

	private unmount() {
		this.near?.disconnect()
		this.near = null
		this.field?.destroy()
		this.field = null
	}

	private mount() {
		this.unmount()
		const canvas = this.renderRoot.querySelector<HTMLCanvasElement>('canvas')
		if (!canvas) return
		const near = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return
			near.disconnect()
			this.field = mountField(canvas, { composition: this.composition, seed: this.seed, interactive: this.interactive, still: this.still, drag: this.drag, ripple: this.ripple, overlay: this.overlay, scope: this.parentElement, area: this.closest('[data-light-area]') })
		}, { rootMargin: '100% 0px' })
		near.observe(canvas)
		this.near = near
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if ([...changed.keys()].some((k) => ['composition', 'seed', 'interactive', 'still', 'drag', 'ripple', 'overlay'].includes(String(k)))) this.mount()
	}

	render() {
		const stills = Array.isArray(this.stills) ? this.stills : null
		return html`<canvas class="ds-field block size-full"></canvas>${stills ? html`<picture>${stills.map((s) => html`<source media=${s.media} srcset=${s.src} />`)}<img class="ds-field-still absolute inset-0 size-full" src=${NO_PICTURE} alt="" aria-hidden="true" fetchpriority="high" decoding="async" draggable="false" /></picture>` : nothing}`
	}
}

define('dispersion-field', DispersionField)
