// The home's close (site v3/V3Close: V3Close, scatter.ts, CloseLight, CloseTags), framework-free. The scatter places
// square creatives around the headline on a seeded lattice, clear of the words and of a diagonal band the light runs
// along (one field for 768 and up, one for phones; a short run of four rising along the band). The light sweeps across
// once when half the section is on screen, waking each creative from grey to its colors as it passes; under a mouse
// the creatives near the pointer light up and lean toward it a few pixels, and a tag names the one under it. Reduced
// motion keeps every creative in color and still. The creatives are indices into `creatives` (Acme placeholders by
// default); the tags are the brand's own example findings, written for Acme.

export interface CloseCreative { src?: string; alt?: string; tone?: 1 | 2 | 3 | 4 }
export interface CloseContent { headline: string; secondary: { label: string; href: string } }

export const closeContent: CloseContent = { headline: 'Give your agents the social internet', secondary: { label: 'Get a free API key', href: '/sign-up' } }

/** Placeholder creatives the field cycles through. */
export const closeCreatives: CloseCreative[] = ([3, 2, 4, 1, 3, 4, 2, 3, 1, 4, 2, 3] as const).map((tone, i) => ({ tone, alt: `Acme creative ${i + 1}` }))

/** What the tag says over each creative (cycled with the creatives). */
export const closeTags: string[] = ['Scene: Tube held to lips', 'Product: Curry noodles', 'Hook: Does it actually work?', 'Flavor: Caramel apple', 'Ran 74 days', 'Video, ran 48 days', 'Angle: National Runners Month', 'Angle: Built for long runs', 'Carousel, 5 cards', 'Sends to acme.com', 'Running 63 days', 'Outlier post, far above its usual']

type Field = {
	sizes: readonly number[]
	cell: number
	air: number
	halfW: number
	halfH: number
	oval: { w: number; h: number }
	band: Band
	top: number
	run: readonly { x: number; y: number; size: number }[]
}

type Band = readonly (readonly [number, number, number])[]

const BAND: Band = [
	[-576, 439, 439],
	[-528, 417, 439],
	[-480, 401, 439],
	[-432, 390, 439],
	[-384, 381, 439],
	[-336, 371, 439],
	[-288, 359, 439],
	[-240, 340, 439],
	[-192, 312, 439],
	[-144, 277, 439],
	[-96, 238, 439],
	[-48, 197, 439],
	[0, 155, 439],
	[48, 136, 402],
	[96, 125, 365],
	[144, 120, 334],
	[192, 118, 306],
	[240, 119, 281],
	[288, 91, 260],
	[336, 18, 243],
	[384, -13, 232],
	[432, -37, 223],
	[480, -65, 215],
	[528, -89, 207],
	[576, -107, 194],
	[624, -125, 173],
	[672, -143, 140],
	[720, -161, 101],
	[768, -182, 65],
	[816, -204, 35],
	[864, -232, 11],
	[912, -265, -11],
	[960, -300, -33],
	[1008, -336, -60],
	[1056, -361, -87],
	[1104, -382, -108],
	[1152, -403, -128],
	[1200, -424, -148],
	[1248, -440, -168],
	[1296, -440, -189],
	[1344, -440, -209],
	[1392, -440, -229],
]

const PHONE_BAND: Band = [
	[-480, 302, 359],
	[-456, 293, 359],
	[-432, 286, 359],
	[-408, 282, 359],
	[-384, 279, 359],
	[-360, 277, 359],
	[-336, 274, 359],
	[-312, 272, 359],
	[-288, 268, 359],
	[-264, 260, 359],
	[-240, 249, 359],
	[-216, 235, 359],
	[-192, 220, 359],
	[-168, 204, 354],
	[-144, 187, 340],
	[-120, 169, 325],
	[-96, 159, 309],
	[-72, 155, 294],
	[-48, 152, 282],
	[-24, 152, 270],
	[0, 152, 260],
	[24, 155, 251],
	[48, 157, 243],
	[72, 129, 237],
	[96, 103, 233],
	[120, 90, 231],
	[144, 82, 229],
	[168, 71, 227],
	[192, 61, 226],
	[216, 51, 222],
	[240, 45, 216],
	[264, 38, 207],
	[288, 32, 193],
	[312, 26, 177],
	[336, 20, 162],
	[360, 12, 148],
	[384, 4, 138],
	[408, -6, 129],
	[432, -18, 120],
	[456, -31, 112],
]

