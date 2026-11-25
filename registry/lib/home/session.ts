// The home's MCP session (site v2/V2HowItWorks Session.tsx, sessionClock.ts and the hero reference's timings),
// framework-free: an AI chat asks the server a question at a typist's rhythm, the tool call and the reply settle in,
// the creatives arrive one by one, the table's rows rise into place, then everything settles out and the next question
// starts. Frames run at 60 per second while a quarter of the session is on screen; reduced motion rests on the first
// answer. The questions and rows are Acme placeholders (the site asks about real brands); pass your own.
import type { ImageSlot } from '@/lib/image'

export interface SessionQuestion {
	/** An @mention set in Medium before the question. */
	mention?: string
	text: string
	tool: string
	args: string
	reply: string
	columns: readonly [string, string]
	rows: { label: string; value: string }[]
	/** The four creatives in the answer: images, or placeholder tones (1 to 4). */
	images: (ImageSlot & { alt: string; tone?: 1 | 2 | 3 | 4 })[]
}

export interface SessionContent {
	server: string
	status: string
	label: string
	composer: string
	questions: readonly SessionQuestion[]
}

const tones = (alt: string, ...t: (1 | 2 | 3 | 4)[]) => t.map((tone, i) => ({ alt: `${alt} ${i + 1}`, tone }))

export const sessionContent: SessionContent = {
	server: 'Acme MCP',
	status: 'Connected',
	label: 'An AI chat asks the server four questions in turn',
	composer: 'Ask about any brand, ad, post or creator',
	questions: [
		{ mention: '@Acme Drinks', text: 'What hooks is this brand running?', tool: 'getBrandMediaInsights', args: 'type: "HOOK", maxDaysBack: 90', reply: '23 hooks in the last 90 days. The top three:', columns: ['Hook', 'Ads'], rows: [{ label: 'Seasonal openers, “It’s apple season”', value: '3' }, { label: 'Confessional overshare', value: '2' }, { label: 'Declarations of love for the soda', value: '2' }], images: tones('An Acme Drinks ad', 3, 4, 2, 3) },
		{ text: 'Which skincare posts broke out on Instagram this month?', tool: 'getMedia', args: 'query: "skincare", sortBy: "HIGHEST_OUTLIER"', reply: 'Posts far above their account’s usual, Nov 1 to 16:', columns: ['Post', 'Views'], rows: [{ label: 'Cosmetic scientist’s affordable picks', value: '652.9K' }, { label: 'A sensitive-skin routine, a four-week test', value: '275.5K' }, { label: 'Acme Skin, “not getting any younger”', value: '36.3K' }], images: tones('A skincare post', 2, 3, 4, 1) },
		{ mention: '@Acme Fit', text: 'Where do this brand’s ads send people?', tool: 'getBrandLandingPages', args: 'brandId: "acmefit"', reply: '6 landing pages. The top three by ads:', columns: ['Page', 'Ads'], rows: [{ label: 'acme.com/products/protein-black', value: '519' }, { label: 'try.acme.com/us/protein-black-offer', value: '35' }, { label: 'acme.com/products/protein-ready-to-drink', value: '25' }], images: tones('An Acme Fit ad', 4, 2, 3, 2) },
		{ text: 'Find brands like Acme Greens and show me their ads', tool: 'getAccounts', args: 'mode: "smart", sortBy: "MOST_ACTIVE_ADS"', reply: 'Greens brands running ads now:', columns: ['Brand', 'Instagram'], rows: [{ label: 'Acme Gummies', value: '183K' }, { label: 'Acme Super Greens', value: '43K' }, { label: 'Acme Elements', value: '14.3K' }], images: tones('A greens brand ad', 3, 1, 4, 2) },
	],
}

// ----- The clock (60 frames a second; the site's hero reference timings) -----

