// The home's features (site v2/V2Features: V2Features, MediaStrip, PatternsTally, v2/V2Why GraphRing, and the motion in
// v2/motion/findSimilar.ts and saveFromAnywhere.ts), framework-free: the copy and the timelines of three of the four
// pictures (the fourth, the accounts burst, is lib/home/accounts-burst.ts). Brands, creatives and platforms are Acme
// placeholders and plain names: the site shows other companies' ads and the platforms' marks, which never ship.
import { type Frame, type Timeline, type Track } from '@/lib/home/demo'
import { setData, setStyle, setText, span, type Scene, type Tokens } from '@/lib/home/scene'

export interface FeaturesContent {
	headline: string
	lead: string
	media: { title: string; body: string }
	accounts: { title: string; body: string }
	entity: { title: string; body: string }
	patterns: { title: string; body: string }
}

export const featuresContent: FeaturesContent = {
	headline: 'What your agents get',
	lead: 'Ads, organic posts, creators and landing pages from Meta, Instagram and TikTok, each structured so your agents can use it directly.',
	media: { title: 'Every ad library and social channel', body: 'Meta, Instagram and TikTok live today, with Google Ads, LinkedIn Ads and Pinterest coming next.' },
	accounts: { title: 'Every industry, every market', body: 'Search any brand, creator or keyword. If it isn’t in the archive yet, Spyglass finds it live and adds it to our internal index.' },
	entity: { title: 'One schema, one record', body: 'Reels, posts and ads from every channel resolve to the brand or creator behind them, in one schema your agents can read.' },
	patterns: { title: 'Insights, already computed', body: 'Which posts were boosted to paid, where each ad sends people, how a brand’s media mix is shifting. Worked out before your agents ask.' },
}

// ----- The media strip (find similar) -----

export interface MediaAd { h: number; ratio: number; tone: 1 | 2 | 3 | 4; src?: string; days?: number; views?: string; ago?: number }
export interface MediaContent { query: string; across: string; soon: string; live: string[]; later: string[]; days: string; views: string; ago: string; summary: string }

export const mediaContent: MediaContent = {
	query: 'Ads and posts that ask a question',
	across: 'Search across',
	soon: 'Soon',
	live: ['Meta', 'Instagram', 'TikTok'],
	later: ['Google Ads', 'LinkedIn', 'Pinterest'],
	days: '{n} days live',
	views: '{n} views',
	ago: '{n}d ago',
	summary: 'A search across Meta, Instagram and TikTok (Google Ads, LinkedIn and Pinterest coming soon) for ads and posts that ask a question lines up twelve matching ads and posts, each ad with how long it has run, each post with its views and when it went up.',
}

export const mediaAds: MediaAd[] = [
	{ h: 28, ratio: 0.8, tone: 3, days: 39 },
	{ h: 52, ratio: 0.8, tone: 2, days: 12 },
	{ h: 48, ratio: 0.8, tone: 4, days: 64 },
	{ h: 44, ratio: 1, tone: 3, views: '86K', ago: 12 },
	{ h: 44, ratio: 0.8, tone: 1, days: 33 },
	{ h: 40, ratio: 0.8, tone: 4, days: 9 },
	{ h: 44, ratio: 0.5625, tone: 2, views: '1.2M', ago: 41 },
	{ h: 40, ratio: 1.25, tone: 3, views: '312K', ago: 26 },
	{ h: 48, ratio: 0.8, tone: 4, days: 27 },
	{ h: 44, ratio: 0.5625, tone: 2, views: '378K', ago: 62 },
	{ h: 32, ratio: 1, tone: 1, days: 21 },
	{ h: 44, ratio: 0.8, tone: 3, days: 47 },
]

