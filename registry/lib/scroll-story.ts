// The scroll story (site story/ScrollStory): a story told in chapters while the reader scrolls. From 1024 with motion
// allowed, a stage pins for the story's length and its pieces (creatives, a board, chips, a page, a thread, a profile,
// a result card) move on keyframes in a 1512x982 design frame scaled to the content width, while each chapter's words
// rise in from below or reveal in place. Below 1024, or with reduced motion, the same chapters stack: words over a still
// arrangement of the pieces, no motion. Shared by both flavors: the data shapes, the timeline, `storyFromShape` (the
// site's five-chapter story built from a few named parts) and `runScrollStory` (the pinned engine on plain DOM nodes).

import type { ImageSlot } from '@/lib/image'

export type StoryEase = 'linear' | 'in' | 'out' | 'inOut'

/** One keyframe: `at` in chapters (1.5 is half through chapter 2), x and y in frame px, scale, opacity, badge and mark opacity. */
export interface StoryKey {
	at: number
	x: number
	y: number
	s?: number
	o?: number
	b?: number
	m?: number
	e?: StoryEase
}

/** A creative: the image as posted (`src`), or the neutral placeholder named by `brand` and `caption`. */
export interface StoryImage extends ImageSlot {
	alt: string
	brand?: string
	caption?: string
	tone?: 1 | 2 | 3 | 4
	/** The channel's mark (an image) in the corner; none by default (no third-party marks shipped). */
	mark?: string
}

/** A brand's round mark: `src`, or the first letter of `name` on White. */
export interface StoryLogo {
	name: string
	src?: string
}

interface PieceBase {
	id: string
	w: number
	h: number
	keys: StoryKey[]
	/** The chapter whose words this piece rides with. */
	withText?: number
	/** Blend into riding with the words between two moments. */
	withTextFrom?: { from: number; to: number }
}

export type StoryPiece = PieceBase &
	(
		| { kind: 'image'; image: StoryImage; badge?: string }
		| { kind: 'board'; title: string; meta: string; logo?: StoryLogo; logos?: StoryLogo[]; more?: number; action?: string; query?: string; filters?: string[]; compact?: boolean }
		| { kind: 'chip'; label: string; value: string }
		| { kind: 'page'; image: StoryImage; url: string; meta: string }
		| { kind: 'thread'; title: string; meta: string; tabs?: string[]; rows: { who: string; text: string; likes?: string; avatar?: string }[] }
		| { kind: 'profile'; logo: StoryLogo; name: string; handle: string; meta: string; action: string; mark?: string; posts: StoryImage[]; footer: string }
		| { kind: 'result'; title: string; meta: string; rows: { title: string; detail: string; figure: string; image: StoryImage; logo?: StoryLogo; mark?: string }[] }
	)

export type StoryLayout = 'board' | 'rank' | 'focus' | 'page' | 'result'

export interface StoryChapter {
	id: string
	heading: string
	text: string
	side: 'top' | 'left' | 'right'
	mode?: 'static' | 'reveal' | 'scroll'
	in: number
	out?: number
	outRate?: 'exit'
	/** The still arrangement shown under the words when the story stacks. */
	still: { layout: StoryLayout; pieces: string[] }
}

export interface ScrollStoryData {
	id: string
	/** The section's name for assistive tech (visually hidden). */
	title: string
	chapters: StoryChapter[]
	pieces: StoryPiece[]
}

/** A button under the last chapter: the first is White, the rest secondary. */
export interface StoryAction {
	label: string
	href: string
}

// ----- Timeline -----

export interface Clock {
	starts: number[]
	lengths: number[]
	total: number
}

export function makeClock(lengths: number[]): Clock {
	const starts: number[] = []
	let t = 0
	for (const l of lengths) {
		starts.push(t)
		t += l
	}
	return { starts, lengths, total: t }
}

export function toScreens(clock: Clock, at: number): number {
	const last = clock.lengths.length - 1
	const i = Math.max(0, Math.min(last, Math.floor(at)))
	return clock.starts[i] + (at - i) * clock.lengths[i]
}

const EASES: Record<StoryEase, (p: number) => number> = {
	linear: (p) => p,
	in: (p) => p * p * p,
	out: (p) => 1 - (1 - p) ** 3,
	inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
}

export const ease = (name: StoryEase, p: number) => EASES[name](Math.max(0, Math.min(1, p)))

export interface Frame {
	x: number
	y: number
	s: number
	o: number
	b: number
	m: number
}