const WIDE: Field = {
	sizes: [48, 64, 96, 128],
	cell: 160,
	air: 16,
	halfW: 1200,
	halfH: 440,
	oval: { w: 500, h: 224 },
	band: BAND,
	top: 96,
	run: [
		{ x: -80, y: 296, size: 72 },
		{ x: 112, y: 152, size: 96 },
		{ x: 368, y: 40, size: 120 },
		{ x: 568, y: -72, size: 144 },
	],
}

const PHONE: Field = {
	sizes: [40, 48, 64, 80],
	cell: 96,
	air: 16,
	halfW: 480,
	halfH: 360,
	oval: { w: 240, h: 176 },
	band: PHONE_BAND,
	top: 80,
	run: [
		{ x: -168, y: 240, size: 48 },
		{ x: -16, y: 176, size: 64 },
		{ x: 96, y: 120, size: 80 },
	],
}

const LATTICE = 8
const EDGE = 32

type Breakpoint = 'phone' | 'tablet' | 'laptop' | 'desktop'

const HEIGHTS: Record<Breakpoint, readonly number[]> = {
	phone: [640, 680, 720, 760, 800, 860, 920],
	tablet: [640, 720, 800, 880, 960, 1080, 1200, 1440],
	laptop: [640, 680, 720, 760, 800, 880, 960, 1080, 1200],
	desktop: [640, 680, 720, 760, 800, 880, 960, 1080, 1200, 1440],
}
const SHORT = 880

const LIFT: Record<Breakpoint, { a: number; b: number }> = {
	phone: { a: 208, b: 218 },
	tablet: { a: 168, b: 176 },
	laptop: { a: 196, b: 190 },
	desktop: { a: 252, b: 220 },
}
const lift = (at: Breakpoint, k: number) => Math.max(0, LIFT[at].a - LIFT[at].b * k)

const BLOCK: Record<Breakpoint, { w: number; h: number }> = {
	phone: { w: 188, h: 148 },
	tablet: { w: 288, h: 148 },
	laptop: { w: 336, h: 164 },
	desktop: { w: 392, h: 180 },
}

const PARTS: Record<Breakpoint, readonly (readonly [number, number, number, number])[]> = {
	phone: [
		[-171, -112, 343, 64],
		[-141, -24, 281, 72],
		[-59, 64, 119, 48],
	],
	tablet: [
		[-203, -116, 407, 32],
		[-214, -52, 429, 96],
		[-59, 68, 119, 48],
	],
	laptop: [
		[-203, -124, 407, 32],
		[-248, -60, 496, 112],
		[-59, 76, 119, 48],
	],
	desktop: [
		[-203, -132, 407, 32],
		[-297, -68, 594, 128],
		[-59, 84, 119, 48],
	],
}
const AIR = 16

export type Spot = {
	key: string
	x: number
	y: number
	size: number
	creative: number
	off: ('tablet' | 'short')[]
}

