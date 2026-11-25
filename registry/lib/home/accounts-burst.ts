// The site's accounts burst (v2/V2Features AccountsBurst, accountsBurst.data.ts, accountsBurst.ring.ts and
// useAccountsBurst.ts), framework-free: a search chip types through places (the scrub) and settles on a query, shrinks,
// and a ring of creatives bursts out around it and gathers back into the answer, which morphs into the brand's row
// (its numbers, then a live bar filling as the search adds accounts), holds, and morphs back into the next search's
// chip. 60 frames a second while a quarter of it is on screen; reduced motion holds the first answer among its ring.
// The rows are Acme placeholders and the creatives placeholder tones (pass your own through each search's `images`,
// used in turn, the answer's picture last).

import type { ImageSlot } from '@/lib/image'

export interface BurstRow { name: string; category: string; instagram: string; tiktok: string | null; activeAds: number; logo?: string }
export interface BurstSearch { query: string; scrub: string[]; added: number; pool: (1 | 2 | 3 | 4)[]; answer: 1 | 2 | 3 | 4; row: BurstRow; /** The creatives the search finds ({ src, alt, fit, position }), used in turn; placeholder tones without them. */ images?: ImageSlot[] }
export interface BurstContent { aiLabel: string; columns: { instagram: string; tiktok: string; meta: string }; searching: string; added: string; searches: BurstSearch[] }

export const burstContent: BurstContent = {
	aiLabel: 'AI',
	columns: { instagram: 'Instagram', tiktok: 'TikTok', meta: 'active ads' },
	searching: 'Searching live',
	added: 'This search added {n} accounts',
	searches: [{'query': 'running shoes in the US', 'scrub': ['pet food in the UK', 'coffee in Colombia', 'candles in Sweden', 'swimwear in Brazil', 'skincare in Korea', 'denim in Italy', 'sunglasses in Spain', 'watches in Switzerland', 'luggage in Germany', 'outdoor gear in Canada', 'yoga mats in India', 'gym wear in Australia', 'sportswear in France', 'basketball in the US', 'sneakers in Korea', 'trainers in the UK', 'trail running in Chile', 'marathons in Kenya', 'run clubs in Mexico', 'running gear in the US', 'road running in the US', 'running socks in the US', 'running shoes in the US'], 'added': 3, 'pool': [3, 2, 4, 1, 3, 4, 2], 'answer': 3, 'row': {'name': 'Acme Run', 'category': 'Athletic shoes', 'instagram': '290.8M', 'tiktok': null, 'activeAds': 1361}}, {'query': 'makeup in Dubai', 'scrub': ['golf in Scotland', 'pet food in Australia', 'coffee in Vietnam', 'kombucha in the US', 'protein in the UK', 'vitamins in Germany', 'wellness in Bali', 'fitness in Brazil', 'athleisure in Canada', 'handbags in Italy', 'fashion in France', 'haircare in Nigeria', 'nail polish in Japan', 'lip gloss in Mexico', 'skincare in Korea', 'serums in Saudi Arabia', 'sunscreen in Qatar', 'fragrance in Oman', 'cosmetics in Kuwait', 'beauty in the UAE', 'lipstick in Dubai', 'skincare in Dubai', 'makeup in Dubai'], 'added': 5, 'pool': [2, 4, 1, 3, 4, 2, 3], 'answer': 2, 'row': {'name': 'Acme Beauty', 'category': 'Makeup', 'instagram': '56.3M', 'tiktok': null, 'activeAds': 491}}] as BurstSearch[],
}

export const FPS = 60

export const CUT = 80
export const RING_FROM = 80
export const RING_TO = 172
export const MORPH_FROM = 173
export const LANDED = 181

export const CHIP_CY = 535

export const LABEL_FRAMES = [
	0, 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65,
]

