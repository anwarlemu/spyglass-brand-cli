// The ASCII texture: a field of Geist Mono characters from the ramp " .:-=+*#", read off a soft heat map, set in White
// at 0.35 opacity on Black. In the brand assets it is a text layer 13.333px with a 1.2 line height (8px advance, 16px
// lines on the 1080px canvas): soft clusters, dense at their cores (# and *) and thinning to . and : at their edges,
// kept clear of text, the logo and photos. Deterministic: the same options give the same characters everywhere.
import { seeded } from '@/lib/light'

export const ASCII_RAMP = ' .:-=+*#'
/** Geist Mono at the canvas size: 13.333px, line height 1.2, advance 0.6em. */
export const ASCII_FONT = { size: 13.333, leading: 1.2, advance: 0.6, opacity: 0.35 }

export interface AsciiRect { x: number; y: number; w: number; h: number }

/** A line as SVG text draws it: spaces as no-break spaces (the same advance in a monospace face), so leading and
 * repeated spaces keep their width in every renderer instead of collapsing. */
export const asciiText = (line: string) => line.replace(/ /g, '\u00a0')

export interface AsciiOptions {
	/** Columns and rows of characters. */
	cols: number
	rows: number
	seed?: number
	/** How much of the field is covered, 0 to 1 (default 0.5, as the brand assets). */
	density?: number
	/** Areas to keep clear (text, the logo, photos), in cells; the texture fades out around them. */
	clear?: AsciiRect[]
}

/** Smooth step from 0 at a to 1 at b. */
const smooth = (a: number, b: number, x: number) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
	return t * t * (3 - 2 * t)
}

/** The texture as lines of text, `rows` lines of `cols` characters. */
export function asciiLines(options: AsciiOptions): string[] {
	const { cols, rows } = options
	const seed = Math.trunc(options.seed ?? 0)
	const density = Math.min(1, Math.max(0, options.density ?? 0.5))
	if (!(cols > 0 && rows > 0)) throw new Error('asciiLines needs cols and rows above 0')
	const rnd = seeded(seed * 31337 + 3)
	// Clusters: wide, low ellipses (characters are twice as tall as wide, and the brand's clusters run sideways).
	const count = Math.max(2, Math.round(((cols * rows) / 1500) * (0.3 + density)))
	const blobs = Array.from({ length: count }, () => ({
		x: rnd() * cols,
		y: rnd() * rows,
		sx: 4 + rnd() * 11,
		sy: 1.5 + rnd() * 3,
		a: 0.65 + rnd() * 0.7,
		tilt: (rnd() - 0.5) * 0.5,
	}))
	// Grain: a per-cell hash, so cores break into "### ##" as the brand's do.
	const grain = (i: number, j: number) => {
		let h = Math.imul(i + 1, 374761393) + Math.imul(j + 1, 668265263) + Math.imul(seed + 7, 1442695041)
		h = Math.imul(h ^ (h >>> 13), 1274126177)
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296
	}
	const lines: string[] = []
	for (let j = 0; j < rows; j++) {
		let line = ''
		for (let i = 0; i < cols; i++) {
			let v = 0
			for (const b of blobs) {
				const dx = i - b.x
				const dy = j - b.y + dx * b.tilt * 0.1
				v += b.a * Math.exp(-((dx * dx) / (2 * b.sx * b.sx) + (dy * dy) / (2 * b.sy * b.sy)))
			}
			// Soft edges at the frame and around the clear areas.
			let keep = 1
			for (const r of options.clear ?? []) {
				const dx = Math.max(r.x - i, 0, i - (r.x + r.w))
				const dy = Math.max(r.y - j, 0, j - (r.y + r.h)) * 2
				keep = Math.min(keep, smooth(0, 6, Math.hypot(dx, dy)))
			}
			v = Math.min(1.2, v) * keep
			const g = grain(i, j)
			v += (g - 0.5) * 0.3
			// A few stray dots on the empty ground, as the brand's texture has.
			const k = v < 0.2 ? (g > 0.994 && keep > 0.9 ? 1 : 0) : Math.min(ASCII_RAMP.length - 1, Math.floor(((v - 0.2) / 0.8) * (ASCII_RAMP.length - 1)) + 1)
			line += ASCII_RAMP[k]
		}
		lines.push(line.replace(/\s+$/, ''))
	}
	return lines
}

export interface AsciiSvgOptions extends Omit<AsciiOptions, 'cols' | 'rows'> {
	width: number
	height: number
	/** Character size in px (default 13.333, the canvas size). */
	size?: number
	/** Paint the Black ground (default false: the texture sits behind the light on a page that is already Black). */
	ground?: boolean
	/** The font family to name (default "Geist Mono"). */
	font?: string
	/** Areas to keep clear, in pixels. */
	clearPx?: AsciiRect[]
}

/** The grid for a frame: how many characters fit across and down at a size. */
export function asciiGrid(width: number, height: number, size = ASCII_FONT.size) {
	const cw = size * ASCII_FONT.advance
	const lh = size * ASCII_FONT.leading
	return { cols: Math.ceil(width / cw), rows: Math.ceil(height / lh), cw, lh }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const num = (n: number) => String(Math.round(n * 1000) / 1000)

/** The texture as a standalone SVG: one <text> per row, White at 0.35 opacity. */
export function asciiSvg(options: AsciiSvgOptions): string {
	const size = options.size ?? ASCII_FONT.size
	const { cols, rows, cw, lh } = asciiGrid(options.width, options.height, size)
	const clear = [...(options.clear ?? []), ...(options.clearPx ?? []).map((r) => ({ x: r.x / cw, y: r.y / lh, w: r.w / cw, h: r.h / lh }))]
	const lines = asciiLines({ cols, rows, seed: options.seed, density: options.density, clear })
	const font = options.font ?? 'Geist Mono'
	const ground = options.ground ? `<rect width="${num(options.width)}" height="${num(options.height)}" fill="#000000"/>` : ''
	const text = lines.map((l, j) => (l.trim() ? `<text x="0" y="${num(j * lh + size * 0.95)}">${esc(asciiText(l))}</text>` : '')).join('')
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(options.width)}" height="${num(options.height)}" viewBox="0 0 ${num(options.width)} ${num(options.height)}">${ground}<g fill="#FFFFFF" fill-opacity="${ASCII_FONT.opacity}" font-family="${font}, ui-monospace, monospace" font-size="${num(size)}" xml:space="preserve" style="white-space:pre">${text}</g></svg>`
}

/** The parts of a 2D canvas context drawAscii uses. */
export interface AsciiCanvas {
	save(): void
	restore(): void
	fillText(text: string, x: number, y: number): void
	font: string
	fillStyle: unknown
	globalAlpha: number
	textBaseline: string
}

/** Paints the texture onto a canvas (its font must be loaded). */
export function drawAscii(ctx: AsciiCanvas, lines: string[], size = ASCII_FONT.size, font = 'Geist Mono') {
	ctx.save()
	ctx.font = `${size}px "${font}", ui-monospace, monospace`
	ctx.fillStyle = '#FFFFFF'
	ctx.globalAlpha = ASCII_FONT.opacity
	ctx.textBaseline = 'alphabetic'
	lines.forEach((l, j) => ctx.fillText(l, 0, j * size * ASCII_FONT.leading + size * 0.95))
	ctx.restore()
}