const MEDIA_STEP = 1000 / 30
const CAMERA = [0, 0.14, 0.14, 0.14, 0.28, 0.55, 0.69, 0.97, 1.39, 1.8, 2.36, 3.05, 4.03, 5.14, 6.67, 8.75, 11.67, 16.39, 23.05, 29.47, 34.22, 37.69, 40.47, 42.97, 44.92, 46.72, 48.39, 49.92, 51.17, 52.28, 53.39, 54.5, 55.47, 56.3, 57.14, 57.97, 58.8, 59.5, 60.19, 60.75, 61.44, 62.14, 62.55, 63.11, 63.76, 64.1, 64.59, 65.14, 65.42, 65.91, 66.25, 66.77, 67.32, 68.15, 68.71, 69.54, 70.52, 71.49, 72.6, 73.85, 75.24, 76.77, 78.43, 80.24, 82.18, 84.54, 86.9, 89.68, 92.74, 96.21, 100.1, 104.44, 109.35, 115.19, 121.99, 130.33, 140.33, 153.39, 170.48, 193.12, 218.29, 239.61, 255.93, 268.51, 278.73, 287.2, 294.42, 300.67, 306.09, 310.95, 315.39, 319.14, 322.75, 326.11, 329.02, 331.81, 334.31, 336.74, 338.89, 340.83, 342.71, 344.45, 346.04, 347.52, 348.91, 350.3, 351.41, 352.52, 353.63, 354.47, 355.44, 356.27, 357.06, 357.82, 358.38, 358.93, 359.49, 360.05, 360.46, 360.88, 361.16, 361.57, 361.78, 361.99, 362.27, 362.41, 362.55, 362.62, 362.68, 362.75, 362.82, 362.68, 362.48, 362.12, 361.57, 360.74, 359.77, 358.59, 356.99, 355.16, 353.08, 350.44, 347.38, 343.75, 339.51, 334.51, 328.33, 320.95, 311.85, 300.39, 285.12, 264.4, 235.02, 198, 164.64, 139.5, 120.33, 105.35, 93.15, 82.88, 73.99, 66.25, 59.5, 53.53, 48.11, 43.25, 38.8, 34.92, 31.27, 28.01, 25, 22.36, 19.86, 17.5, 15.42, 13.61, 11.8, 10.28, 8.89, 7.64, 6.39, 5.42, 4.44, 3.61, 2.92, 2.22, 1.67, 1.25, 0.83, 0.55, 0.28, 0.14, 0.14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
const MEDIA_LOOP = CAMERA.length * MEDIA_STEP
const TRACK: { x: number; on: number; off: number | null }[] = [{ x: 0, on: 0, off: null }, { x: 33.25, on: 19, off: 170 }, { x: 72.6, on: 44, off: 162 }, { x: 110.05, on: 71, off: 158 }, { x: 147.7, on: 76, off: 156 }, { x: 182.7, on: 78, off: 154 }, { x: 209.4, on: 80, off: 154 }, { x: 236.35, on: 81, off: 153 }, { x: 278.45, on: 83, off: 151 }, { x: 313.45, on: 87, off: 150 }, { x: 340.3, on: 93, off: 147 }, { x: 367.15, on: 112, off: 139 },]
const GAP = 1.2
export const MEDIA_HOLD = 128

/** Where each ad sits in the row (cqw) and how far the camera has carried at each slot. */
export function mediaLayout(widths: readonly number[]): { lefts: number[]; slots: number[] } {
	const lefts: number[] = []
	widths.forEach((w, i) => lefts.push(i === 0 ? 50 - w / 2 : lefts[i - 1] + widths[i - 1] + GAP))
	return { lefts, slots: lefts.map((x) => x - lefts[0]) }
}

export function mediaCarry(slots: readonly number[]): number[] {
	const ours = (p: number) => {
		let k = 0
		while (k < TRACK.length - 2 && p > TRACK[k + 1].x) k++
		const f = (p - TRACK[k].x) / (TRACK[k + 1].x - TRACK[k].x)
		return slots[k] + f * (slots[k + 1] - slots[k])
	}
	return CAMERA.map(ours)
}

export const mediaShown = (i: number, frame: number) => frame >= TRACK[i].on && (TRACK[i].off === null || frame < TRACK[i].off!)
const mediaAt = (frame: number) => ((((frame - MEDIA_HOLD) * MEDIA_STEP) % MEDIA_LOOP) + MEDIA_LOOP) % MEDIA_LOOP
const camX = (cam: number): Keyframe => ({ transform: `translateX(${(-cam).toFixed(2)}cqw)` })
export const mediaRest = (cam: readonly number[]) => -cam[MEDIA_HOLD]

/** The strip's timeline: the row glides one way and back, each ad cutting in and out as it passes. */
export function mediaTimeline(cam: readonly number[]): (root: HTMLElement) => Timeline {
	return (root) => {
		const row = root.querySelector('[data-row]')
		const ads = [...root.querySelectorAll('[data-ad]')]
		const rowFrames: Frame[] = cam.map((c, f) => ({ at: mediaAt(f), style: camX(c) }))
		const adTracks = ads.map((el, i) => {
			const frames: Frame[] = []
			for (const f of [TRACK[i].on, TRACK[i].off]) {
				if (f === null || f === 0) continue
				const t = mediaAt(f)
				frames.push({ at: t - 1, style: { opacity: mediaShown(i, f - 1) ? 1 : 0 } }, { at: t, style: { opacity: mediaShown(i, f) ? 1 : 0 } })
			}
			return { el, rest: { opacity: mediaShown(i, MEDIA_HOLD) ? 1 : 0 }, frames }
		})
		return { duration: MEDIA_LOOP, tracks: [{ el: row, rest: camX(cam[MEDIA_HOLD]), frames: rowFrames }, ...adTracks] }
	}
}

// ----- The graph ring (save from anywhere) -----

export type RingSlot = 30 | -150 | -30 | 150 | -90 | 90
export interface RingNode { key: string; kind: string; source: string; angle: RingSlot; look: 'mark' | 'post' | 'page' | 'face'; tone?: 1 | 2 | 3 | 4; src?: string }
export interface RingContent { brand: string; nodes: RingNode[]; summary: string }

export const ringContent: RingContent = {
	brand: 'Acme',
	nodes: [
		{ key: 'brand', kind: 'Acme', source: 'Brand entity', angle: 30, look: 'mark' },
		{ key: 'ads', kind: 'Ad', source: 'Meta', angle: -150, look: 'post', tone: 3 },
		{ key: 'organic', kind: 'Reel', source: 'Instagram', angle: -30, look: 'post', tone: 2 },
		{ key: 'tiktok', kind: 'Post', source: 'TikTok', angle: 150, look: 'post', tone: 4 },
		{ key: 'creators', kind: 'Creator post', source: 'TikTok', angle: -90, look: 'face', tone: 2 },
		{ key: 'landing', kind: 'Landing page', source: 'Linked from ads', angle: 90, look: 'page', tone: 3 },
	],
	summary: 'Acme’s mark, its one brand entity, opens to show creative from every channel resolved to it: an ad (Meta), a reel (Instagram), a post (TikTok), a creator post (TikTok) and a landing page linked from ads.',
}

const RING_STEP = 1000 / 60
const PX = 0.075
const RING_FRAMES = 208
export const RING_LOOP = RING_FRAMES * RING_STEP
const RADIUS = 295.83
const TWIST = -10.85
const PROGRESS = [0, 0.0923, 0.1433, 0.1765, 0.2159, 0.2441, 0.2755, 0.3007, 0.3242, 0.3451, 0.3666, 0.385, 0.4031, 0.4217, 0.4371, 0.4522, 0.4687, 0.4828, 0.4972, 0.5108, 0.5236, 0.5363, 0.5486, 0.5604, 0.5714, 0.5821, 0.5944, 0.6036, 0.6134, 0.6247, 0.634, 0.6425, 0.6523, 0.6613, 0.6693, 0.6778, 0.6861, 0.6933, 0.7022, 0.7107, 0.7167, 0.7238, 0.7323, 0.739, 0.7449, 0.7513, 0.7573, 0.7622, 0.7696, 0.7755, 0.7817, 0.7872, 0.7939, 0.7994, 0.8056, 0.8097, 0.8147, 0.8214, 0.8243, 0.83, 0.8342, 0.8396, 0.8449, 0.8499, 0.8539, 0.8581, 0.8603, 0.8659, 0.8694, 0.8725, 0.8785, 0.881, 0.8847, 0.8879, 0.8909, 0.8961, 0.8997, 0.9023, 0.9048, 0.9082, 0.9114, 0.9141, 0.9172, 0.9204, 0.9228, 0.9269, 0.9281, 0.9324, 0.9345, 0.9377, 0.9401, 0.94, 0.943, 0.9462, 0.9491, 0.949, 0.9516, 0.9552, 0.9581, 0.957, 0.9608, 0.9635, 0.9643, 0.9669, 0.9657, 0.9684, 0.9713, 0.9707, 0.9745, 0.9741, 0.9766, 0.9771, 0.9803, 0.9794, 0.9833, 0.9834, 0.9834, 0.9869, 0.9872, 0.9866, 0.9874, 0.9902, 0.9906, 0.9901, 0.9905, 0.9933, 0.9933, 0.9931, 0.9939, 0.994, 0.9964, 0.9964, 0.997, 0.9971, 0.9971, 0.9971, 0.9972, 0.9996, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.9946, 0.9883, 0.9828, 0.9725, 0.961, 0.9467, 0.9313, 0.9131, 0.8919, 0.8649, 0.8391, 0.8059, 0.7678, 0.723, 0.6715, 0.6078, 0.5315, 0.4327, 0.2926, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
const SCALE = [0.6, 0.647, 0.696, 0.746, 0.758, 0.774, 0.777, 0.787, 0.797, 0.805, 0.811, 0.816, 0.822, 0.827, 0.833, 0.836, 0.84, 0.845, 0.852, 0.851, 0.853, 0.858, 0.86, 0.863, 0.87, 0.872, 0.872, 0.876, 0.878, 0.881, 0.884, 0.888, 0.889, 0.892, 0.892, 0.896, 0.898, 0.899, 0.902, 0.905, 0.907, 0.905, 0.91, 0.91, 0.912, 0.915, 0.917, 0.922, 0.92, 0.923, 0.925, 0.928, 0.926, 0.93, 0.931, 0.931, 0.936, 0.934, 0.937, 0.94, 0.938, 0.942, 0.944, 0.942, 0.947, 0.945, 0.949, 0.951, 0.952, 0.953, 0.954, 0.956, 0.957, 0.957, 0.958, 0.961, 0.96, 0.963, 0.967, 0.965, 0.966, 0.968, 0.968, 0.969, 0.973, 0.969, 0.976, 0.973, 0.977, 0.977, 0.98, 0.98, 0.983, 0.982, 0.983, 0.983, 0.986, 0.985, 0.986, 0.989, 0.988, 0.99, 0.988, 0.99, 0.994, 0.998, 0.997, 0.998, 0.997, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.999, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.998, 0.996, 0.993, 0.993, 0.988, 0.983, 0.976, 0.97, 0.964, 0.957, 0.941, 0.93, 0.914, 0.898, 0.879, 0.853, 0.823, 0.788, 0.739, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738, 0.738,]
const PRESS_FROM = 171
const PRESS = [0.997, 0.979, 0.97, 0.97, 0.97, 0.97, 0.971, 0.97, 0.982, 0.996]
export const RING_HOLD = 140
const DEG = Math.PI / 180

function place(angle: RingSlot, centre: boolean, f: number) {
	const p = PROGRESS[f]
	const a = (angle + TWIST * (1 - p)) * DEG
	const press = f >= PRESS_FROM && f < PRESS_FROM + PRESS.length ? PRESS[f - PRESS_FROM] : 1
	return { x: RADIUS * p * Math.cos(a), y: RADIUS * p * Math.sin(a), s: centre ? press : SCALE[f] }
}
const translate = (x: number, y: number) => `translate(${(x * PX).toFixed(3)}cqmin, ${(y * PX).toFixed(3)}cqmin)`
export function ringIconStyle(n: RingNode, f: number): Keyframe {
	const { x, y, s } = place(n.angle, n.look === 'mark', f)
	return { transform: `${translate(x, y)} scale(${s})` }
}
export function ringLabelStyle(n: RingNode, f: number): Keyframe {
	const { x, y } = place(n.angle, n.look === 'mark', f)
	const shown = Math.min(Math.max((PROGRESS[f] - 0.8) / 0.1, 0), 1)
	return { transform: translate(x, y), opacity: Number(shown.toFixed(3)) }
}
const ringAt = (f: number) => ((((f - RING_HOLD) * RING_STEP) % RING_LOOP) + RING_LOOP) % RING_LOOP
const ringTrack = (el: Element | undefined, style: (f: number) => Keyframe): Track => ({ el, rest: style(RING_HOLD), frames: Array.from({ length: RING_FRAMES }, (_, f): Frame => ({ at: ringAt(f), style: style(f), ease: 'step-end' })) })
/** Which side of its node a label sits on. */
export function ringSide(angle: RingSlot) {
	const a = angle * DEG
	return { v: Math.sin(a) < 0 ? 'above' : 'below', h: Math.abs(Math.cos(a)) < 0.01 ? 'centre' : Math.cos(a) < 0 ? 'end' : 'start' }
}
/** The ring's timeline: the nodes burst out of the mark on a twist, hold with their labels, and gather back in. */
export function ringTimeline(nodes: RingNode[]) {
	return (root: HTMLElement): Timeline => ({
		duration: RING_LOOP,
		tracks: nodes.flatMap((n) => [ringTrack(root.querySelector(`[data-node="${n.key}"]`) ?? undefined, (f) => ringIconStyle(n, f)), ringTrack(root.querySelector(`[data-label="${n.key}"]`) ?? undefined, (f) => ringLabelStyle(n, f))]),
	})
}

// ----- The patterns tally -----

export interface TallyRow { name: string; total: number; tone: 1 | 2 | 3 | 4; src?: string }
export interface TallyContent { brand: string; meta: string; of: number; facts: { full: string; short: string }[]; rows: TallyRow[]; perOne: string; per: string; ads: string; summary: string }

export const tallyContent: TallyContent = {
	brand: 'Acme',
	meta: 'Top hooks, last 90 days',
	of: 429,
	facts: [{ full: 'Organic post, boosted to paid', short: 'Boosted post' }, { full: 'Sends to acme.com', short: 'acme.com' }],
	rows: [{ name: 'Acme every morning', total: 46, tone: 3 }, { name: 'Creatine for everyday users', total: 20, tone: 2 }, { name: 'Candid hot takes', total: 16, tone: 4 }],
	perOne: 'One glyph, one ad',
	per: 'One glyph, {n} ads',
	ads: '{n} ads',
	summary: 'Acme’s top hooks over the last 90 days, from 429 ads: Acme every morning, 46 ads; Creatine for everyday users, 20 ads; Candid hot takes, 16 ads. Each ad is traced to the hook it uses and labelled with its other answers.',
}

const SHARE_FULL = 20
const SETTLE = [0.9, 0.929, 0.943, 0.953, 0.962, 0.97, 0.976, 0.98, 0.984, 0.987, 0.99, 0.992, 0.994, 0.996, 0.997, 0.998, 0.999, 1]
const FRAME_MS = 1000 / 30
const settleAt = (ms: number) => SETTLE[Math.min(SETTLE.length - 1, Math.max(0, Math.floor(ms / FRAME_MS)))]
const SETTLE_MS = SETTLE.length * FRAME_MS
export const TALLY_SLOTS = [0, 1, 2, 3, 4, 5]
export const tallyRowAt = (k: number, n: number) => (((k - 2) % n) + n) % n

/** The tally's scene: the reel brings each hook's creative into the brackets, a leader is typed to its row, the row lights and the creative's facts show, then the next. */
export function buildTally(c: TallyContent) {
	const ROWS = c.rows
	const N = ROWS.length
	return function build(root: HTMLElement, tok: Tokens): Scene {
		const reel = root.querySelector<HTMLElement>('[data-reel]')!
		const strip = root.querySelector<HTMLElement>('[data-strip]')!
		const cards = [...root.querySelectorAll<HTMLElement>('[data-card]')]
		const frame = root.querySelector<HTMLElement>('[data-frame]')!
		const brackets = root.querySelector<HTMLElement>('[data-brackets]')
		const rows = [...root.querySelectorAll<HTMLElement>('[data-row]')]
		const leaderHosts = [...root.querySelectorAll<HTMLElement>('[data-leader]')]
		const chip = root.querySelector<HTMLElement>('[data-facts]')
		const facts = [...root.querySelectorAll<HTMLElement>('[data-fact]')]
		const hold = tok.ms('--ds-read-hold', 2800)
		const glide = tok.ms('--ds-loop-glide', 400)
		const change = tok.ms('--ds-loop-change', 700)
		const fade = tok.ms('--ds-loop-badge', 500)
		const swap = tok.ms('--ds-loop-pill', 150)
		const easeOut = tok.ease('--ds-easing-out', [0.22, 1, 0.36, 1])
		const easeLoop = tok.ease('--ds-easing-loop', [0.4, 0, 0.2, 1])
		const rr = root.getBoundingClientRect()
		const reelBox = reel.getBoundingClientRect()
		const cardH = cards[0].offsetHeight
		const cardW = cards[0].offsetWidth
		const pitch = cards[1].offsetTop - cards[0].offsetTop
		const centre = reel.clientHeight / 2
		const at = (k: number) => centre - (k * pitch + cardH / 2)
		setStyle(reel, '--peek', `${Math.max(0, Math.floor((reel.clientHeight - cardH) / 2 - 8))}px`)
		setStyle(frame, 'top', `${Math.round(centre - cardH / 2)}px`)
		setStyle(frame, 'height', `${cardH}px`)
		const capacity = (SHARE_FULL / 100) * c.of
		const cells = Math.floor(rows[0].querySelector<HTMLElement>('[data-ruler]')!.clientWidth / 8)
		const per = Math.max(1, Math.ceil(capacity / cells))
		const filledGlyph: string[] = []
		rows.forEach((row, i) => {
			const filled = Math.min(cells, Math.max(1, Math.round(ROWS[i].total / per)))
			const run = Array.from({ length: filled - 1 }, (_, k) => ((k + 1) % 5 === 0 ? '+' : '=')).join('')
			filledGlyph[i] = filled % 5 === 0 ? '+' : '='
			setText(row.querySelector('[data-fill]'), run)
			setText(row.querySelector('[data-hot]'), filledGlyph[i])
			setText(row.querySelector('[data-rest]'), '.'.repeat(Math.max(0, cells - filled)))
		})
		setText(root.querySelector('[data-per]'), per === 1 ? c.perOne : c.per.replace('{n}', String(per)))
		const off = parseFloat(getComputedStyle(frame).getPropertyValue('--b-off')) || 4
		const x0 = reelBox.left - rr.left + cardW + off
		const y0 = reelBox.top - rr.top + centre
		const typed: HTMLElement[][] = rows.map((row, i) => {
			const host = leaderHosts[i]
			if (!host) return []
			host.replaceChildren()
			const ruler = row.querySelector<HTMLElement>('[data-ruler]')!.getBoundingClientRect()
			const x1 = ruler.left - rr.left - 12
			const y1 = Math.round(ruler.top - rr.top + ruler.height / 2)
			const ys = Math.round(y0)
			const pts: { x: number; y: number; g: string }[] = []
			const xm = x0 + 4 + 8 * Math.max(1, Math.round((x1 - x0 - 8) / 16))
			if (Math.abs(y1 - ys) < 8) {
				for (let x = x0 + 4; x <= x1; x += 8) pts.push({ x, y: ys, g: '-' })
			} else {
				for (let x = x0 + 4; x < xm; x += 8) pts.push({ x, y: ys, g: '-' })
				pts.push({ x: xm, y: ys, g: '+' })
				const dir = Math.sign(y1 - ys)
				for (let y = ys + dir * 16; dir * (y1 - y) >= 16; y += dir * 16) pts.push({ x: xm, y, g: ':' })
				pts.push({ x: xm, y: y1, g: '+' })
				for (let x = xm + 8; x <= x1; x += 8) pts.push({ x, y: y1, g: '-' })
			}
			return pts.map((pt) => {
				const el = document.createElement('span')
				el.className = 'ds-ft-glyph'
				el.textContent = pt.g
				el.style.transform = `translate(${pt.x - 4}px, ${pt.y - 8}px)`
				el.style.opacity = '0'
				host.appendChild(el)
				return el
			})
		})
		const found = glide
		const lineAt = found + SETTLE_MS
		const traced = lineAt + change
		const leave = traced + hold
		const P1 = leave + fade
		const loop = N * P1
		const draw = (t: number) => {
			const i = Math.min(N - 1, Math.floor(t / P1))
			const u = t - i * P1
			const k = i + 1 + easeOut(span(u, 0, glide))
			setStyle(strip, 'transform', `translateY(${at(k).toFixed(2)}px)`)
			const focus = easeLoop(span(u, found, found + fade)) * (1 - easeLoop(span(u, leave, P1)))
			cards.forEach((card, cc) => setStyle(card, 'opacity', cc === i + 2 ? '1' : (1 - 0.3 * focus).toFixed(3)))
			const on = u >= found && u < leave + fade / 2
			setStyle(brackets, 'opacity', on ? '1' : '0')
			setStyle(brackets, 'transform', `scale(${on ? settleAt(u - found) : 0.9})`)
			typed.forEach((glyphs, r) => {
				const mine = r === tallyRowAt(i + 2, N)
				const shown = mine ? Math.floor(span(u, lineAt, traced) * glyphs.length + 1e-6) : 0
				const out = mine ? 1 - easeLoop(span(u, leave, P1)) : 0
				glyphs.forEach((g, kk) => setStyle(g, 'opacity', kk < shown ? out.toFixed(3) : '0'))
			})
			const chipIn = easeOut(span(u, lineAt, lineAt + fade))
			setStyle(chip, 'opacity', (chipIn * (1 - easeLoop(span(u, leave, P1)))).toFixed(3))
			setStyle(chip, 'transform', `translate(-50%, ${(4 * (1 - chipIn)).toFixed(2)}px)`)
			const second = easeLoop(span(u, traced + hold / 2, traced + hold / 2 + swap))
			facts.forEach((f, cc) => setStyle(f, 'opacity', (cc === 0 ? 1 - second : second).toFixed(3)))
			rows.forEach((row, r) => {
				const lit = r === tallyRowAt(i + 2, N) && u >= traced && u < leave
				setData(row, 'lit', lit ? '' : null)
				setText(row.querySelector('[data-hot]'), lit ? '#' : filledGlyph[r])
			})
		}
		return { loop, rest: traced, draw }
	}
}