export const CHIP_SCALE = [
	1, 0.9858, 0.9788, 0.9717, 0.9646, 0.9575, 0.9528, 0.9481, 0.9434, 0.9387, 0.934, 0.934, 0.9292, 0.9245,
	0.9245, 0.9198, 0.9198, 0.9151, 0.9151, 0.9104, 0.9104, 0.9104, 0.908, 0.9057, 0.9057, 0.9009, 0.9009,
	0.9009, 0.9009, 0.8986, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8962,
	0.8962, 0.8962, 0.8962, 0.8962, 0.8962, 0.8939, 0.8915, 0.8915, 0.8915, 0.8915, 0.8915, 0.8915, 0.8915,
	0.8892, 0.8868, 0.8868, 0.8868, 0.8821, 0.8821, 0.8821, 0.8774, 0.8774, 0.875, 0.8726, 0.8679, 0.8632,
	0.8632, 0.8585, 0.8538, 0.8491, 0.8443, 0.8396, 0.8349, 0.8255, 0.8208, 0.8113, 0.7995, 0.783, 0.7689,
	0.7311,
]

export const WELL_SCALE = [
	0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986,
	0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986,
	0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986,
	0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.8986, 0.9459, 0.973, 0.9865, 1, 1.0135, 1.0135, 1.0135,
	1.0135, 1.0405, 1.0405, 1.0405, 1.0405, 1.0405, 1.0405, 1.0541, 1.0541, 1.0541, 1.0541, 1.0541, 1, 0.973,
	0.9595, 0.9459, 0.9324, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122, 0.9122,
]

export const RING_PHI = [
	31.77, 31.29, 30.81, 30.33, 29.85, 29.37, 28.89, 28.41, 27.93, 27.45, 26.97, 26.49, 26.01, 25.53, 25.05,
	24.57, 24.09, 23.61, 23.13, 22.65, 22.17, 21.69, 21.21, 20.73, 20.25, 19.77, 19.29, 18.81, 18.33, 17.85,
	17.37, 17.04, 16.36, 15.9, 14.84, 14.29, 13.8, 13.48, 12.87, 12.4, 11.88, 11.46, 11.15, 10.65, 10.16, 9.75,
	9.29, 8.81, 8.36, 7.85, 7.6, 7.15, 6.81, 6.31, 5.86, 5.38, 4.94, 4.33, 3.85, 3.51, 2.89, 2.48, 2.14, 1.61,
	0.87, 0.27, 0, -0.46, -1.07, -1.59, -2.14, -2.59, -3.33, -4.06, -4.53, -5.35, -5.86, -6.51, -7.18, -8,
	-8.73, -9.43, -10.21, -10.99, -11.77, -12.55, -13.33, -14.11, -14.89, -15.67, -16.45, -17.23, -18.01,
]
export const RING_K = [
	0.013, 0.127, 0.217, 0.278, 0.327, 0.363, 0.394, 0.424, 0.455, 0.486, 0.515, 0.544, 0.567, 0.59, 0.611,
	0.631, 0.647, 0.662, 0.677, 0.695, 0.709, 0.726, 0.739, 0.756, 0.769, 0.782, 0.793, 0.803, 0.812, 0.821,
	0.836, 0.844, 0.853, 0.861, 0.876, 0.881, 0.888, 0.899, 0.905, 0.912, 0.917, 0.922, 0.929, 0.935, 0.94,
	0.945, 0.949, 0.955, 0.958, 0.961, 0.966, 0.97, 0.97, 0.973, 0.979, 0.98, 0.986, 0.986, 0.987, 0.988, 0.991,
	0.993, 0.996, 0.996, 0.997, 0.998, 0.998, 1.002, 1.001, 1.004, 0.999, 1.003, 1.003, 1.003, 1.002, 0.999,
	0.994, 0.987, 0.972, 0.958, 0.941, 0.923, 0.881, 0.847, 0.805, 0.76, 0.713, 0.635, 0.531, 0.36, 0.19, 0.044,
	0.014,
]

export const SLOTS = [
	{ theta: 163.3, r: 326 },
	{ theta: -147.6, r: 290 },
	{ theta: -26.4, r: 288 },
	{ theta: 44.4, r: 304 },
	{ theta: 107.5, r: 223 },
	{ theta: -80.1, r: 242 },
]

