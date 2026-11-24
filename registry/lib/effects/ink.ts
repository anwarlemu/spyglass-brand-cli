// The colours the canvas effects paint with, read from the brand tokens at draw time (a canvas cannot read var()):
// the light's Blue, Green and Red layers at their opacities, and the ASCII characters in the text colour at 0.35.
const read = (name: string) => (globalThis.document ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : '')

/** A token's colour with an alpha, as a canvas fill. */
export function ink(token: string, alpha: number): string {
	const v = read(token)
	const hex = /^#([0-9a-f]{6})$/i.exec(v)?.[1]
	if (hex) {
		const n = parseInt(hex, 16)
		return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alpha})`
	}
	return v ? `color-mix(in srgb, ${v} ${alpha * 100}%, transparent)` : `rgb(255 255 255 / ${alpha})`
}

/** The light's three layers, Blue, Green and Red, at their opacities, with the step each is shifted by. */
export const lightChannels = () => [
	{ fill: ink('--ds-color-light-b', 0.782), step: 0 },
	{ fill: ink('--ds-color-light-g', 0.782), step: 1 },
	{ fill: ink('--ds-color-light-r', 0.85), step: 2 },
]

/** The ASCII characters: the text colour at the texture's 0.35. */
export const glyphInk = () => ink('--ds-color-fg', 0.35)
