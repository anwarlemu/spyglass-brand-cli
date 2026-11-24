import { html, unsafeCSS } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { DsElement, define } from '@/elements/lib/element'
import { LOGOS } from '@/lib/logos'
import { startWordmarkGlow } from '@/lib/effects/wordmark-glow'
import { GLOW_CSS, wordmarkMask } from '@/lib/effects/wordmark-glow-css'
import styles from 'virtual:tw'

// WordmarkGlow.tsx as <spyglass-wordmark-glow>: the big wordmark over a faint dot grid; a mouse lights the dots and the
// letters near it in the spectrum. Children go after the wordmark (the default slot). The host is the area: the page's
// classes size and pad it. Only for a fine pointer.

/**
 * @summary The big wordmark whose dots and letters light up under the pointer.
 * @slot - What follows the wordmark inside the area.
 */
export class WordmarkGlow extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(GLOW_CSS)]
	private stop: (() => void) | null = null

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated && !this.stop) this.start()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = null
	}

	private start() {
		this.style.setProperty('--ds-glow-wordmark', wordmarkMask())
		this.stop = startWordmarkGlow(this, this.renderRoot)
	}

	protected firstUpdated(changed: Map<PropertyKey, unknown>) {
		super.firstUpdated(changed)
		this.start()
	}

	render() {
		const w = LOGOS.wordmark
		return html`<span class="ds-glow-grid" aria-hidden="true"></span><span class="ds-glow-dots" data-glow-dots="" aria-hidden="true"></span><div class="relative w-full [container-type:inline-size]" data-glow-word="" aria-hidden="true" style=${`aspect-ratio: ${w.width} / ${w.height}`}><svg viewBox="0 0 ${w.width} ${w.height}" class="absolute inset-0 block size-full fill-wordmark-gray">${unsafeSVG(w.body)}</svg><span class="ds-glow-letters" data-glow-letters=""></span></div><slot></slot>`
	}
}

define('wordmark-glow', WordmarkGlow)