export const SHOTS: [slot: number, from: number, to: number, w: number, h: number][] = [
	[0, 80, 82, 256, 335],
	[1, 80, 84, 192, 251],
	[2, 80, 84, 172, 224],
	[3, 80, 82, 256, 335],
	[4, 80, 82, 172, 224],
	[5, 80, 84, 256, 335],
	[0, 82, 86, 256, 335],
	[3, 82, 86, 256, 335],
	[4, 82, 86, 172, 224],
	[1, 84, 88, 192, 251],
	[2, 84, 88, 172, 224],
	[5, 84, 88, 256, 335],
	[0, 86, 90, 256, 335],
	[3, 86, 90, 256, 335],
	[4, 86, 90, 172, 224],
	[1, 88, 92, 192, 251],
	[2, 88, 92, 172, 224],
	[5, 88, 92, 256, 335],
	[0, 90, 94, 256, 335],
	[3, 90, 94, 256, 335],
	[4, 90, 94, 172, 224],
	[1, 92, 96, 192, 251],
	[2, 92, 96, 172, 224],
	[5, 92, 96, 256, 335],
	[0, 94, 98, 256, 335],
	[3, 94, 98, 256, 335],
	[4, 94, 98, 172, 224],
	[1, 96, 100, 192, 251],
	[2, 96, 100, 172, 224],
	[5, 96, 100, 256, 335],
	[0, 98, 102, 256, 335],
	[3, 98, 102, 256, 335],
	[4, 98, 102, 172, 224],
	[1, 100, 104, 192, 251],
	[2, 100, 104, 172, 224],
	[5, 100, 104, 256, 335],
	[0, 102, 106, 256, 335],
	[3, 102, 106, 256, 335],
	[4, 102, 106, 172, 224],
	[1, 104, 108, 192, 251],
	[2, 104, 108, 172, 224],
	[5, 104, 108, 256, 335],
	[0, 106, 110, 256, 335],
	[3, 106, 110, 231, 328],
	[4, 106, 110, 172, 224],
	[1, 108, 112, 192, 251],
	[2, 108, 112, 172, 224],
	[5, 108, 112, 256, 335],
	[0, 110, 114, 256, 335],
	[3, 110, 114, 241, 329],
	[4, 110, 114, 172, 224],
	[1, 112, 116, 192, 251],
	[2, 112, 116, 172, 224],
	[5, 112, 116, 256, 335],
	[0, 114, 118, 256, 335],
	[3, 114, 118, 256, 335],
	[4, 114, 118, 172, 224],
	[1, 116, 120, 192, 251],
	[2, 116, 120, 172, 224],
	[5, 116, 120, 256, 335],
	[0, 118, 122, 256, 335],
	[3, 118, 122, 249, 333],
	[4, 118, 122, 172, 224],
	[1, 120, 124, 192, 251],
	[2, 120, 124, 172, 224],
	[5, 120, 124, 256, 335],
	[0, 122, 126, 256, 335],
	[3, 122, 126, 256, 335],
	[4, 122, 126, 172, 224],
	[1, 124, 128, 192, 251],
	[2, 124, 128, 172, 224],
	[5, 124, 128, 256, 335],
	[0, 126, 130, 256, 335],
	[3, 126, 130, 256, 335],
	[4, 126, 130, 155, 219],
	[1, 128, 132, 192, 251],
	[2, 128, 132, 172, 224],
	[5, 128, 132, 256, 335],
	[0, 130, 134, 256, 335],
	[3, 130, 134, 256, 335],
	[4, 130, 134, 172, 224],
	[1, 132, 136, 192, 251],
	[2, 132, 136, 172, 224],
	[5, 132, 136, 256, 335],
	[0, 134, 138, 256, 335],
	[3, 134, 138, 256, 335],
	[4, 134, 138, 172, 224],
	[1, 136, 140, 192, 251],
	[2, 136, 140, 172, 224],
	[5, 136, 140, 231, 329],
	[0, 138, 142, 256, 335],
	[3, 138, 142, 256, 335],
	[4, 138, 142, 167, 222],
	[1, 140, 144, 192, 251],
	[2, 140, 144, 172, 224],
	[5, 140, 144, 241, 328],
	[0, 142, 146, 168, 252],
	[3, 142, 146, 256, 335],
	[4, 142, 146, 172, 224],
	[1, 144, 148, 192, 251],
	[2, 144, 148, 172, 224],
	[5, 144, 148, 256, 335],
	[0, 146, 149, 256, 335],
	[3, 146, 150, 256, 335],
	[4, 146, 150, 172, 224],
	[1, 148, 152, 192, 251],
	[2, 148, 152, 172, 224],
	[5, 148, 152, 250, 333],
	[0, 150, 153, 256, 335],
	[3, 150, 154, 256, 335],
	[4, 150, 154, 172, 224],
	[1, 152, 156, 192, 251],
	[2, 152, 156, 112, 166],
	[5, 152, 156, 256, 335],
	[0, 153, 157, 256, 335],
	[3, 154, 158, 256, 335],
	[4, 154, 158, 172, 224],
	[1, 156, 160, 192, 251],
	[2, 156, 159, 172, 224],
	[5, 156, 160, 256, 335],
	[0, 157, 161, 256, 335],
	[3, 158, 162, 256, 335],
	[4, 158, 162, 172, 224],
	[2, 159, 163, 172, 224],
	[1, 160, 164, 192, 251],
	[5, 160, 164, 256, 335],
	[0, 161, 165, 256, 335],
	[3, 162, 166, 170, 249],
	[4, 162, 166, 172, 224],
	[2, 163, 167, 172, 224],
	[1, 164, 168, 192, 251],
	[5, 164, 168, 256, 335],
	[0, 165, 169, 256, 335],
	[3, 166, 170, 256, 335],
	[4, 166, 170, 172, 224],
	[2, 167, 171, 172, 224],
	[1, 168, 172, 192, 251],
	[5, 168, 172, 256, 335],
	[0, 169, 173, 256, 335],
	[3, 170, 173, 256, 335],
	[4, 170, 173, 172, 224],
	[2, 171, 173, 172, 224],
	[1, 172, 173, 192, 251],
	[5, 172, 173, 256, 335],
]

