import { html, nothing, svg } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { ASCII_FONT, asciiGrid, asciiLines, asciiText, type AsciiRect } from '@/lib/ascii'
import styles from 'virtual:tw'

// AsciiTexture.tsx as <spyglass-ascii-texture>: Geist Mono characters from " .:-=+*#" off a soft heat map, White at
// 0.35 opacity, from the seeded generator (lib/ascii.ts). The element is the box; it keeps the frame's proportions
// unless `cover`. `clear` (a JSON list of {x, y, w, h} in the frame's px) keeps areas free. Decoration: aria-hidden.

/**
 * @summary The ASCII texture, generated from a seed.
 */
export class AsciiTexture extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		seed: { type: Number },
		density: { type: Number },
		width: { type: Number },
		height: { type: Number },
		clear: { type: Array },
		cover: { type: Boolean },
	}
	seed = 0
	/** How much of the frame is covered, 0 to 1. */
	density = 0.5
	/** The frame it is drawn for, in px. */
	width = 1080
	height = 1080
	/** Areas to keep clear, in the frame's px. */
	clear: AsciiRect[] = []
	/** Fill the box its classes give it instead of keeping the frame's proportions. */
	cover = false

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		const { cols, rows, cw, lh } = asciiGrid(this.width, this.height)
		const lines = asciiLines({ cols, rows, seed: this.seed, density: this.density, clear: (this.clear ?? []).map((r) => ({ x: r.x / cw, y: r.y / lh, w: r.w / cw, h: r.h / lh })) })
		this.style.aspectRatio = this.cover ? '' : `${this.width} / ${this.height}`
		return html`<svg viewBox="0 0 ${this.width} ${this.height}" preserveAspectRatio="xMidYMid slice" class="block size-full fill-fg font-code"><g fill-opacity=${ASCII_FONT.opacity} font-size=${ASCII_FONT.size} xml:space="preserve" class="whitespace-pre">${lines.map((line, j) => (line.trim() ? svg`<text x="0" y=${Math.round((j * lh + ASCII_FONT.size * 0.95) * 1000) / 1000}>${asciiText(line)}</text>` : nothing))}</g></svg>`
	}
}

define('ascii-texture', AsciiTexture)