export const FPS = 60
const START = 6
const O = 2
const SETTLE = [0.9, 0.929, 0.943, 0.953, 0.962, 0.97, 0.976, 0.98, 0.984, 0.987, 0.99, 0.992, 0.994, 0.996, 0.997, 0.998, 0.999, 1]
const settle = (k: number) => SETTLE[Math.min(Math.max(k, 0), SETTLE.length - 1)]
const settle60 = (k: number) => settle(Math.floor(k / O))
const itemScale60 = (k: number) => 0.8 + 2 * (settle60(k) - 0.9)
const SHRINK = 17 * O
const OUT_STEP = 2 * O
const GAP = 15 * O
const THUMB_STEP = 2 * O
const PART = { table: 0, thumbs: 1, agent: 2, message: 3 } as const
const PARTS = 4
const TYPE_STEPS = [3, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 3]
const TYPE_FADE = 6
const DELETE_FROM = 384
const BLINK = { off: 16, on: 16 }
const GRID_A_SHOW = 119
const GRID_A_STARTS = [119, 121, 123, 123, 127, 128, 130, 130, 133, 135, 137]
const GRID_A_FADE = 45
type Track = readonly (readonly [number, number])[]
const GRID_A_DY: Track = [[119, 68], [125, 50], [132, 36], [134, 32], [136, 29], [138, 26], [140, 23], [142, 21], [144, 19], [146, 16], [148, 14], [150, 13], [152, 11], [154, 10], [156, 8], [158, 7], [160, 6], [162, 5], [164, 4], [166, 3], [168, 2], [170, 1], [173, 0], [201, 0], [202, -5], [204, -6], [206, -8], [208, -10], [210, -13], [211, -15], [212, -18], [213, -21], [214, -25], [215, -30]]

const clamp = (v: number) => Math.min(Math.max(v, 0), 1)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
function at(track: Track, f: number) {
	if (f <= track[0][0]) return track[0][1]
	for (let i = 1; i < track.length; i++) {
		const [f1, v1] = track[i]
		if (f <= f1) {
			const [f0, v0] = track[i - 1]
			return v0 + ((v1 - v0) * (f - f0)) / (f1 - f0)
		}
	}
	return track[track.length - 1][1]
}
const partScale = (inAt: number, outAt: number, f: number) => Math.min(settle60(f - inAt), settle60(outAt - 1 - f))
const shown = (inAt: number, outAt: number, f: number) => f >= inAt && f < outAt

type Timeline = { text: string; type: number[]; sent: number; callIn: number; shift: number; lineIn: number[]; thumbIn: number[]; rest: number; clear: number; out: number[]; length: number }

/** The question as typed: the mention and the text. */
export const typedText = (q: SessionQuestion) => (q.mention ? `${q.mention} ${q.text}` : q.text)

function timeline(q: SessionQuestion): Timeline {
	const text = typedText(q)
	const type = [START]
	for (let k = 1; k < text.length; k++) type.push(type[k - 1] + TYPE_STEPS[(k - 1) % TYPE_STEPS.length])
	const sent = type[type.length - 1] + 8
	const shift = sent + 39 - GRID_A_SHOW
	const s = GRID_A_STARTS
	const rowStarts = Array.from({ length: 3 }, (_, k) => s[Math.min(5 + k, s.length - 1)])
	const lineIn = [s[0], s[4], ...rowStarts].map((f) => f + shift)
	const thumbIn = Array.from({ length: q.images.length }, (_, i) => s[1] + shift + i * THUMB_STEP)
	const rest = (GRID_A_DY.find(([, v]) => v === 0)?.[0] ?? GRID_A_DY[GRID_A_DY.length - 1][0]) + shift
	const clear = DELETE_FROM + shift
	const out = Array.from({ length: PARTS }, (_, i) => clear + SHRINK + i * OUT_STEP)
	return { text, type, sent, callIn: sent + 4, shift, lineIn, thumbIn, rest, clear, out, length: out[PARTS - 1] + GAP - START }
}

type Plan = { timelines: Timeline[]; offsets: number[]; loop: number }
function planOf(questions: readonly SessionQuestion[]): Plan {
	const timelines = questions.map(timeline)
	return { timelines, offsets: timelines.map((_, i) => timelines.slice(0, i).reduce((sum, t) => sum + t.length, 0)), loop: timelines.reduce((sum, t) => sum + t.length, 0) }
}

function style(el: HTMLElement | null, on: boolean, transform: string) {
	if (!el) return
	el.style.opacity = on ? '1' : '0'
	el.style.transform = transform
}