export const MORPH = [
	{ pw: 0.3274, ph: 0.2629, cy: 537.5, r: 0.2676, pic: 0.8, face: 0 },
	{ pw: 0.5536, ph: 0.5103, cy: 537.5, r: 0.5085, pic: 0.45, face: 0.25 },
	{ pw: 0.7083, ph: 0.6907, cy: 537, r: 0.6965, pic: 0.15, face: 0.48 },
	{ pw: 0.8333, ph: 0.8247, cy: 536, r: 0.8, pic: 0, face: 0.77 },
	{ pw: 0.9167, ph: 0.9124, cy: 535.5, r: 0.8861, pic: 0, face: 0.93 },
	{ pw: 0.9643, ph: 0.9639, cy: 534.5, r: 0.9459, pic: 0, face: 0.985 },
	{ pw: 0.9821, ph: 0.9897, cy: 535, r: 0.979, pic: 0, face: 1 },
	{ pw: 0.994, ph: 1, cy: 535, r: 0.5849, pic: 0, face: 1 },
]

export const LIVE_CELLS = 8

export const STILL = 140

export const LAST = SHOTS.reduce((best, s, i) => (s[1] === RING_TO && s[0] > SHOTS[best][0] ? i : best), 0)

function smooth(values: readonly number[], half: number) {
	return values.map((v, i) => {
		const k = Math.min(half, Math.floor(i / 2), Math.floor((values.length - 1 - i) / 2))
		if (k < 2) return v
		let s2 = 0
		let s4 = 0
		let y0 = 0
		let y2 = 0
		for (let j = -k; j <= k; j++) {
			s2 += j * j
			s4 += j ** 4
			y0 += values[i + j]
			y2 += j * j * values[i + j]
		}
		const n = 2 * k + 1
		return (s4 * y0 - s2 * y2) / (n * s4 - s2 * s2)
	})
}

const PHI = smooth(RING_PHI, 6)
const K = smooth(RING_K, 4)
const CHIP = smooth(CHIP_SCALE, 6)
const WELL = WELL_SCALE.map((v, i, a) =>
	i < 2 || i > a.length - 3 ? v : (a[i - 2] + 4 * a[i - 1] + 6 * v + 4 * a[i + 1] + a[i + 2]) / 16,
)