function random(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

const snap = (n: number) => Math.round(n / LATTICE) * LATTICE

function onBand(band: Band, x: number, y: number, size: number, air: number) {
	for (let i = 0; i < band.length - 1; i++) {
		const [x0, top0, bottom0] = band[i]
		const [x1, top1, bottom1] = band[i + 1]
		if (x1 < x - air || x0 > x + size + air) continue
		const top = Math.min(top0, top1)
		const bottom = Math.max(bottom0, bottom1)
		if (bottom >= y - air && top <= y + size + air) return true
	}
	return false
}

const touches = (
	a: { x: number; y: number; size: number },
	b: { x: number; y: number; size: number },
	air: number,
) =>
	a.x < b.x + b.size + air &&
	b.x < a.x + a.size + air &&
	a.y < b.y + b.size + air &&
	b.y < a.y + a.size + air

function clearsParts(x: number, y: number, size: number, at: Breakpoint, height: number, fieldH: number) {
	const k = height / fieldH
	const up = lift(at, k)
	const left = x * k
	const top = y * k
	const side = size * k
	return PARTS[at].every(
		([px, py, pw, ph]) =>
			left + side + AIR <= px ||
			left >= px + pw + AIR ||
			top + side + AIR <= py - up ||
			top >= py - up + ph + AIR,
	)
}

function clears(x: number, y: number, size: number, at: Breakpoint, height: number, fieldH: number) {
	const k = height / fieldH
	const up = lift(at, k)
	const left = x * k
	const right = left + size * k
	const top = y * k
	const bottom = top + size * k
	const block = BLOCK[at]
	return right <= -block.w || left >= block.w || bottom <= -block.h - up || top >= block.h - up
}

const checks = (at: readonly Breakpoint[], keep: (height: number) => boolean = () => true) =>
	at.flatMap((bp) => HEIGHTS[bp].filter(keep).map((height) => ({ bp, height })))

type Check = { bp: Breakpoint; height: number }

function build(
	field: Field,
	seed: number,
	check: Check[],
	hide: Partial<Record<'tablet' | 'short', Check[]>>,
): { field: Spot[]; run: Spot[] } {
	const { sizes, cell, air, halfW, halfH, oval, band, top, run } = field
	const fieldH = 2 * halfH
	const rand = random(seed)
	const spots: Omit<Spot, 'creative' | 'key'>[] = []
	const cols = Math.ceil(halfW / cell)
	const rows = Math.ceil((2 * halfH - top) / cell)

	for (let row = -1; row < rows; row++) {
		for (let col = -cols; col < cols; col++) {
			const cellX = col * cell
			const cellY = -halfH + top + row * cell + (col % 2 === 0 ? 0 : cell / 2)
			const near = Math.hypot((cellX + cell / 2) / oval.w, (cellY + cell / 2) / oval.h) < 1.8
			const steps = near ? sizes.slice(1) : sizes.slice(0, 3)
			const size = steps[Math.floor(rand() * steps.length)]
			const x = cellX + snap(rand() * (cell - air - size))
			const y = cellY + snap(rand() * (cell - air - size))
			const cx = x + size / 2
			const cy = y + size / 2

			if (y < -halfH + top || y + size > halfH - EDGE) continue
			if (x + size < -halfW || x > halfW) continue
			if ((cx / oval.w) ** 2 + (cy / oval.h) ** 2 < 1) continue
			if (check.some((c) => !clears(x, y, size, c.bp, c.height, fieldH))) continue

			const reach = Math.hypot(cx / oval.w, cy / oval.h)
			const chance = Math.max(0.3, 1 - (reach - 1) * 0.36)
			if (rand() > chance) continue

			if (onBand(band, x, y, size, air)) continue
			if (run.some((r) => touches(r, { x, y, size }, air))) continue

			const off = offFor(hide, (c) => clears(x, y, size, c.bp, c.height, fieldH))
			spots.push({ x, y, size, off })
		}
	}

	spots.sort((a, b) => Math.hypot(a.x, a.y * 2) - Math.hypot(b.x, b.y * 2))
	const runSpots = run.map((r) => {
		const fits = (c: Check) => clearsParts(r.x, r.y, r.size, c.bp, c.height, fieldH)
		if (!check.every(fits)) throw new Error(`close: run picture at ${r.x},${r.y} touches the words`)
		return { ...r, off: offFor(hide, fits) }
	})
	const all = [...runSpots, ...spots].map((spot, index) => ({
		...spot,
		key: `${spot.x},${spot.y}`,
		creative: index,
	}))
	return { run: all.slice(0, run.length), field: all.slice(run.length) }
}

function offFor(hide: Partial<Record<'tablet' | 'short', Check[]>>, fits: (c: Check) => boolean) {
	return (Object.keys(hide) as ('tablet' | 'short')[]).filter((name) => !hide[name]!.every(fits))
}

const wide = build(WIDE, 6, checks(['laptop', 'desktop'], (h) => h >= SHORT), { tablet: checks(['tablet'], (h) => h >= SHORT), short: checks(['tablet', 'laptop', 'desktop'], (h) => h < SHORT) })
export const spots = wide.field
export const runSpots = wide.run
const phone = build(PHONE, 8, checks(['phone']), {})
export const phoneSpots = phone.field
export const phoneRunSpots = phone.run

// ----- The light -----

const LIFT_LIT = 0.12
const FINE = '(hover: hover) and (pointer: fine)'
const SETTLE_LOG = Math.log(100)
const curveOf = (x1: number, y1: number, x2: number, y2: number) => {
	const at = (t: number, a: number, b: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t
	return (x: number) => {
		if (x <= 0) return 0
		if (x >= 1) return 1
		let lo = 0
		let hi = 1
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2
			if (at(mid, x1, x2) < x) lo = mid
			else hi = mid
		}
		return at((lo + hi) / 2, y1, y2)
	}
}
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
type Card = { el: HTMLElement; x: number; y: number; half: number; wake: number; on: number; lx: number; ly: number; out: string }

/** Runs the close's light on `section` with its sweep band; returns the function that stops it. */
export function startCloseLight(section: HTMLElement, band: HTMLElement): () => void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}
	const fine = window.matchMedia(FINE)
	const css = getComputedStyle(section)
	const v = (name: string) => css.getPropertyValue(name).trim()
	const ms = (name: string, d: number) => {
		const raw = v(name)
		const n = parseFloat(raw)
		if (!Number.isFinite(n)) return d
		return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
	}
	const num = (name: string, d: number) => {
		const n = parseFloat(v(name))
		return Number.isFinite(n) ? n : d
	}
	const c4 = v('--ds-easing-loop').match(/-?\d*\.?\d+/g)?.map(Number) ?? [0.4, 0, 0.2, 1]
	const t = {
		ease: curveOf(c4[0], c4[1], c4[2], c4[3]),
		cross: ms('--ds-loop-flick', 1400),
		change: ms('--ds-loop-change', 700),
		hold: ms('--ds-loop-step', 2600),
		rise: ms('--ds-loop-badge', 500) / SETTLE_LOG,
		fall: ms('--ds-loop-change', 700) / SETTLE_LOG,
		width: num('--ds-close-sweep-w', 640),
		tilt: Math.tan((num('--ds-close-sweep-tilt', 16) * Math.PI) / 180),
		reach: num('--ds-close-reach', 400),
		lean: num('--ds-close-lean', 4),
	}
	let cards: Card[] = []
	let w = 0
	let h = 0
	let from = 0
	let to = 0
	let clock = 0
	let started: number | null = null
	let pointer: { x: number; y: number } | null = null
	let onScreen = false
	let raf = 0
	let last = 0
	const bandAt = (time: number) => from + (to - from) * t.ease(time / t.cross)
	const wakeAt = (x: number, y: number) => {
		const left = x - t.width / 2 + t.tilt * (y - h / 2)
		let lo = 0
		let hi = t.cross
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2
			if (bandAt(mid) < left) lo = mid
			else hi = mid
		}
		return (lo + hi) / 2
	}
	const measure = () => {
		const box = section.getBoundingClientRect()
		w = box.width
		h = box.height
		const lean = (t.tilt * h) / 2
		from = -t.width - lean
		to = w + lean
		const old = new Map(cards.map((c) => [c.el, c]))
		cards = [...section.querySelectorAll<HTMLElement>('[data-spot]')].filter((el) => el.offsetWidth > 0).map((el) => {
			const r = el.getBoundingClientRect()
			const x = r.left - box.left + r.width / 2
			const y = r.top - box.top + r.height / 2
			const prev = old.get(el)
			return { el, x, y, half: r.width / 2, wake: wakeAt(x, y), on: prev?.on ?? 0, lx: prev?.lx ?? 0, ly: prev?.ly ?? 0, out: prev?.out ?? '' }
		})
	}
	const glow = (e: number, stay: boolean) => {
		if (e <= 0) return 0
		if (e < t.change) return t.ease(e / t.change)
		if (stay || e < t.change + t.hold) return 1
		return 1 - t.ease((e - t.change - t.hold) / t.change)
	}
	const pull = (c: Card, p: { x: number; y: number } | null) => {
		if (!p) return { on: 0, lx: 0, ly: 0 }
		const dx = p.x - c.x
		const dy = p.y - c.y
		const d = Math.hypot(dx, dy)
		const on = smooth(1 - Math.max(0, d - c.half) / t.reach)
		const k = (on * t.lean) / Math.max(d, t.reach / 4)
		return { on, lx: dx * k, ly: dy * k }
	}
	const write = (c: Card, lit: number) => {
		const out = `${lit.toFixed(3)} ${c.lx.toFixed(2)} ${c.ly.toFixed(2)}`
		if (out === c.out) return
		c.out = out
		c.el.style.setProperty('--lit', lit.toFixed(3))
		c.el.style.setProperty('--lx', `${c.lx.toFixed(2)}px`)
		c.el.style.setProperty('--ly', `${c.ly.toFixed(2)}px`)
	}
	const drawBand = (since: number | null) => {
		const live = since !== null && since >= 0 && since < t.cross
		band.toggleAttribute('data-live', live)
		if (live) band.style.transform = `translateX(${bandAt(since).toFixed(1)}px) skewX(${-Math.atan(t.tilt)}rad)`
	}
	const frame = (dt: number, since: number | null, p: { x: number; y: number } | null) => {
		drawBand(since)
		let moving = since !== null && since < t.cross
		for (const c of cards) {
			const goal = pull(c, p)
			if (dt === 0) {
				c.on = goal.on
				c.lx = goal.lx
				c.ly = goal.ly
			} else {
				const ease = 1 - Math.exp(-dt / (goal.on > c.on ? t.rise : t.fall))
				const move = 1 - Math.exp(-dt / t.rise)
				c.on += (goal.on - c.on) * ease
				c.lx += (goal.lx - c.lx) * move
				c.ly += (goal.ly - c.ly) * move
				if (Math.abs(goal.on - c.on) < 0.001 && Math.abs(goal.lx - c.lx) < 0.01 && Math.abs(goal.ly - c.ly) < 0.01) {
					c.on = goal.on
					c.lx = goal.lx
					c.ly = goal.ly
				} else moving = true
			}
			const e = since === null ? 0 : since - c.wake
			if (since !== null && e < t.change) moving = true
			write(c, Math.max(glow(e, true), c.on) + (since !== null && e > 0 ? c.on * LIFT_LIT : 0))
		}
		return moving
	}
	const tick = (now: number) => {
		const dt = Math.min(100, Math.max(0, now - last))
		last = now
		clock += dt
		let p: { x: number; y: number } | null = null
		if (pointer && fine.matches) {
			const box = section.getBoundingClientRect()
			p = { x: pointer.x - box.left, y: pointer.y - box.top }
		}
		raf = frame(dt, started === null ? null : clock - started, p) ? requestAnimationFrame(tick) : 0
	}
	const wake = () => {
		if (raf || !onScreen || document.hidden) return
		last = performance.now()
		raf = requestAnimationFrame(tick)
	}
	const sleep = () => {
		cancelAnimationFrame(raf)
		raf = 0
	}
	measure()
	frame(0, null, null)
	section.toggleAttribute('data-moving', true)
	const seen = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		section.toggleAttribute('data-on', onScreen)
		if (onScreen && started === null && entry.intersectionRatio >= 0.5) started = clock
		if (onScreen) wake()
		else sleep()
	}, { threshold: [0, 0.5] })
	seen.observe(section)
	const resized = new ResizeObserver(() => {
		measure()
		wake()
	})
	resized.observe(section)
	const onMove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse' || !fine.matches) return
		pointer = { x: event.clientX, y: event.clientY }
		wake()
	}
	const onLeave = () => {
		pointer = null
		wake()
	}
	const onScroll = () => {
		if (pointer) wake()
	}
	const onVisibility = () => (document.hidden ? sleep() : wake())
	section.addEventListener('pointermove', onMove, { passive: true })
	section.addEventListener('pointerleave', onLeave, { passive: true })
	window.addEventListener('scroll', onScroll, { passive: true })
	document.addEventListener('visibilitychange', onVisibility)
	fine.addEventListener('change', wake)
	return () => {
		sleep()
		seen.disconnect()
		resized.disconnect()
		section.toggleAttribute('data-moving', false)
		section.removeEventListener('pointermove', onMove)
		section.removeEventListener('pointerleave', onLeave)
		window.removeEventListener('scroll', onScroll)
		document.removeEventListener('visibilitychange', onVisibility)
		fine.removeEventListener('change', wake)
	}
}