type Track = (Required<Omit<StoryKey, 'e'>> & { e: StoryEase; t: number })[]

function makeTrack(clock: Clock, keys: StoryKey[]): Track {
	let prev = { s: 1, o: 1, b: 0, m: 1 }
	return keys.map((k) => {
		const full = { ...k, s: k.s ?? prev.s, o: k.o ?? prev.o, b: k.b ?? prev.b, m: k.m ?? prev.m, e: k.e ?? 'linear', t: toScreens(clock, k.at) }
		prev = full
		return full
	})
}

const lerp = (a: number, b: number, p: number) => a + (b - a) * p

function sample(track: Track, t: number): Frame {
	const first = track[0]
	if (t <= first.t) return first
	for (let i = 1; i < track.length; i++) {
		const k = track[i]
		if (t <= k.t) {
			const a = track[i - 1]
			const p = ease(k.e, k.t === a.t ? 1 : (t - a.t) / (k.t - a.t))
			return { x: lerp(a.x, k.x, p), y: lerp(a.y, k.y, p), s: lerp(a.s, k.s, p), o: lerp(a.o, k.o, p), b: lerp(a.b, k.b, p), m: lerp(a.m, k.m, p) }
		}
	}
	return track[track.length - 1]
}

const frameTransform = (f: Frame) => `translate3d(${f.x.toFixed(2)}px, ${f.y.toFixed(2)}px, 0) scale(${f.s.toFixed(4)})`

/** The style a piece starts with before the engine runs (server render and first paint), as properties for both flavors. */
export function pieceStartStyle(piece: StoryPiece, chapters: number): Record<string, string> {
	const clock = makeClock(Array.from({ length: chapters + 1 }, () => 1))
	const f = sample(makeTrack(clock, piece.keys), 0)
	const size: Record<string, string> = piece.kind === 'chip' ? {} : { width: `${piece.w}px`, height: `${piece.h}px` }
	return { ...size, transform: frameTransform(f), opacity: f.o.toFixed(3), visibility: f.o < 0.005 ? 'hidden' : 'visible', '--b': f.b.toFixed(3), '--m': f.m.toFixed(3) }
}

/** The pinned track's height: every chapter's length, the tail and one screen. */
export function trackHeight(chapters: number): string {
	const lens = Array.from({ length: chapters }, (_, i) => `var(--ds-story-len-${i + 1}, 1)`)
	return `calc((${[...lens, 'var(--ds-story-tail)'].join(' + ')} + 1) * 100vh)`
}

/** The still arrangement's aspect for an image or a page. */
export const stillRatio = (piece: StoryPiece) => (piece.kind === 'image' || piece.kind === 'page' ? `${piece.w} / ${piece.h}` : undefined)

// ----- The pinned engine -----

export const PINNED = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

export interface StoryNodes {
	track: HTMLElement
	frame: HTMLElement
	words: HTMLElement
	pieces: HTMLElement[]
	texts: HTMLElement[]
}

/**
 * Runs the pinned story on rendered nodes while PINNED matches (it stops and restarts as the media query changes):
 * reads the story tokens from the track, scales the frame to the content width, and on scroll writes each piece's
 * transform and opacity and each chapter's rise. Returns a stop function.
 */