const at = (curve: readonly number[], i: number) => {
	const a = Math.max(0, Math.min(curve.length - 1, i))
	const lo = Math.floor(a)
	const hi = Math.min(curve.length - 1, lo + 1)
	return curve[lo] + (curve[hi] - curve[lo]) * (a - lo)
}

export const chipScale = (f: number) => at(CHIP, f)
export const wellScale = (f: number) => at(WELL, f)
export const WELL_FROM = WELL[0]

export const labelAt = (scrub: readonly string[], f: number) => {
	let i = 0
	while (i + 1 < LABEL_FRAMES.length && LABEL_FRAMES[i + 1] <= f) i++
	return scrub[i]
}

export function ringOffset(index: number, f: number) {
	const [slot] = SHOTS[index]
	const { theta, r } = SLOTS[slot]
	const i = f - RING_FROM
	const k = at(K, i)
	const a = ((theta + at(PHI, i)) * Math.PI) / 180
	return [k * r * Math.cos(a), k * r * Math.sin(a)]
}

export const unitMove = (dx: number, dy: number) =>
	`translate(calc(var(--u) * ${dx.toFixed(2)}), calc(var(--u) * ${dy.toFixed(2)}))`

export const visibleAt = (f: number) =>
	SHOTS.flatMap(([, from, to], i) => (f >= CUT && f <= RING_TO && from <= f && f < to ? [i] : []))


/** The tone of shot `i` in search `s`: the answer last, the pool's tones around it. */
export const castTone = (s: BurstSearch, i: number) => (i === LAST ? s.answer : s.pool[i % s.pool.length])
/** The image of shot `i` in search `s` (its images in turn), or none for the placeholder. */
export const castImage = (s: BurstSearch, i: number): ImageSlot => (s.images?.length ? s.images[i % s.images.length] : {})
/** Every label the chip can show, to size it to the longest. */
export const allLabels = (searches: BurstSearch[]) => [...new Set(searches.flatMap((s) => s.scrub))]
export const addedLabel = (c: BurstContent, n: number) => c.added.replace('{n}', String(n))

const STEP_MS = 1000 / FPS
const HOLD_FRAME = 72
const HOLD_MAX = 6000