// ----- The tag -----

type Box = { left: number; top: number; right: number; bottom: number }
type TagSpot = Box & { el: HTMLElement; tag: string }
const overlaps = (a: Box, b: Box, air: number) => a.left < b.right + air && b.left < a.right + air && a.top < b.bottom + air && b.top < a.bottom + air

/** Shows `tag` beside the creative under a mouse in `section`, clear of the words; returns the function that stops it. */
export function startCloseTags(section: HTMLElement, tag: HTMLElement): () => void {
	const fine = window.matchMedia(FINE)
	if (!fine.matches) return () => {}
	const css = getComputedStyle(tag)
	const msOf = (name: string, d: number) => {
		const raw = css.getPropertyValue(name).trim()
		const n = parseFloat(raw)
		if (!Number.isFinite(n)) return d
		return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
	}
	const pxOf = (name: string, d: number) => {
		const n = parseFloat(css.getPropertyValue(name))
		return Number.isFinite(n) ? n : d
	}
	const t = { out: msOf('--ds-duration-exit', 160), intent: msOf('--ds-close-tag-intent', 80), gap: pxOf('--ds-space-sm', 8), clear: pxOf('--ds-space-lg', 16), travel: pxOf('--ds-close-tag-travel', 4) }
	let spots: TagSpot[] = []
	let pointer: { x: number; y: number } | null = null
	let target: TagSpot | null = null
	let shown = false
	let shownAt = 0
	let timer = 0
	const measure = () => {
		const box = section.getBoundingClientRect()
		spots = [...section.querySelectorAll<HTMLElement>('[data-spot][data-tag]')].filter((el) => el.offsetWidth > 0).map((el) => {
			const r = el.getBoundingClientRect()
			return { el, tag: el.dataset.tag ?? '', left: r.left - box.left, top: r.top - box.top, right: r.right - box.left, bottom: r.bottom - box.top }
		})
	}
	const place = (spot: TagSpot, w: number, h: number) => {
		const box = section.getBoundingClientRect()
		const words = [...(section.querySelector('h2')?.parentElement?.children ?? [])].map((el) => {
			const r = el.getBoundingClientRect()
			return { left: r.left - box.left, top: r.top - box.top, right: r.right - box.left, bottom: r.bottom - box.top }
		})
		const right = { x: spot.right + t.gap, y: spot.top, dx: -1, dy: 0 }
		const left = { x: spot.left - t.gap - w, y: spot.top, dx: 1, dy: 0 }
		const sides = spot.left > box.width - spot.right ? [left, right] : [right, left]
		const options = [...sides, { x: spot.left, y: spot.bottom + t.gap, dx: 0, dy: -1 }, { x: spot.left, y: spot.top - t.gap - h, dx: 0, dy: 1 }]
		return options.find(({ x, y }) => {
			const r = { left: x, top: y, right: x + w, bottom: y + h }
			const inside = r.left >= t.clear && r.top >= t.clear && r.right <= box.width - t.clear && r.bottom <= box.height - t.clear
			return inside && !words.some((b) => overlaps(r, b, t.clear))
		}) ?? null
	}
	const show = (spot: TagSpot) => {
		tag.textContent = spot.tag
		const at = place(spot, tag.offsetWidth, tag.offsetHeight)
		if (!at) return
		tag.style.left = `${Math.round(at.x)}px`
		tag.style.top = `${Math.round(at.y)}px`
		tag.style.setProperty('--tag-from-x', `${at.dx * t.travel}px`)
		tag.style.setProperty('--tag-from-y', `${at.dy * t.travel}px`)
		tag.getBoundingClientRect()
		tag.toggleAttribute('data-shown', true)
		shown = true
	}
	const hide = () => {
		if (!shown) return
		tag.toggleAttribute('data-shown', false)
		shown = false
		shownAt = performance.now()
	}
	const aim = (spot: TagSpot | null) => {
		if (spot === target) return
		target = spot
		window.clearTimeout(timer)
		hide()
		if (!spot) return
		timer = window.setTimeout(() => {
			if (target === spot) show(spot)
		}, Math.max(t.intent, t.out - (performance.now() - shownAt)))
	}
	const update = () => {
		if (!pointer || !fine.matches) return aim(null)
		const box = section.getBoundingClientRect()
		const x = pointer.x - box.left
		const y = pointer.y - box.top
		aim(spots.find((s) => x >= s.left && x < s.right && y >= s.top && y < s.bottom) ?? null)
	}
	measure()
	const resized = new ResizeObserver(() => {
		measure()
		aim(null)
		update()
	})
	resized.observe(section)
	const onMove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		pointer = { x: event.clientX, y: event.clientY }
		update()
	}
	const onLeave = () => {
		pointer = null
		update()
	}
	const onScroll = () => {
		if (pointer) update()
	}
	section.addEventListener('pointermove', onMove, { passive: true })
	section.addEventListener('pointerleave', onLeave, { passive: true })
	window.addEventListener('scroll', onScroll, { passive: true })
	fine.addEventListener('change', update)
	return () => {
		window.clearTimeout(timer)
		resized.disconnect()
		section.removeEventListener('pointermove', onMove)
		section.removeEventListener('pointerleave', onLeave)
		window.removeEventListener('scroll', onScroll)
		fine.removeEventListener('change', update)
	}
}
