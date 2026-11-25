import { html, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { CURSOR_CSS, startCursor, type CursorMode } from '@/lib/effects/cursor'
import { whilePointerEffects } from '@/lib/effects/pointer'
import styles from 'virtual:tw'

// CursorEffects.tsx as <spyglass-cursor-effects>: one cursor effect for the page on a fixed canvas behind it, `mode`
// trail (default), lens, burst or off. Only for a fine pointer, 768 wide and up, without reduced motion. Decoration.

/**
 * @summary The page's cursor effect: a light trail, an ASCII lens or a burst.
 */
export class CursorEffects extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(CURSOR_CSS)]
	static properties = { mode: { reflect: true } }
	/** trail, lens, burst or off. */
	mode: CursorMode = 'trail'
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
		if (!canvas || this.mode === 'off') return
		const mode = this.mode
		this.stop = whilePointerEffects(() => startCursor(mode, canvas))
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('mode')) this.start()
	}

	render() {
		return html`<canvas data-ds="cursor-effects" data-mode=${this.mode} class="ds-cursor"></canvas>`
	}
}

define('cursor-effects', CursorEffects)
