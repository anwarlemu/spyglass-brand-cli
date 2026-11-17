// The brand light: one shape drawn three times, in Blue, Green and Red, each shifted sideways, blurred and blended
// plus-lighter on Black, so the colors separate at the edges and turn pale where all three overlap.
//
// In the brand assets every light is a window onto one heat map ("slide 1 light", MASTER_PATH) at some scale: a band
// across a post, a strip down its side, a tile beside a photo. This module does the same, deterministically:
//
//   source 'brand'      windows onto the brand's own heat map (seeds 0 to n-1 are the exact windows the brand assets
//                       use for that variant; higher seeds move and scale them a little)
//   source 'generated'  windows onto a new heat map built the same way (a dark body with the lit sea around it, a lit
//                       channel and ring along every edge, an island and loops), different for every seed
//
// Variants: band, field, corner (corner flow), strip-left, strip-right, tile, close-up and curved-strip. The output is
// geometry in the frame's pixels (one path, evenodd), which lightSvg turns into an SVG and drawLight paints on a canvas.
// No DOM, no randomness outside the seed, no dependencies: the same options give the same bytes everywhere.
import { MASTER_BOX, MASTER_PATH } from '@/lib/light-master'

export type LightVariant = 'band' | 'field' | 'corner' | 'strip-left' | 'strip-right' | 'tile' | 'close-up' | 'curved-strip'
export type LightSource = 'brand' | 'generated'
export const LIGHT_VARIANTS: LightVariant[] = ['band', 'field', 'corner', 'strip-left', 'strip-right', 'tile', 'close-up', 'curved-strip']

/** The three layers, as brand.json and tokens.css give them: each is shifted `shift` offsets to the right. */
export const LIGHT_LAYERS = [
	{ name: 'Light B', color: '#1B1DFF', opacity: 0.782, shift: 0 },
	{ name: 'Light G', color: '#00FF29', opacity: 0.782, shift: 1 },
	{ name: 'Light R', color: '#DF0000', opacity: 0.85, shift: 2 },
] as const
/** Each layer's sideways offset and the blur, as shares of the heat map's width (Figma: 44.2 and 7.8 of 2913.3). */
export const LIGHT_OFFSET = 0.0152
export const LIGHT_BLUR = 0.00268

export interface LightOptions {
	width: number
	height: number
	variant?: LightVariant
	seed?: number
	source?: LightSource
}

export interface LightGeometry {
	width: number
	height: number
	variant: LightVariant
	source: LightSource
	seed: number
	/** The lit shape in frame pixels, fill-rule evenodd. */
	d: string
	/** Each layer's shift step, in pixels. */
	offset: number
	/** The Gaussian blur's standard deviation, in pixels. */
	blur: number
}

// ----- Seeded randomness -----