/** Plays the burst on `root` (the element with the chip, the shots and the boxes); returns the function that stops it. */
export function startAccountsBurst(root: HTMLElement, searches: BurstSearch[]): () => void {
	const chip = root.querySelector<HTMLElement>('[data-ab-chip]')
	const well = root.querySelector<HTMLElement>('[data-ab-well]')
	const label = root.querySelector<HTMLElement>('[data-ab-label]')
	const boxes = searches.map((_, q) => root.querySelector<HTMLElement>(`[data-box="${q}"]`))
	if (!chip || !well || !label || boxes.some((b) => !b)) return () => {}
	const shots = searches.map((_, q) => SHOTS.map((__, i) => root.querySelector<HTMLElement>(`[data-shot="${q}-${i}"]`)!))
	const part = (box: HTMLElement, k: string) => box.querySelector<HTMLElement>(`[data-k="${k}"]`)!
	const faces = boxes.map((box) => ({ box: box!, pic: part(box!, 'pic'), row: part(box!, 'row'), chip: part(box!, 'chip'), live: part(box!, 'live'), lit: part(box!, 'lit'), unlit: part(box!, 'unlit') }))
	const css = getComputedStyle(root)
	const tokenMs = (name: string, d: number) => {
		const raw = css.getPropertyValue(name).trim()
		const n = parseFloat(raw)
		if (!Number.isFinite(n)) return d
		return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
	}
	const n = searches.length
	const hold = Math.round(tokenMs('--ds-loop-step', 2600) / STEP_MS)
	const span = LANDED + hold + MORPH.length
	const search = Math.round(tokenMs('--ds-loop-change', 700) / STEP_MS)
	const loop = span * n
	let u = 1
	let chipW = 0
	let chipH = 0
	let picR = 4
	let rowR = 8
	let chipR = 8
	const rows = faces.map(() => ({ w: 0, h: 0 }))
	const measure = () => {
		u = Math.min(root.clientWidth, root.clientHeight) / 1080
		chipW = chip.offsetWidth
		chipH = chip.offsetHeight
		picR = parseFloat(css.getPropertyValue('--ds-radius-sm')) || 4
		rowR = parseFloat(css.getPropertyValue('--ds-radius-control')) || 8
		chipR = parseFloat(getComputedStyle(chip).borderTopLeftRadius) || rowR
		faces.forEach((face, q) => (rows[q] = { w: face.box.offsetWidth, h: face.box.offsetHeight }))
		const [, , , pw, ph] = SHOTS[LAST]
		faces.forEach((face) => {
			Object.assign(face.pic.style, { width: `${pw * u}px`, height: `${ph * u}px`, margin: `${(-ph * u) / 2}px 0 0 ${(-pw * u) / 2}px` })
			Object.assign(face.chip.style, { width: `${chipW}px`, height: `${chipH}px`, margin: `${-chipH / 2}px 0 0 ${-chipW / 2}px` })
		})
	}
	const morph = (q: number, i: number, from: { w: number; h: number }, to: { w: number; h: number }, fromR: number, toR: number, cy: number) => {
		const m = MORPH[i]
		const { box } = faces[q]
		const w = from.w + m.pw * (to.w - from.w)
		const h = from.h + m.ph * (to.h - from.h)
		const r = Math.min(fromR + m.ph * (toR - fromR), w / 2, h / 2)
		const sx = w / rows[q].w
		const sy = h / rows[q].h
		box.style.transform = `translateY(${((cy - CHIP_CY) * u).toFixed(2)}px) scale(${sx}, ${sy})`
		box.style.borderRadius = `${r / sx}px / ${r / sy}px`
		const counter = `scale(${1 / sx}, ${1 / sy})`
		for (const k of ['pic', 'row', 'chip'] as const) faces[q][k].style.transform = counter
	}
	const rest = (q: number) => {
		const face = faces[q]
		face.box.style.transform = ''
		face.box.style.borderRadius = ''
		for (const k of ['pic', 'row', 'chip'] as const) face[k].style.transform = ''
	}
	let shown: [number, number][] = []
	let boxOn = -1
	let chipOn: boolean | null = null
	let text = ''
	let drawnT = -1
	let drawnG = -1
	const showShots = (next: [number, number][], f: number) => {
		for (const [q, i] of shown) if (!next.some(([a, b]) => a === q && b === i)) shots[q][i].style.visibility = 'hidden'
		for (const [q, i] of next) {
			const el = shots[q][i]
			const [dx, dy] = ringOffset(i, f)
			el.style.transform = unitMove(dx, dy)
			el.style.visibility = 'visible'
		}
		shown = next
	}
	const showBox = (q: number) => {
		if (boxOn === q) return
		if (boxOn >= 0) faces[boxOn].box.style.visibility = 'hidden'
		if (q >= 0) faces[q].box.style.visibility = 'visible'
		boxOn = q
	}
	const showChip = (on: boolean) => {
		if (chipOn === on) return
		chip.style.visibility = on ? 'visible' : 'hidden'
		chipOn = on
	}
	const lives = faces.map(() => -1)
	const live = (q: number, lf: number) => {
		const lit = lf < 0 ? 0 : Math.min(LIVE_CELLS, Math.floor((lf * LIVE_CELLS) / search) + 1)
		const state = lit + (lf >= search ? 1 : 0)
		if (lives[q] === state) return
		lives[q] = state
		const face = faces[q]
		face.live.dataset.state = lf >= search ? 'added' : 'searching'
		face.lit.textContent = '#'.repeat(lit)
		face.unlit.textContent = '-'.repeat(LIVE_CELLS - lit)
	}
	const fade = (q: number, pic: number, row: number, chipFace: number) => {
		faces[q].pic.style.opacity = String(pic)
		faces[q].row.style.opacity = String(row)
		faces[q].chip.style.opacity = String(chipFace)
	}
	const ready: boolean[] = []
	const started: boolean[] = []
	const images = (el: Element): HTMLImageElement[] => [...el.querySelectorAll('*')].flatMap((x) => [...(x instanceof HTMLImageElement ? [x] : []), ...(x.shadowRoot ? [...x.shadowRoot.querySelectorAll('img')] : [])])
	const prepare = (q: number) => {
		if (started[q]) return
		started[q] = true
		const imgs = [...shots[q], faces[q].pic].flatMap((el) => images(el))
		Promise.all(imgs.map((img) => img.decode().catch(() => {}))).then(() => (ready[q] = true))
	}
	const whole = (t: number) => Math.floor(t + 0.25)
	const draw = (t: number) => {
		if (t === drawnT) return
		drawnT = t
		const g = whole(t)
		const q = Math.floor(g / span) % n
		const f = g % span
		const ft = f + (t - g)
		const s = searches[q]
		showChip(f < CUT)
		if (f < CUT) {
			chip.style.transform = `scale(${chipScale(ft).toFixed(4)})`
			well.style.transform = `scale(${wellScale(ft).toFixed(4)})`
			const next = labelAt(s.scrub, f)
			if (next !== text) label.textContent = text = next
		}
		showShots(visibleAt(f).map((i) => [q, i]), ft)
		if (g === drawnG) return
		drawnG = g
		if (f < MORPH_FROM) return showBox(-1)
		showBox(q)
		const row = rows[q]
		if (f < LANDED) {
			const i = f - MORPH_FROM
			const [, , , pw, ph] = SHOTS[LAST]
			morph(q, i, { w: pw * u, h: ph * u }, row, picR, rowR, MORPH[i].cy)
			fade(q, MORPH[i].pic, MORPH[i].face, 0)
			live(q, -1)
		} else if (f < LANDED + hold) {
			rest(q)
			fade(q, 0, 1, 0)
			live(q, f - LANDED)
		} else {
			const i = f - LANDED - hold
			morph(q, i, row, { w: chipW, h: chipH }, rowR, chipR, CHIP_CY)
			fade(q, 0, MORPH[i].pic, MORPH[i].face)
			live(q, search)
		}
	}
	const redraw = () => {
		const t = drawnT
		drawnT = -1
		drawnG = -1
		if (t >= 0) draw(t)
	}
	const still = () => {
		drawnT = -1
		drawnG = -1
		showChip(false)
		showShots(visibleAt(STILL).map((i) => [0, i]), STILL)
		showBox(0)
		rest(0)
		fade(0, 0, 1, 0)
		live(0, search)
	}
	shown = visibleAt(STILL).map((i) => [0, i])
	boxOn = 0
	text = label.textContent ?? ''
	measure()
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
	let raf = 0
	let onScreen = false
	let last = 0
	let clock = LANDED * STEP_MS
	let held = 0
	let phased = -1
	const tick = (now: number) => {
		const dt = last ? Math.min(now - last, 100) : 0
		last = now
		clock += dt
		let t = clock / STEP_MS
		const g = whole(t)
		const q = Math.floor(g / span) % n
		const f = g % span
		prepare(q)
		prepare((q + 1) % n)
		if (q !== phased) {
			phased = q
			t = g
			clock = t * STEP_MS
		}
		if (f >= HOLD_FRAME && f < CUT && !ready[q] && held < HOLD_MAX) {
			held += dt
			t = g - f + HOLD_FRAME
			clock = t * STEP_MS
		} else if (f >= CUT) held = 0
		draw(t % loop)
		raf = requestAnimationFrame(tick)
	}
	const update = () => {
		cancelAnimationFrame(raf)
		raf = 0
		last = 0
		if (reduced.matches) return still()
		draw((clock / STEP_MS) % loop)
		if (onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(tick)
	}
	const io = new IntersectionObserver((entries) => {
		onScreen = entries[entries.length - 1].isIntersecting
		update()
	}, { threshold: 0.25 })
	const ro = new ResizeObserver(() => {
		measure()
		redraw()
	})
	io.observe(root)
	ro.observe(root)
	document.addEventListener('visibilitychange', update)
	reduced.addEventListener('change', update)
	update()
	return () => {
		cancelAnimationFrame(raf)
		io.disconnect()
		ro.disconnect()
		document.removeEventListener('visibilitychange', update)
		reduced.removeEventListener('change', update)
	}
}
