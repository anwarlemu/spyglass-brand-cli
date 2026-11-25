import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { whilePointerEffects } from '@/lib/effects/pointer'
import styles from 'virtual:tw'

// AsciiTrail.tsx as <spyglass-ascii-trail>: a mouse leaves a short trail of ASCII characters that fades in 700ms.
// `mode` section (absolute in the section around it; the page's classes size it) or page (fixed behind the page). Only
// for a fine pointer, 768 wide and up, without reduced motion. The host is the box. Decoration: aria-hidden.

/**
 * @summary A fading ASCII trail behind the pointer.
 */
export class AsciiTrail extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { mode: { reflect: true } }
	/** section or page. */
	mode: 'section' | 'page' = 'section'
	private stop: (() => void) | null = null
	private run = 0

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
		if (this.hasUpdated) this.start()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.halt()
	}

	private halt() {
		this.run++
		this.stop?.()
		this.stop = null
	}

	private start() {
		this.halt()
		const canvas = this.renderRoot.querySelector('canvas')
		if (!canvas) return
		const mode = this.mode === 'page' ? 'page' : 'section'
		const area = this.parentElement
		this.stop = whilePointerEffects(() => import('@/lib/effects/ascii-trail').then(({ startTrail }) => startTrail(canvas, mode, area)))
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('mode')) this.start()
	}

	render() {
		return html`<canvas data-ascii-trail=${this.mode} class="block size-full text-fg"></canvas>`
	}
}

define('ascii-trail', AsciiTrail)