/** mulberry32: a small, fast, seeded generator. */
export function seeded(seed: number) {
	let s = (seed | 0) ^ 0x2f6b1d
	return () => {
		s = (s + 0x6d2b79f5) | 0
		let t = Math.imul(s ^ (s >>> 15), 1 | s)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// ----- Windows -----
// The windows the brand assets cut from the heat map, in Figma's numbers (page "8. Brand assets"): the heat map
// frame's x and y inside the window, the heat map vector's width (Light B's; Light R sits two offsets right), and the
// window's size. They are converted to the heat map's own units below (x and y as shares of its width).
type FigmaWindow = { fx: number; fy: number; vw: number; W: number; H: number; from: string }
const WINDOWS: Record<Exclude<LightVariant, 'curved-strip'>, FigmaWindow[]> = {
	band: [
		{ fx: -251.345, fy: -111.927, vw: 2860.331, W: 1080, H: 200.291, from: 'Post, Agents on Instagram and TikTok' },
		{ fx: -1331, fy: -30, vw: 2913.3, W: 1080, H: 160, from: 'Post, Know what changed' },
		{ fx: -239, fy: -127, vw: 2913.3, W: 1080, H: 240, from: 'Ad, The only creative search engine' },
		{ fx: -1331, fy: 10, vw: 2913.3, W: 1080, H: 240, from: 'Ad, Testimonial' },
		{ fx: -453, fy: -30, vw: 2913.3, W: 1080, H: 586, from: 'Post, Any brand or creator' },
	],
	field: [
		{ fx: -929, fy: -39, vw: 2465.1, W: 1080, H: 612, from: 'Ad, Creator plan offer' },
		{ fx: -2098.636, fy: -184.092, vw: 3300.39, W: 1080, H: 810, from: 'Ad, Search millions of creators (top)' },
	],
	corner: [
		{ fx: -533, fy: -33, vw: 1725.57, W: 1080, H: 1080, from: 'Post, Offer' },
		{ fx: -929, fy: -39, vw: 2465.1, W: 1080, H: 612, from: 'Ad, Creator plan offer' },
	],
	'strip-left': [{ fx: -134, fy: -160, vw: 2241, W: 160, H: 1080, from: 'Post, Every market (left)' }],
	'strip-right': [{ fx: -2014, fy: -160, vw: 2241, W: 160, H: 1080, from: 'Post, Every market (right)' }],
	tile: [
		{ fx: -612.654, fy: -288.655, vw: 752.487, W: 111.927, H: 145.309, from: 'Post, Creative ring' },
		{ fx: -644.072, fy: -365.237, vw: 858.099, W: 127.636, H: 127.636, from: 'Post, Creative ring' },
		{ fx: -622.473, fy: -88.364, vw: 752.487, W: 111.927, H: 145.309, from: 'Post, Creative ring' },
		{ fx: -691.2, fy: -353.455, vw: 858.099, W: 127.636, H: 127.636, from: 'Post, Creative ring' },
		{ fx: -157, fy: -92, vw: 2689.2, W: 200, H: 200, from: 'Post, Any brand or creator' },
	],
	'close-up': [
		{ fx: -20, fy: -15, vw: 940.68, W: 140, H: 104, from: 'Ad, The world’s largest creative search engine' },
		{ fx: -1754, fy: -1180, vw: 2241, W: 200, H: 200, from: 'Post, Any brand or creator (light leak)' },
	],
}
/** The heat map's height as a share of its width. */
const MASTER_H = MASTER_BOX.h / MASTER_BOX.w

/** The window for a variant and seed, in heat map units: left, top, width and height (shares of its width). */
export function lightWindow(variant: Exclude<LightVariant, 'curved-strip'>, seed: number, width: number, height: number) {
	const list = WINDOWS[variant]
	const n = list.length
	const k = ((seed % n) + n) % n
	const a = list[k]!
	const w0 = a.W / a.vw
	const cx0 = -a.fx / a.vw + w0 / 2
	const cy0 = -a.fy / a.vw + a.H / a.vw / 2
	// Seeds past the brand's own windows move and scale them a little, keeping the composition.
	const rnd = seeded(seed * 7919 + 17)
	const extra = Math.abs(seed) >= n ? 1 : 0
	const w = w0 * (1 + extra * (rnd() - 0.5) * 0.16)
	const h = (w * height) / width
	let cx = cx0 + extra * (rnd() - 0.5) * w * 0.3
	let cy = cy0 + extra * (rnd() - 0.5) * h * 0.3
	// Inside the heat map where it fits: past its edge there is no light, only the edge of the frame.
	// (A margin of four blurs, so the heat map's own edge never shows as a dimmed line.)
	const m = LIGHT_BLUR * 4
	if (w < 1 - 2 * m) cx = Math.min(Math.max(cx, w / 2 + m), 1 - w / 2 - m)
	if (h < MASTER_H - 2 * m) cy = Math.min(Math.max(cy, h / 2 + m), MASTER_H - h / 2 - m)
	return { x: cx - w / 2, y: cy - h / 2, w, h, from: a.from }
}

// ----- The brand heat map, in frame pixels -----

/** MASTER_PATH (M, L, H, V and Z, absolute) mapped by (x, y) -> (ax + b, ay + c). */
function mapMaster(scale: number, tx: number, ty: number) {
	const out: string[] = []
	let x = 0
	let y = 0
	const f = (n: number) => String(Math.round(n * 10) / 10)
	for (const m of MASTER_PATH.matchAll(/([MLHVZ])([^MLHVZ]*)/g)) {
		const nums = m[2]!.trim() ? m[2]!.trim().split(/[\s,]+/).map(Number) : []
		const c = m[1]!
		if (c === 'Z') {
			out.push('Z')
			continue
		}
		if (c === 'H') x = nums[0]!
		else if (c === 'V') y = nums[0]!
		else {
			x = nums[0]!
			y = nums[1]!
		}
		out.push(`${c === 'M' ? 'M' : 'L'}${f(x * scale + tx)} ${f(y * scale + ty)}`)
	}
	return out.join('')
}

// ----- A generated heat map -----
// Built the way the brand's is: a dark body (a smooth union of ellipses and a neck to the top edge) with the lit sea
// around it, a lit island inside it, loops near its edge, and the edges meandering. Distances are in heat map units
// (shares of its width), so the channel and ring along every edge keep one width, as the brand's do.

type Field = (u: number, v: number) => number

/** Smooth value noise in [-1, 1], seeded. */
function noise2(seed: number) {
	const hash = (i: number, j: number) => {
		let h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 1442695041)
		h = Math.imul(h ^ (h >>> 13), 1274126177)
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296
	}
	const s = (t: number) => t * t * (3 - 2 * t)
	return (x: number, y: number) => {
		const i = Math.floor(x)
		const j = Math.floor(y)
		const fx = s(x - i)
		const fy = s(y - j)
		const a = hash(i, j)
		const b = hash(i + 1, j)
		const c = hash(i, j + 1)
		const d = hash(i + 1, j + 1)
		return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1
	}
}
/** Smooth maximum (a union of insides), polynomial, with blend width k. */
const smax = (a: number, b: number, k: number) => {
	const h = Math.max(k - Math.abs(a - b), 0) / k
	return Math.max(a, b) + (h * h * k) / 4
}
/** Inside distance of an ellipse (positive inside), approximate. */
const ellipse = (cx: number, cy: number, rx: number, ry: number, angle = 0): Field => {
	const cs = Math.cos(angle)
	const sn = Math.sin(angle)
	return (u, v) => {
		const dx = u - cx
		const dy = v - cy
		const x = (dx * cs + dy * sn) / rx
		const y = (-dx * sn + dy * cs) / ry
		return (1 - Math.hypot(x, y)) * Math.min(rx, ry)
	}
}
/** Inside distance of a capsule from (ax, ay) to (bx, by) with radius r. */
const capsule = (ax: number, ay: number, bx: number, by: number, r: number): Field => (u, v) => {
	const px = u - ax
	const py = v - ay
	const dx = bx - ax
	const dy = by - ay
	const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)))
	return r - Math.hypot(px - dx * t, py - dy * t)
}

