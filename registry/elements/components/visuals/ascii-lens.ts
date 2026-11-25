import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { whilePointerEffects } from '@/lib/effects/pointer'
import styles from 'virtual:tw'

// AsciiLens.tsx as <spyglass-ascii-lens>: one per page; every ASCII drift and texture answers a mouse with a lens of
// more characters near the pointer. Renders nothing of its own. Only for a fine pointer without reduced motion.

/**
 * @summary A mouse lens over the page's ASCII drifts.
 */
export class AsciiLens extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { disabled: { type: Boolean } }
	/** Turn it off without removing it. */
	disabled = false
	private stop: (() => void) | null = null
	private run = 0

	connectedCallback() {
		super.connectedCallback()
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
		if (this.disabled) return
		this.stop = whilePointerEffects(() => import('@/lib/effects/ascii-lens').then(({ startAsciiLens }) => startAsciiLens()))
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('disabled')) this.start()
	}

	render() {
		return html`<span data-ds="ascii-lens" hidden></span>`
	}
}

define('ascii-lens', AsciiLens)
