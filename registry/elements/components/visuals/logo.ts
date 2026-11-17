import { html } from 'lit'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { DsElement, define } from '@/elements/lib/element'
import { LOGOS, type LogoVariant } from '@/lib/logos'
import styles from 'virtual:tw'

// Logo.tsx as <spyglass-logo>: every lockup from the brand's own files (lib/logos.ts), Black or White only. `tone`
// auto takes the text color; `height` sizes it (px) and its width follows. Never stretched, recolored or outlined.
export type LogoTone = 'auto' | 'white' | 'black'
const TONES: Record<LogoTone, string> = { auto: 'text-fg', white: 'text-(--ds-color-white)', black: 'text-(--ds-color-black)' }

/**
 * @summary The logo: a lockup from the brand's files.
 */
export class Logo extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { variant: {}, tone: {}, height: { type: Number }, label: { attribute: 'aria-label' } }
	/** mark, wordmark, horizontal, vertical, mark-3d, horizontal-3d or vertical-3d. */
	variant: LogoVariant = 'horizontal'
	/** auto (the text color), white or black. */
	tone: LogoTone = 'auto'
	/** Height in px. */
	height = 28
	/** The accessible name (aria-label on the element). */
	label = 'Spyglass'

	render() {
		const l = LOGOS[this.variant] ?? LOGOS.horizontal
		const width = Math.round(((this.height * l.width) / l.height) * 100) / 100
		return html`<svg data-ds="logo" role="img" aria-label=${this.label} viewBox="0 0 ${l.width} ${l.height}" fill="currentColor" style="height: ${this.height}px; width: ${width}px;" class=${['block shrink-0', TONES[this.tone] ?? TONES.auto].join(' ')}>${unsafeSVG(l.body)}</svg>`
	}
}

define('logo', Logo)