/** The lit distance field of a generated heat map (positive in the lit sea), 1 unit wide and MASTER_H tall. */
export function generatedField(seed: number): Field {
	const r = seeded(seed * 104729 + 11)
	const j = (a: number) => (r() - 0.5) * 2 * a
	const n = noise2(seed)
	// The dark body, laid out as the brand's is: a main mass from about 0.08 to 0.92 across, under a sea along the top
	// edge, a foot on the bottom edge, lobes to either side, and a neck up to the top edge right of center.
	const neckU = 0.62 + j(0.06)
	const parts: Field[] = [
		ellipse(0.5 + j(0.03), 0.41 + j(0.02), 0.42 + j(0.02), 0.31 + j(0.02), j(0.12)),
		ellipse(0.5 + j(0.05), 0.66, 0.46 + j(0.03), 0.12 + j(0.02)),
		ellipse(0.26 + j(0.04), 0.22 + j(0.03), 0.16 + j(0.03), 0.1 + j(0.02), j(0.4)),
		ellipse(0.74 + j(0.03), 0.3 + j(0.04), 0.12 + j(0.03), 0.18 + j(0.03), j(0.3)),
		capsule(neckU, 0.24, neckU + j(0.04), -0.05, 0.03 + j(0.01)),
	]
	// Lit intrusions into the body: an arm from the left edge, the bottom right corner.
	const armV = 0.44 + j(0.03)
	const lit: Field[] = [
		capsule(-0.05, armV, 0.22 + j(0.04), armV + 0.03 + j(0.02), 0.024 + j(0.008)),
		ellipse(1.0, 0.64, 0.16 + j(0.03), 0.13 + j(0.03), j(0.3)),
	]
	// The island (a lit mass inside the body) and loops (rings with nothing inside), the smaller counterparts.
	const island = ellipse(0.85 + j(0.03), 0.45 + j(0.03), 0.04 + j(0.01), 0.032 + j(0.008), j(1))
	const loops = [
		[0.27 + j(0.03), armV + 0.06 + j(0.015)],
		[0.12 + j(0.1), 0.6 + j(0.01)],
	]
	// A small dark notch in the sea at the top left corner.
	const notch = ellipse(0.045 + j(0.015), 0.035 + j(0.01), 0.03 + j(0.008), 0.022 + j(0.006), j(0.4))
	return (u, v) => {
		let body = -Infinity
		for (const p of parts) body = smax(body, p(u, v), 0.06)
		// The edges meander: low-frequency noise on the body's distance.
		body += 0.03 * n(u * 4, v * 4) + 0.01 * n(u * 11 + 7, v * 11 + 3)
		let d = -body
		for (const p of lit) d = smax(d, p(u, v), 0.04)
		d = Math.min(d, -notch(u, v))
		d = smax(d, island(u, v), 0.01)
		for (const [lu, lv] of loops) d = Math.max(d, -0.006 - Math.hypot(u - lu!, v - lv!))
		return d
	}
}

