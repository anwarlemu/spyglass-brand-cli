import { ASCII_TEXTURE } from '@/lib/textures'

// The site's ASCII drift (ui/AsciiDrift): a crop of the ASCII texture tile behind a section, fading out radially from
// one side. Both flavors build the box's style here, so the crops stay the site's (AsciiDrift.module.css).
export type AsciiDriftCrop = 'mass' | 'column' | 'cluster' | 'scatter'
export type AsciiDriftFrom = 'centre' | 'left' | 'right' | 'top' | 'bottom'
export type AsciiDriftStrength = 'quiet' | 'faint' | 'hero'

const CROPS: Record<AsciiDriftCrop, [number, number]> = { mass: [-120, -592], column: [0, -16], cluster: [-336, -248], scatter: [-808, -560] }
const AT: Record<AsciiDriftFrom, string> = { centre: '50% 50%', left: '0% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' }
const OPACITY: Record<AsciiDriftStrength, string> = { quiet: 'var(--ds-ascii-quiet)', faint: 'var(--ds-ascii-faint)', hero: '1' }

/** The drift's inline style, as a CSS declaration list. */
export function asciiDriftStyle(crop: AsciiDriftCrop = 'mass', from: AsciiDriftFrom = 'centre', strength: AsciiDriftStrength = 'quiet'): string {
	const [x, y] = CROPS[crop] ?? CROPS.mass
	const core = strength === 'hero' ? 'var(--ds-ascii-hero-core)' : 'var(--ds-ascii-core)'
	const mask = `radial-gradient(farthest-side at ${AT[from] ?? AT.centre}, var(--ds-color-black) ${core}, transparent 100%)`
	return `background: url("${ASCII_TEXTURE}") ${x}px ${y}px / var(--ds-ascii-tile) var(--ds-ascii-tile) repeat; opacity: ${OPACITY[strength] ?? OPACITY.quiet}; mask-image: ${mask}; -webkit-mask-image: ${mask}`
}

/** The same as a React style object. */
export function asciiDriftStyleObject(crop?: AsciiDriftCrop, from?: AsciiDriftFrom, strength?: AsciiDriftStrength): Record<string, string> {
	const out: Record<string, string> = {}
	for (const part of asciiDriftStyle(crop, from, strength).split(/;\s(?=[a-z-]+:)/)) {
		const i = part.indexOf(':')
		const k = part.slice(0, i).trim().replace(/^-webkit-/, 'Webkit-').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
		out[k] = part.slice(i + 1).trim()
	}
	return out
}