export function runScrollStory(nodes: () => StoryNodes | null, story: ScrollStoryData): () => void {
	if (!('IntersectionObserver' in globalThis)) return () => {}
	const media = window.matchMedia(PINNED)
	let stop = () => {}
	const start = () => {
		const n = nodes()
		if (!n) return
		const { chapters, pieces } = story
		const style = getComputedStyle(n.track)
		const num = (name: string, fallback = 0) => {
			const v = parseFloat(style.getPropertyValue(name))
			return Number.isFinite(v) ? v : fallback
		}
		const px = (name: string) => {
			const probe = document.createElement('div')
			probe.style.cssText = `position:absolute;visibility:hidden;height:var(${name})`
			n.track.appendChild(probe)
			const v = probe.getBoundingClientRect().height
			probe.remove()
			return v
		}
		const clock = makeClock([...chapters.map((_, i) => num(`--ds-story-len-${i + 1}`, 1)), num('--ds-story-tail')])
		const tracks = pieces.map((p) => makeTrack(clock, p.keys))
		const frameW = num('--ds-story-frame-w')
		const frameH = num('--ds-story-frame-h')
		const frameContent = num('--ds-story-frame-content')
		const rise = px('--ds-story-text-rise')
		const exitRate = num('--ds-story-exit-rate')
		const textRate = num('--ds-story-text-rate')
		const follow = num('--ds-story-follow')
		const settle = num('--ds-story-settle')
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

		let vh = window.innerHeight
		let scale = 1
		let settleD = 0
		let rests: { top: number; bottom: number }[] = []

		const measure = () => {
			vh = window.innerHeight
			const cs = getComputedStyle(n.words)
			const content = n.words.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
			scale = Math.min(content / frameContent, vh / frameH)
			n.frame.style.width = `${frameW}px`
			n.frame.style.height = `${frameH}px`
			n.frame.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`
			settleD = still ? 0 : (vh * settle) / 2
			n.track.style.setProperty('--story-settle-d', `${settleD.toFixed(1)}px`)
			rests = n.texts.map((t) => ({ top: t.offsetTop, bottom: t.offsetTop + t.offsetHeight }))
		}

		const textFrame = (c: StoryChapter, i: number, s: number) => {
			const sIn = toScreens(clock, c.in)
			const out = c.out === undefined ? Infinity : toScreens(clock, c.out)
			const rate = c.outRate === 'exit' ? exitRate : textRate
			const leave = s > out ? (s - out) * vh * rate : 0
			if (c.mode === 'static') return [{ y: -leave, o: 1 }]
			if (c.mode === 'reveal') {
				const p = (s - sIn) / Math.max(0.001, toScreens(clock, i + 1) - sIn)
				return [0, 0.12].map((lag) => {
					const e = ease('inOut', (p - lag) / (1 - lag))
					return { y: rise * (1 - e) - leave, o: e * e }
				})
			}
			const y = Math.max(0, vh - rests[i].top - (s - sIn) * vh * textRate) - leave
			return [{ y, o: 1 }]
		}

		const target = () => {
			const box = n.track.getBoundingClientRect()
			return Math.max(-1, Math.min(clock.total, -box.top / vh))
		}
		let shown = target()
		let last = 0
		const update = (at?: number) => {
			const s = at ?? shown
			const u = settle > 0 ? Math.min(1, Math.max(0, s / settle)) : 1
			const glide = settleD * (1 - u) * (1 - u)
			n.frame.style.transform = `translate(-50%, calc(-50% + ${glide.toFixed(2)}px)) scale(${scale.toFixed(4)})`
			n.words.style.transform = glide ? `translate3d(0, ${glide.toFixed(2)}px, 0)` : ''
			tracks.forEach((tr, i) => {
				const el = n.pieces[i]
				if (!el) return
				const f = sample(tr, s)
				const piece = pieces[i]
				let dy = 0
				if (piece.withText !== undefined) {
					const blend = piece.withTextFrom
					const share = blend ? Math.min(1, Math.max(0, (s - toScreens(clock, blend.from)) / Math.max(0.001, toScreens(clock, blend.to) - toScreens(clock, blend.from)))) : 1
					dy = (share * textFrame(chapters[piece.withText], piece.withText, s)[0].y) / scale
				}
				const t = frameTransform(f)
				el.style.transform = dy ? `translate3d(0, ${dy.toFixed(2)}px, 0) ${t}` : t
				el.style.opacity = f.o.toFixed(3)
				el.style.visibility = f.o < 0.005 ? 'hidden' : 'visible'
				el.style.zIndex = piece.kind === 'image' ? (f.o >= 0.999 ? '2' : '1') : piece.id === 'board' || piece.kind === 'result' ? '0' : '3'
				el.style.setProperty('--b', f.b.toFixed(3))
				el.style.setProperty('--m', f.m.toFixed(3))
			})
			chapters.forEach((c, i) => {
				const el = n.texts[i]
				if (!el) return
				const parts = textFrame(c, i, s)
				const kids = parts.length > 1 ? Array.from(el.children as HTMLCollectionOf<HTMLElement>) : [el]
				kids.forEach((kid, j) => {
					const f = parts[Math.min(j, parts.length - 1)]
					kid.style.transform = `translate3d(0, ${f.y.toFixed(2)}px, 0)`
					kid.style.opacity = f.o.toFixed(3)
				})
				const top = rests[i].top + parts[0].y
				const gone = top > vh || rests[i].bottom + parts[parts.length - 1].y < 0
				el.style.visibility = gone ? 'hidden' : 'visible'
			})
		}

		// The room under the last view: the track ends where the lowest visible piece or word ends, so the next section
		// follows at the section spacing instead of a screen of Black.
		const foot = () => {
			const stage = n.track.firstElementChild
			if (!stage) return
			update(clock.total)
			const top = stage.getBoundingClientRect().top
			let low = 0
			const visible = (el: HTMLElement) => el.style.visibility !== 'hidden' && parseFloat(el.style.opacity || '1') > 0.01
			for (const el of n.pieces) if (visible(el)) low = Math.max(low, el.getBoundingClientRect().bottom - top)
			for (const el of n.texts) {
				if (!visible(el)) continue
				for (const kid of Array.from(el.children as HTMLCollectionOf<HTMLElement>)) if (visible(kid)) low = Math.max(low, kid.getBoundingClientRect().bottom - top)
			}
			if (low > 0) n.track.style.setProperty('--story-foot', `${Math.round(Math.max(0, vh - low))}px`)
		}

		let raf = 0
		const tick = (now: number) => {
			raf = 0
			const goal = target()
			const dt = last ? Math.min(now - last, 64) : 16
			last = now
			shown = still || follow <= 0 ? goal : shown + (goal - shown) * (1 - Math.exp(-dt / follow))
			if (Math.abs(goal - shown) < 0.0004) shown = goal
			update()
			if (shown !== goal) raf = requestAnimationFrame(tick)
			else last = 0
		}
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(tick)
		}
		const onResize = () => {
			measure()
			foot()
			shown = target()
			update()
		}
		let listening = false
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !listening) {
					listening = true
					window.addEventListener('scroll', onScroll, { passive: true })
					shown = target()
					update()
				} else if (!entry.isIntersecting && listening) {
					listening = false
					window.removeEventListener('scroll', onScroll)
				}
			},
			{ rootMargin: '50% 0px' },
		)
		measure()
		foot()
		update()
		io.observe(n.track)
		window.addEventListener('resize', onResize)
		let live = true
		document.fonts?.ready.then(() => {
			if (live) onResize()
		})
		stop = () => {
			live = false
			io.disconnect()
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onResize)
			cancelAnimationFrame(raf)
		}
	}
	const apply = () => {
		stop()
		stop = () => {}
		if (media.matches) start()
	}
	apply()
	media.addEventListener('change', apply)
	return () => {
		media.removeEventListener('change', apply)
		stop()
	}
}

// ----- The five-chapter shape (site content/pages/useCaseStories/shape.ts) -----

type Words = { heading: string; text: string }
type Ranked = { id: string; image: StoryImage; badge: string }
type Chip = { label: string; value: string }
type Row = { title: string; detail: string; figure: string; mark?: string; logo?: StoryLogo }
type FocalPiece =
	| { kind: 'page'; image: StoryImage; url: string; meta: string }
	| { kind: 'thread'; title: string; meta: string; tabs?: string[]; rows: { who: string; text: string; likes?: string; avatar?: string }[] }
	| { kind: 'board'; title: string; meta: string; logo?: StoryLogo; logos?: StoryLogo[]; more?: number }
	| { kind: 'profile'; logo: StoryLogo; name: string; handle: string; meta: string; action: string; mark?: string; posts: StoryImage[]; footer: string }

/** The site's story in five chapters: a board of work, ranked, one taken apart, the same move elsewhere, the result. */
export interface StoryShape {
	id: string
	title: string
	words: [Words, Words, Words, Words, Words]
	board: { title: string; meta: string; logo?: StoryLogo; logos?: StoryLogo[]; more?: number; action?: string; query?: string; filters?: string[] }
	hero: { image: StoryImage; badge: string }
	ranked: [Ranked, Ranked, Ranked, Ranked, Ranked]
	chips: [Chip, Chip, Chip, Chip, Chip]
	focal: FocalPiece
	around: [StoryImage, StoryImage, StoryImage, StoryImage]
	result: { title: string; meta: string; logo?: StoryLogo; rows: [Row, Row, Row, Row] }
}

const BOARD = { x: 154, y: 272, w: 1204, h: 852 }
const ROW = [BOARD.y + 192, BOARD.y + 192 + 298 + 24]
const COL = [245, 506, 767, 1028]
const SLOTS: [number, number][] = [
	[2, 0],
	[1, 1],
	[1, 0],
	[0, 1],
	[0, 0],
]
const RIDE = 140
const RANK = [
	{ x: 700, y: 260, w: 300 },
	{ x: 1036, y: 260, w: 200 },
	{ x: 1252, y: 260, w: 184 },
	{ x: 1036, y: 534, w: 144 },
	{ x: 1196, y: 534, w: 128 },
	{ x: 1340, y: 534, w: 112 },
]
type Place = { x: number; y: number; w: number }

function boardKeys(col: number, row: number, rank: Place, base: number): StoryKey[] {
	const x = COL[col]
	const y = ROW[row]
	return [
		{ at: 0, x, y, s: 238 / base, b: 0 },
		{ at: 1, x, y },
		{ at: 1.3, x, y: y - RIDE, b: 1 },
		{ at: base === 238 ? 1.75 : 1.9, x: rank.x, y: rank.y, s: rank.w / base, e: 'inOut' },
	]
}

function fallKeys(rank: Place): StoryKey[] {
	return [
		{ at: 2.12, x: rank.x, y: rank.y, s: rank.w / 238 },
		{ at: 2.5, x: rank.x + 10, y: rank.y - 369, o: 0.7 },
		{ at: 3, x: rank.x + 24, y: rank.y - 855 },
	]
}

const CHIP_AT = [
	{ x: 596, y: 316 },
	{ x: 232, y: 404 },
	{ x: 604, y: 500 },
	{ x: 256, y: 600 },
	{ x: 560, y: 664 },
]

function chipKeys(x: number, y: number, i: number): StoryKey[] {
	const d = i * 0.05
	return [
		{ at: 2.6 + d, x: x + 36, y: y - 8, s: 0.9, o: 0 },
		{ at: 2.72 + d, x: x + 10, y: y - 2, s: 1, o: 1, e: 'out' },
		{ at: 3, x, y },
		{ at: 3.12, x, y },
		{ at: 3.35, x: x + 90, y: y + 16, s: 0.9, o: 0 },
	]
}

const ARRIVE = 860
const FOCAL = { x: 900, y: 180, w: 380, h: 460 }
const AROUND = [
	{ x: 1300, y: 110, s: 140 / 160 },
	{ x: 1300, y: 590, s: 150 / 160 },
	{ x: 720, y: 650, s: 150 / 160 },
	{ x: 1000, y: 690, s: 140 / 160 },
]

function arriveKeys(at: number, end: { x: number; y: number; s: number }, drift: number, solid = false): StoryKey[] {
	return [
		{ at: 0, x: end.x - drift, y: end.y + ARRIVE, s: end.s, o: 0 },
		{ at: at - 0.01, x: end.x - drift, y: end.y + ARRIVE, o: 0 },
		{ at, x: end.x - drift, y: end.y + ARRIVE, s: end.s, o: solid ? 1 : 0.21 },
		{ at: at + 0.74, x: end.x, y: end.y, o: 1 },
	]
}

const CARD = { x: 116, y: 219, w: 640, h: 488 }
const SLOT = (row: number) => ({ x: CARD.x + 1 + 24, y: CARD.y + 1 + 97 + 8 + 97 * row })

function landKeys(from: { x: number; y: number; s: number }, row: number, at: number, base: number): StoryKey[] {
	const slot = SLOT(row)
	return [
		{ at: 4.12, x: from.x, y: from.y, s: from.s },
		{ at, x: slot.x, y: slot.y, s: 64 / base, b: 0, m: 0, e: 'inOut' },
		{ at: 5, x: slot.x, y: slot.y },
	]
}

const HERO = { w: 352, h: 440 }

const CHAPTERS: Omit<StoryChapter, 'heading' | 'text' | 'still'>[] = [
	{ id: '1', side: 'top', mode: 'static', in: -1, out: 1, outRate: 'exit' },
	{ id: '2', side: 'left', in: 1.38, out: 2.15 },
	{ id: '3', side: 'right', in: 2.25, out: 3.15 },
	{ id: '4', side: 'left', in: 3.25, out: 4.15 },
	{ id: '5', side: 'right', in: 4.2 },
]

/** Builds the site's five-chapter story (pieces, keyframes, chapters and stills) from its named parts. */
export function storyFromShape(shape: StoryShape): ScrollStoryData {
	const { id, hero, ranked, chips, focal, around, result } = shape
	const chipIds = chips.map((_, i) => `chip-${i + 1}`)
	const focalH = focal.kind === 'page' ? FOCAL.h : focal.kind === 'profile' ? 416 : focal.kind === 'thread' ? 97 + (focal.tabs ? 53 : 0) + 81 * focal.rows.length : 168
	const focalY = FOCAL.y + (FOCAL.h - focalH) / 2
	const stills: StoryChapter['still'][] = [
		{ layout: 'board', pieces: ['board', ranked[4].id, ranked[2].id, ranked[0].id, 'hero'] },
		{ layout: 'rank', pieces: ['hero', ranked[0].id, ranked[1].id] },
		{ layout: 'focus', pieces: ['hero', ...chipIds] },
		{ layout: 'page', pieces: ['focal', 'around-1', 'around-2', 'around-3'] },
		{ layout: 'result', pieces: ['result'] },
	]
	const pieces: StoryPiece[] = [
		{
			id: 'board',
			kind: 'board',
			...shape.board,
			w: BOARD.w,
			h: BOARD.h,
			keys: [
				{ at: 0, x: BOARD.x, y: BOARD.y },
				{ at: 1, x: BOARD.x, y: BOARD.y },
				{ at: 1.3, x: BOARD.x, y: BOARD.y - RIDE, o: 1 },
				{ at: 1.5, x: BOARD.x, y: BOARD.y - 294, o: 0 },
			],
		},
		{
			id: 'focal',
			...focal,
			...(focal.kind === 'board' ? { compact: true } : {}),
			w: FOCAL.w,
			h: focalH,
			keys: [...arriveKeys(3.15, { x: FOCAL.x, y: focalY, s: 1 }, 0, true), { at: 4.12, x: FOCAL.x, y: focalY }, { at: 4.6, x: FOCAL.x, y: -focalH - 120 }],
		} as StoryPiece,
		{
			id: 'result',
			kind: 'result',
			title: result.title,
			meta: result.meta,
			rows: result.rows.map((row, i) => ({ ...row, logo: row.logo ?? result.logo, image: i === 0 ? hero.image : around[i - 1] })),
			w: CARD.w,
			h: CARD.h,
			keys: [{ at: 0, x: CARD.x, y: CARD.y, o: 1 }],
			withText: 4,
		},
		...ranked.map((r, i): StoryPiece => {
			const [col, row] = SLOTS[i]
			const rank = RANK[i + 1]
			return { id: r.id, kind: 'image', image: r.image, badge: r.badge, w: 238, h: 298, keys: [...boardKeys(col, row, rank, 238), ...fallKeys(rank)] }
		}),
		...around.map((image, i): StoryPiece => {
			const end = AROUND[i]
			const drift = end.x > 900 ? -60 : 50
			return {
				id: `around-${i + 1}`,
				kind: 'image',
				image,
				w: 160,
				h: 200,
				keys: [
					...arriveKeys(3.15 + i * 0.02, end, drift),
					...(i === 3
						? [
								{ at: 4.12, x: end.x, y: end.y },
								{ at: 4.6, x: end.x + 40, y: end.y - 390, o: 0 },
							]
						: landKeys(end, i + 1, 4.9 + (i + 1) * 0.03, 160)),
				],
				...(i === 3 ? {} : { withText: 4, withTextFrom: { from: 4.5, to: 4.9 } }),
			}
		}),
		{
			id: 'hero',
			kind: 'image',
			image: hero.image,
			badge: hero.badge,
			w: HERO.w,
			h: HERO.h,
			keys: [
				...boardKeys(3, 0, RANK[0], HERO.w),
				{ at: 2.12, x: 700, y: 260, m: 1 },
				{ at: 2.55, x: 548, y: 244, s: 0.93, m: 0, e: 'in' },
				{ at: 3, x: 336, y: 271, s: 1, e: 'out' },
				{ at: 3.12, x: 336, y: 271 },
				{ at: 3.85, x: 700, y: 330, s: 220 / HERO.w, e: 'inOut' },
				{ at: 4.12, x: 700, y: 330, b: 1 },
				{ at: 4.5, x: 520, y: 300, s: 0.4, b: 0.4, e: 'in' },
				...landKeys({ x: 520, y: 300, s: 0.4 }, 0, 4.9, HERO.w).slice(1),
			],
			withText: 4,
			withTextFrom: { from: 4.5, to: 4.9 },
		},
		...chips.map((c, i): StoryPiece => ({ id: chipIds[i], kind: 'chip', ...c, w: 0, h: 0, keys: chipKeys(CHIP_AT[i].x, CHIP_AT[i].y, i) })),
	]
	return { id, title: shape.title, chapters: CHAPTERS.map((c, i) => ({ ...c, id: `${id}-${c.id}`, ...shape.words[i], still: stills[i] })), pieces }
}