/** A curved strip: a lit ribbon below a wave across the frame (the deck cover's "Curved strip"). */
function curvedStripField(seed: number): Field {
	const r = seeded(seed * 15485863 + 5)
	const n = noise2(seed + 101)
	const base = 0.52 + (r() - 0.5) * 0.06
	const amp = 0.06 + r() * 0.03
	const k = 2.4 + r() * 1.2
	const ph = r() * Math.PI * 2
	return (u, v) => {
		const wave = base + amp * Math.sin(u * k * Math.PI + ph) + 0.025 * n(u * 3, 0.5)
		const slope = amp * k * Math.PI * Math.cos(u * k * Math.PI + ph)
		return (v - wave) / Math.sqrt(1 + slope * slope)
	}
}

// ----- Contours -----
// The lit set is the sea (d > 0) and a ring along its edge (-(CHANNEL + RING) < d < -CHANNEL): with the three
// contours drawn as one evenodd path, the sea is lit, the channel dark, the ring lit and the rest dark.
const CHANNEL = 0.0085
const RING = 0.0105

type Pt = [number, number]

/** Closed contours of a grid at a level (marching squares), as point loops in grid coordinates. */
function contours(grid: Float64Array, cols: number, rows: number, level: number): Pt[][] {
	const at = (i: number, j: number) => grid[j * cols + i]! - level
	// Edges: horizontal edge (i, j)-(i+1, j) is id 2*(j*cols+i), vertical edge (i, j)-(i, j+1) is id 2*(j*cols+i)+1.
	const point = (e: number): Pt => {
		const k = e >> 1
		const i = k % cols
		const j = (k - i) / cols
		if (e & 1) {
			const a = at(i, j)
			const b = at(i, j + 1)
			return [i, j + a / (a - b)]
		}
		const a = at(i, j)
		const b = at(i + 1, j)
		return [i + a / (a - b), j]
	}
	const next = new Map<number, number>()
	const H = (i: number, j: number) => 2 * (j * cols + i)
	const V = (i: number, j: number) => 2 * (j * cols + i) + 1
	for (let j = 0; j < rows - 1; j++) {
		for (let i = 0; i < cols - 1; i++) {
			const a = at(i, j) > 0 ? 1 : 0
			const b = at(i + 1, j) > 0 ? 1 : 0
			const c = at(i + 1, j + 1) > 0 ? 1 : 0
			const d = at(i, j + 1) > 0 ? 1 : 0
			const code = a * 8 + b * 4 + c * 2 + d
			const top = H(i, j)
			const right = V(i + 1, j)
			const bottom = H(i, j + 1)
			const left = V(i, j)
			// Segments run with the inside (above the level) on their right, so loops come out consistently wound.
			const seg = (from: number, to: number) => next.set(from, to)
			switch (code) {
				case 1: seg(bottom, left); break
				case 2: seg(right, bottom); break
				case 3: seg(right, left); break
				case 4: seg(top, right); break
				case 5: {
					const center = (at(i, j) + at(i + 1, j) + at(i + 1, j + 1) + at(i, j + 1)) / 4
					if (center > 0) { seg(top, left); seg(bottom, right) } else { seg(top, right); seg(bottom, left) }
					break
				}
				case 6: seg(top, bottom); break
				case 7: seg(top, left); break
				case 8: seg(left, top); break
				case 9: seg(bottom, top); break
				case 10: {
					const center = (at(i, j) + at(i + 1, j) + at(i + 1, j + 1) + at(i, j + 1)) / 4
					if (center > 0) { seg(left, bottom); seg(right, top) } else { seg(left, top); seg(right, bottom) }
					break
				}
				case 11: seg(right, top); break
				case 12: seg(left, right); break
				case 13: seg(bottom, right); break
				case 14: seg(left, bottom); break
			}
		}
	}
	const loops: Pt[][] = []
	const seen = new Set<number>()
	for (const start of next.keys()) {
		if (seen.has(start)) continue
		const loop: Pt[] = []
		let e: number | undefined = start
		while (e !== undefined && !seen.has(e)) {
			seen.add(e)
			loop.push(point(e))
			e = next.get(e)
		}
		if (loop.length > 2) loops.push(loop)
	}
	return loops
}