function draw(root: HTMLElement, frame: number, scale: number, plan: Plan) {
	const { offsets, timelines } = plan
	let q = 0
	while (q < offsets.length - 1 && frame >= offsets[q + 1]) q++
	const t = timelines[q]
	const f = frame - offsets[q]
	const typed = root.querySelector<HTMLElement>('[data-typed]')
	if (typed && typed.dataset.q !== String(q)) {
		typed.dataset.q = String(q)
		typed.querySelectorAll<HTMLElement>('[data-q]').forEach((el) => (el.hidden = el.dataset.q !== String(q)))
	}
	root.querySelectorAll<HTMLElement>(`[data-typed] [data-q="${q}"] [data-char]`).forEach((el, k) => {
		el.style.opacity = String(clamp((f - t.type[k]) / TYPE_FADE) * (1 - clamp((f - t.sent) / 3)))
		el.style.display = f < t.type[k] || f >= t.sent + 3 ? 'none' : ''
	})
	const empty = f < t.type[0] || f >= t.sent + 3
	const placeholder = root.querySelector<HTMLElement>('[data-placeholder]')
	if (placeholder) placeholder.style.opacity = empty ? '1' : '0'
	const caret = root.querySelector<HTMLElement>('[data-caret]')
	if (caret) {
		const gapFrom = t.out[PARTS - 1]
		let on = f < t.sent
		if (f >= gapFrom) on = (f - gapFrom) % (BLINK.off + BLINK.on) >= BLINK.off
		caret.style.opacity = on ? '1' : '0'
	}
	root.querySelectorAll<HTMLElement>('[data-turn]').forEach((turn, i) => {
		const active = i === q
		turn.style.visibility = active ? '' : 'hidden'
		if (!active) return
		const out = t.out
		style(turn.querySelector('[data-message]'), shown(t.sent, out[PART.message], f), `scale(${partScale(t.sent, out[PART.message], f)})`)
		style(turn.querySelector('[data-call]'), shown(t.callIn, out[PART.agent], f), `scale(${partScale(t.callIn, out[PART.agent], f)})`)
		const rise = at(GRID_A_DY, Math.min(f - t.shift, t.rest - t.shift)) * scale
		turn.querySelectorAll<HTMLElement>('[data-line]').forEach((el, k) => {
			const outAt = k === 0 ? out[PART.agent] : out[PART.table]
			const fade = easeOutCubic(clamp((f - t.lineIn[k]) / GRID_A_FADE))
			el.style.opacity = String(f >= outAt ? 0 : fade)
			el.style.transform = `translateY(${rise.toFixed(2)}px) scale(${settle60(outAt - 1 - f)})`
		})
		const thumbs = turn.querySelector<HTMLElement>('[data-thumbs]')
		if (thumbs) thumbs.style.transform = `scale(${settle60(out[PART.thumbs] - 1 - f)})`
		turn.querySelectorAll<HTMLElement>('[data-thumb]').forEach((el, k) => {
			const inAt = t.thumbIn[k]
			style(el, shown(inAt, out[PART.thumbs], f), `scale(${f >= inAt ? itemScale60(f - inAt) : 0.8})`)
		})
	})
}

/** Plays the session on `root` (the figure); returns the function that stops it. */
export function startSession(root: HTMLElement, questions: readonly SessionQuestion[]): () => void {
	const plan = planOf(questions)
	const { loop } = plan
	const rest = plan.offsets[0] + plan.timelines[0].rest
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
	let raf = 0
	let onScreen = false
	let last = 0
	let clock = (rest * 1000) / FPS
	const win = root.querySelector<HTMLElement>('[data-window]') ?? root
	const paint = (f: number) => draw(root, f, win.clientWidth / 1920, plan)
	const tick = (now: number) => {
		if (last) clock += Math.min(now - last, 100)
		last = now
		paint(Math.floor((clock * FPS) / 1000) % loop)
		raf = requestAnimationFrame(tick)
	}
	const stop = () => {
		cancelAnimationFrame(raf)
		raf = 0
		last = 0
	}
	const update = () => {
		const play = onScreen && !document.hidden && !reduce.matches
		if (play && !raf) raf = requestAnimationFrame(tick)
		if (!play && raf) stop()
		if (reduce.matches) paint(rest)
	}
	paint(rest)
	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		update()
	}, { threshold: 0.25 })
	io.observe(root)
	document.addEventListener('visibilitychange', update)
	reduce.addEventListener('change', update)
	return () => {
		stop()
		io.disconnect()
		document.removeEventListener('visibilitychange', update)
		reduce.removeEventListener('change', update)
	}
}