/** A closed loop as a smooth path: quadratic curves through the midpoints, with the points as controls. */
function smoothPath(loop: Pt[], map: (p: Pt) => Pt) {
	// Every other point is enough for curves through the midpoints (the blur hides less), and halves the path.
	const pts = (loop.length > 12 ? loop.filter((_, i) => i % 2 === 0) : loop).map(map)
	const f = (n: number) => String(Math.round(n * 10) / 10)
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
	const n = pts.length
	const start = mid(pts[n - 1]!, pts[0]!)
	let d = `M${f(start[0])} ${f(start[1])}`
	for (let i = 0; i < n; i++) {
		const p = pts[i]!
		const m = mid(p, pts[(i + 1) % n]!)
		d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`
	}
	return `${d}Z`
}

/** A field's lit shape in a window, as an evenodd path in frame pixels. */
function fieldPath(field: Field, win: { x: number; y: number; w: number; h: number }, width: number, height: number) {
	// Cells about 1/140 of the window's longer side, and a margin past the frame wide enough for the blur and the shifted layers.
	const cell = Math.max(win.w, win.h) / 140
	const margin = LIGHT_OFFSET * 2 + LIGHT_BLUR * 4 + cell * 2
	const pad = Math.ceil(margin / cell)
	const cols = Math.ceil(win.w / cell) + 2 * pad + 1
	const rows = Math.ceil(win.h / cell) + 2 * pad + 1
	const grid = new Float64Array(cols * rows)
	for (let j = 0; j < rows; j++) {
		for (let i = 0; i < cols; i++) {
			// The outermost cells close every contour outside the frame.
			const edge = i === 0 || j === 0 || i === cols - 1 || j === rows - 1
			grid[j * cols + i] = edge ? -1 : field(win.x + (i - pad) * cell, win.y + (j - pad) * cell)
		}
	}
	const sx = width / win.w
	const sy = height / win.h
	const map = (p: Pt): Pt => [(p[0] - pad) * cell * sx, (p[1] - pad) * cell * sy]
	const paths: string[] = []
	for (const level of [0, -CHANNEL, -(CHANNEL + RING)]) for (const loop of contours(grid, cols, rows, level)) paths.push(smoothPath(loop, map))
	return paths.join('')
}

// ----- Geometry -----

/** The light for a frame: its lit shape in frame pixels, the layers' offset and the blur. */
export function lightGeometry(options: LightOptions): LightGeometry {
	const { width, height } = options
	const variant = options.variant ?? 'band'
	const seed = Math.trunc(options.seed ?? 0)
	const source = options.source ?? 'brand'
	if (!(width > 0 && height > 0)) throw new Error('lightGeometry needs a width and a height above 0')
	if (!LIGHT_VARIANTS.includes(variant)) throw new Error(`Unknown light variant \`${variant}\`. Variants: ${LIGHT_VARIANTS.join(', ')}.`)
	if (variant === 'curved-strip') {
		// The deck's curved strip spans 2240 units across a 1920 frame: the heat map is about 1.17 frames wide.
		const w = 1 / 1.17
		const win = { x: (1 - w) / 2, y: 0.52 - (w * height) / width / 2, w, h: (w * height) / width }
		const px = width / win.w
		return { width, height, variant, source, seed, d: fieldPath(curvedStripField(seed), win, width, height), offset: LIGHT_OFFSET * px, blur: LIGHT_BLUR * px }
	}
	const win = lightWindow(variant, seed, width, height)
	const px = width / win.w
	const d = source === 'brand'
		? mapMaster(px / MASTER_BOX.w, -MASTER_BOX.x * (px / MASTER_BOX.w) - win.x * px, -MASTER_BOX.y * (px / MASTER_BOX.w) - win.y * px)
		: fieldPath(generatedField(seed), win, width, height)
	return { width, height, variant, source, seed, d, offset: LIGHT_OFFSET * px, blur: LIGHT_BLUR * px }
}

const num = (n: number) => String(Math.round(n * 100) / 100)

export interface LightSvgOptions extends LightOptions {
	/** Paint the Black ground under the light (default true). */
	ground?: boolean
	/** 'css' blends the layers with mix-blend-mode: plus-lighter (browsers); 'filter' adds them in an SVG filter,
	 * which renders the same on Black and also in rasterizers without CSS blend modes (resvg). Default 'css'. */
	blend?: 'css' | 'filter'
	/** A prefix for the ids inside the SVG, so several can sit on one page. */
	id?: string
}

/** The light as a standalone SVG document. */
export function lightSvg(options: LightSvgOptions): string {
	const g = lightGeometry(options)
	const id = options.id ?? `sg-light-${g.variant}-${g.seed}`
	const ground = options.ground !== false ? `<rect width="${num(g.width)}" height="${num(g.height)}" fill="#000000"/>` : ''
	const head = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${num(g.width)}" height="${num(g.height)}" viewBox="0 0 ${num(g.width)} ${num(g.height)}" style="isolation:isolate">`
	const shape = `<path id="${id}-shape" fill-rule="evenodd" d="${g.d}"/>`
	if (options.blend === 'filter') {
		// One filter adds the three tinted, shifted, blurred copies of the shape's alpha: plus-lighter, in SVG.
		const tint = (c: string, o: number) => {
			const [r, gr, b] = [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16) / 255)
			return `0 0 0 0 ${num(r! * o)} 0 0 0 0 ${num(gr! * o)} 0 0 0 0 ${num(b! * o)} 0 0 0 ${o} 0`
		}
		const steps = LIGHT_LAYERS.map((l, i) => `<feOffset in="blur" dx="${num(g.offset * l.shift)}" dy="0" result="o${i}"/><feColorMatrix in="o${i}" type="matrix" values="${tint(l.color, l.opacity)}" result="c${i}"/>`).join('')
		const add = '<feComposite in="c0" in2="c1" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="a01"/><feComposite in="a01" in2="c2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>'
		return `${head}<defs><filter id="${id}-add" x="0" y="0" width="${num(g.width)}" height="${num(g.height)}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${num(g.blur)}" result="blur"/>${steps}${add}</filter></defs>${ground}<g filter="url(#${id}-add)"><path fill="#FFFFFF" fill-rule="evenodd" d="${g.d}"/></g></svg>`
	}
	const uses = LIGHT_LAYERS.map((l) => `<use xlink:href="#${id}-shape" href="#${id}-shape" x="${num(g.offset * l.shift)}" fill="${l.color}" opacity="${l.opacity}" filter="url(#${id}-blur)" style="mix-blend-mode:plus-lighter"/>`).join('')
	return `${head}<defs>${shape}<filter id="${id}-blur" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${num(g.blur)}"/></filter></defs>${ground}<g style="isolation:isolate">${uses}</g></svg>`
}

/** The parts of a 2D canvas context drawLight uses (a browser canvas or a node-canvas one). */
export interface LightCanvas {
	save(): void
	restore(): void
	translate(x: number, y: number): void
	fill(path: unknown, rule?: 'evenodd' | 'nonzero'): void
	fillStyle: unknown
	globalAlpha: number
	globalCompositeOperation: string
	filter: string
}

/** Paints the light onto a canvas that is already Black (or transparent over Black). Path2D comes from the caller's
 * environment (globalThis.Path2D in a browser). */
export function drawLight(ctx: LightCanvas, g: LightGeometry, Path: new (d: string) => unknown = (globalThis as unknown as { Path2D: new (d: string) => unknown }).Path2D) {
	const path = new Path(g.d)
	ctx.save()
	ctx.globalCompositeOperation = 'lighter'
	ctx.filter = `blur(${g.blur}px)`
	for (const l of LIGHT_LAYERS) {
		ctx.save()
		ctx.translate(g.offset * l.shift, 0)
		ctx.globalAlpha = l.opacity
		ctx.fillStyle = l.color
		ctx.fill(path, 'evenodd')
		ctx.restore()
	}
	ctx.restore()
}
