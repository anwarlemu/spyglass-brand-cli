// The automation run's engine and data, shared by AutomationRun.tsx and <spyglass-automation-run> (site
// pages/Enterprise/AutomationRun.tsx): a batch of ads rushes in along a skewed conveyor under a quote and keeps drifting
// at 15px a second; under the pointer (or focus, or a tap) a card rises and tilts on a critically damped spring, the
// cards ahead give way, the conveyor calms and a note with the ad's numbers opens beside it. The engine writes
// transforms straight to the cards (no re-render per frame), runs only while the run is on screen and the tab visible,
// and with reduced motion holds the batch at rest and raises nothing. Automated browsers (navigator.webdriver) get the
// rest pose too, so screenshots and visual checks are stable.

export interface RunItem {
	/** The advertiser. */
	brand: string
	/** The ad's headline or product. */
	title: string
	/** What the creative shows (read to screen readers with the facts). */
	alt?: string
	/** The poster or still image. Without one the card draws a neutral placeholder. */
	src?: string
	/** A short muted loop played in the card (src is its poster). */
	video?: string
	/** The placeholder's neutral gradient, 1 (darkest) to 4. */
	tone?: 1 | 2 | 3 | 4
	/** Short facts: the ones that do not repeat the numbers show as chips in the note. */
	facts?: string[]
	/** First seen, YYYY-MM-DD. */
	start: string
	/** Last seen, YYYY-MM-DD (an ended ad). */
	end?: string
	/** An organic post instead of an ad: where and how many views. */
	post?: { channel: string; views: string }
	/** Where it was found, in the note's foot (the ad library, or the post's channel by default). */
	source?: string
	/** The archive id, shown as media/<first 8>. */
	media?: string
}

export interface RunStats { status: string; live: boolean; big: string; bigUnit: string; first: [string, string]; second: string; source: string; why: string[] }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const SAID_BY_NUMBERS = /^(Live since|Running|New on|Posted)/

function day(iso: string) {
	const [y, m, d] = iso.split('-').map(Number)
	const t = Date.UTC(y, m - 1, d)
	return { t, label: `${DAYS[new Date(t).getUTCDay()]} ${d} ${MONTHS[m - 1]}` }
}

/** The note's numbers for one item, counted to `reportDay` (YYYY-MM-DD). */
export function runStats(ad: RunItem, reportDay: string): RunStats {
	const start = day(ad.start)
	const end = ad.end ? day(ad.end) : null
	const ran = Math.max(1, Math.round(((end ? end.t : day(reportDay).t) - start.t) / 86_400_000))
	const days = ran === 1 ? 'day' : 'days'
	const why = (ad.facts ?? []).filter((f) => !SAID_BY_NUMBERS.test(f))
	if (ad.post) return { status: 'Post', live: false, big: ad.post.views, bigUnit: '', first: ['Views', 'Posted'], second: `${ran} ${days} ago`, source: ad.source ?? ad.post.channel, why }
	return { status: end ? 'Ended' : 'Live', live: !end, big: String(ran), bigUnit: ` ${days}`, first: ['Running', 'First seen'], second: start.label, source: ad.source ?? 'Ad library', why }
}

/** Acme placeholders: fourteen ads and two posts, as the site's Monday batch. */
export const runPlaceholders: RunItem[] = [
	{ brand: 'Acme Skin', title: 'Hand balm', alt: 'Hands working balm in on a red coat sleeve', tone: 3, facts: ['Live since Sun 8 Nov', 'Running 8 days', 'Hook: hands at work'], start: '2026-11-08', media: '80c3bfed' },
	{ brand: 'Acme Beauty', title: 'Lip tint', alt: 'Close-ups of a face and a lip tint', tone: 4, facts: ['New on Saturday', 'A launch announcement', 'Live 2 days'], start: '2026-11-14', media: 'ece12488' },
	{ brand: 'Acme Beauty', title: 'The morning routine', alt: 'A morning skincare routine in a striped top', tone: 2, facts: ['Organic post', 'A morning routine', 'Posted Thu 12 Nov'], start: '2026-11-12', post: { channel: 'Social', views: '214K' } },
	{ brand: 'Acme Wear', title: 'Up to 70% off', alt: 'Denim, a cap and a tee on a grey set', tone: 3, facts: ['New on Thursday', 'Holiday gifting push', 'Running 4 days'], start: '2026-11-12', media: '86ee28b1' },
	{ brand: 'Acme Beauty', title: 'Meet the milk', alt: 'A bottle and its texture in soft light', tone: 4, facts: ['Live since Wed 11 Nov', 'Second cut of this video', 'Running 5 days'], start: '2026-11-11', media: '74c5ea50' },
	{ brand: 'Acme Home', title: 'A winter tale', alt: 'Hands shaping dough beside a candle', tone: 2, facts: ['New on Tuesday', 'Holiday campaign', 'Running 6 days'], start: '2026-11-10', media: '46c7c900' },
	{ brand: 'Acme Wear', title: 'Archive sale', alt: 'Racks and boxes in a dark studio', tone: 1, facts: ['New on Friday', 'Archive sale', 'Running 3 days'], start: '2026-11-13', media: '690d370e' },
	{ brand: 'Acme Beauty', title: 'New from Acme', alt: 'Sunglasses and a lip treatment', tone: 3, facts: ['Live since Sun 8 Nov', 'Running 8 days', 'In 2 live ads'], start: '2026-11-08', media: '6cfbc8c5' },
	{ brand: 'Acme Studio', title: 'The small bag', alt: 'A burgundy bag at a kitchen table', tone: 4, facts: ['A new campaign film', 'Live since Sun 8 Nov', 'Running 8 days'], start: '2026-11-08', media: '8b737c67' },
	{ brand: 'Acme Beauty', title: 'Skin prep', alt: 'A headband and a cooling roller', tone: 2, facts: ['Organic post', 'A skin prep routine', 'Posted Sat 14 Nov'], start: '2026-11-14', post: { channel: 'Social', views: '96K' } },
	{ brand: 'Acme Skin', title: 'Gift kits', alt: 'Gift kits and bottles on dark shelves', tone: 1, facts: ['New on Thursday', 'A second ad on Friday', 'Running 4 days'], start: '2026-11-12', media: '94488045' },
	{ brand: 'Acme Wear', title: 'Up to 70% off', alt: 'A puffer, a hoodie and a tee', tone: 3, facts: ['New on Saturday', 'Live 2 days', 'A short film'], start: '2026-11-14', media: 'a00217a7' },
	{ brand: 'Acme Home', title: 'Holiday candles', alt: 'A candle lit at a dark table', tone: 2, facts: ['New on Friday', 'Holiday candles', 'A second ad on Sunday'], start: '2026-11-13', media: 'a3e6ca9c' },
	{ brand: 'Acme Skin', title: 'Gifts of the season', alt: 'Amber bottles and a gift in candlelight', tone: 4, facts: ['New on Wednesday', 'Running 5 days'], start: '2026-11-11', media: '85c7c621' },
	{ brand: 'Acme Wear', title: 'Essentials', alt: 'A varsity jacket and hoodies', tone: 1, facts: ['Paused Thursday', 'Ran 3 to 12 Nov', 'A holiday drop'], start: '2026-11-03', end: '2026-11-12', media: 'bc3d172f' },
	{ brand: 'Acme Home', title: 'Holiday gift sets', alt: 'A holiday table and a candle', tone: 3, facts: ['Paused Wednesday', 'Ran 4 to 11 Nov', 'A short film'], start: '2026-11-04', end: '2026-11-11', media: 'c557f8d6' },
]

export interface RunContent {
	/** The quote over the run. */
	request: string
	/** The list's accessible name. */
	label: string
	/** The day the numbers count to, YYYY-MM-DD. */
	reportDay: string
}

export const runContent: RunContent = {
	request: '“Acme Skin added $500K in monthly subscription revenue in less than 60 days”',
	label: 'Monday’s batch: 14 competitor ads and 2 posts',
	reportDay: '2026-11-16',
}

// The run's layout and look, the same CSS for both flavors (the React component renders it in a <style>, the element
// carries it in automation-run.css). Card faces are skewed squares sized from the run's width (--run-w, set by the engine).
export const runCss = `
.ds-run { --run-stage-h: var(--ds-ent-run-stage-h); --run-overlap: var(--ds-ent-run-overlap); --run-head-w: var(--ds-ent-run-head-w); --run-card: var(--ds-ent-run-card); --run-step-x: var(--ds-ent-run-step-x); --run-rise: var(--ds-ent-run-rise); --run-offset-y: var(--ds-ent-run-offset-y); --run-lift: var(--ds-ent-run-lift); }
@media (min-width: 768px) { .ds-run { --run-stage-h: var(--ds-ent-run-stage-h-md); --run-overlap: var(--ds-ent-run-overlap-md); --run-head-w: var(--ds-ent-run-head-w-md); --run-card: var(--ds-ent-run-card-md); --run-step-x: var(--ds-ent-run-step-x-md); --run-rise: var(--ds-ent-run-rise-md); --run-offset-y: var(--ds-ent-run-offset-y-md); --run-lift: var(--ds-ent-run-lift-md); } .ds-run-request { text-indent: -0.4em; } }
@media (min-width: 1024px) { .ds-run { --run-head-w: var(--ds-ent-run-head-w-lg); } }
@media (min-width: 1280px) { .ds-run { --run-stage-h: var(--ds-ent-run-stage-h-xl); --run-overlap: var(--ds-ent-run-overlap-xl); --run-lift: var(--ds-ent-run-lift-xl); } }
.ds-run-request { max-width: var(--run-head-w); text-box: trim-start cap alphabetic; }
.ds-run-stage { --run-w: 100vw; position: relative; height: var(--run-stage-h); margin-top: calc(var(--run-overlap) * -1); pointer-events: none; }
.ds-run-stage > * { pointer-events: auto; }
.ds-run-list { margin: 0; padding: 0; list-style: none; pointer-events: none; }
.ds-run-card {
  --s: calc(var(--i) - (var(--n) - 1));
  --card: round(var(--run-card) * var(--run-w), 8px);
  position: absolute; top: 50%; left: 50%; z-index: calc(var(--n) - var(--i));
  width: var(--card); height: var(--card); margin-top: calc(var(--card) / -2); margin-left: calc(var(--card) / -2);
  transform: translate3d(calc((var(--ds-ent-run-enter) + var(--s) * var(--run-step-x)) * var(--run-w)), calc(var(--run-offset-y) * var(--run-stage-h) - (var(--ds-ent-run-enter) + var(--s) * var(--run-step-x)) * var(--run-rise) * var(--run-w)), 0);
  will-change: transform; pointer-events: none;
}
.ds-run-layer { width: 100%; height: 100%; will-change: transform; }
.ds-run-face {
  position: relative; display: block; width: 100%; height: 100%; padding: 0; border: 0; overflow: hidden;
  border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); transform: skewY(var(--ds-ent-run-skew));
  cursor: pointer; pointer-events: auto; -webkit-tap-highlight-color: transparent;
}
.ds-run-face:focus-visible { outline: 2px solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-run-thumb { display: block; overflow: hidden; background: var(--ds-color-surface-raised); }
.ds-run-face img, .ds-run-face video, .ds-run-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; }
.ds-run [data-tone="1"] { background: linear-gradient(to bottom, var(--ds-color-neutral-4), var(--ds-color-neutral-2)); }
.ds-run [data-tone="2"] { background: linear-gradient(to bottom, var(--ds-color-neutral-5), var(--ds-color-neutral-3)); }
.ds-run [data-tone="3"] { background: linear-gradient(to bottom, var(--ds-color-neutral-6), var(--ds-color-neutral-4)); }
.ds-run [data-tone="4"] { background: linear-gradient(to bottom, var(--ds-color-neutral-7), var(--ds-color-neutral-5)); }
.ds-run-note {
  position: absolute; top: 50%; left: 50%; z-index: calc(var(--n) + 4); width: var(--ds-ent-run-note-w); padding: 12px;
  border: 1px solid var(--ds-color-edge); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-subtle);
  opacity: 0; pointer-events: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-out);
}
.ds-run-note[data-open] { opacity: 1; }
.ds-run-live::before { content: ""; width: 4px; height: 4px; border-radius: 50%; background: var(--ds-color-fg); }
@media (prefers-reduced-motion: reduce) { .ds-run-note { transition-duration: var(--ds-duration-instant); } }
`

// ---------------------------------------------------------------------------------------------------------------------
// The engine.

type Tween = { from: number; to: number; t0: number }
type Spring = { x: number; v: number; to: number }
type Pose = { lift: Spring; tilt: Spring; pushX: Spring; pushY: Spring }

const REDUCE = '(prefers-reduced-motion: reduce)'
const SCROLL_QUIET = 160
const SETTLED = 0.5

function bezier(x1: number, y1: number, x2: number, y2: number) {
	const ax = 3 * x1 - 3 * x2 + 1
	const bx = 3 * x2 - 6 * x1
	const cx = 3 * x1
	const ay = 3 * y1 - 3 * y2 + 1
	const by = 3 * y2 - 6 * y1
	const cy = 3 * y1
	const x = (t: number) => ((ax * t + bx) * t + cx) * t
	const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
	return (p: number) => {
		if (p <= 0) return 0
		if (p >= 1) return 1
		let t = p
		for (let i = 0; i < 6; i++) {
			const e = x(t) - p
			const d = dx(t)
			if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break
			t -= e / d
		}
		if (t < 0 || t > 1 || Math.abs(x(t) - p) > 1e-4) {
			let lo = 0
			let hi = 1
			t = p
			for (let i = 0; i < 24; i++) {
				if (x(t) < p) lo = t
				else hi = t
				t = (lo + hi) / 2
			}
		}
		return ((ay * t + by) * t + cy) * t
	}
}

const expoIn = (p: number) => (p <= 0 ? 0 : Math.pow(2, 10 * (p - 1)))
const rush = (x: number) => (x <= 0 ? 0 : 1 - (1 + x) * Math.exp(-x))

function readGeometry(stage: HTMLElement) {
	const css = getComputedStyle(stage)
	const num = (name: string, fallback: number) => {
		const v = parseFloat(css.getPropertyValue(name))
		return Number.isFinite(v) ? v : fallback
	}
	const ms = (name: string, fallback: number) => {
		const raw = css.getPropertyValue(name).trim()
		const v = parseFloat(raw)
		if (!Number.isFinite(v)) return fallback
		return raw.endsWith('ms') ? v : raw.endsWith('s') ? v * 1000 : v
	}
	const curve = css.getPropertyValue('--ds-easing-out').match(/cubic-bezier\(([^)]+)\)/)
	const [x1, y1, x2, y2] = curve ? curve[1].split(',').map(Number) : [0.22, 1, 0.36, 1]
	const w = stage.clientWidth
	const cardF = num('--run-card', 0.161)
	const stepX = w * num('--run-step-x', 0.065)
	return {
		w,
		h: stage.clientHeight,
		card: Math.round((w * cardF) / 8) * 8,
		stepX,
		stepY: stepX * num('--run-rise', 0.356),
		enter: (w * num('--ds-ent-run-enter', 0.3)) / stepX,
		offY: stage.clientHeight * num('--run-offset-y', 0),
		skewTan: Math.tan((num('--ds-ent-run-skew', 14.8) * Math.PI) / 180),
		lift: num('--run-lift', 180),
		tilt: num('--ds-ent-run-tilt', 12),
		wave: num('--ds-ent-run-wave', 16),
		waveSlots: num('--ds-ent-run-wave-slots', 20),
		push: num('--ds-ent-run-push', 1.8),
		reach: num('--ds-ent-run-push-reach', 3),
		drift: num('--ds-ent-run-drift', 15) / stepX,
		start: (w / 2 + (w * cardF) / 2 + 4) / stepX,
		deliver: ms('--ds-ent-run-deliver', 700) / 1000,
		calm: ms('--ds-ent-run-calm', 700),
		dur: ms('--ds-ent-run-glide', 400),
		ease: bezier(x1, y1, x2, y2),
		noteW: num('--ds-ent-run-note-w', 288),
		noteGap: num('--ds-ent-run-note-gap', 16),
		noteFade: ms('--ds-duration-micro', 160),
		noteIntent: ms('--ds-ent-run-intent', 80),
	}
}

export interface RunParts {
	/** The section: pointer moves over it are read. */
	root: HTMLElement
	stage: HTMLElement
	note: HTMLElement
	/** The quote: cards stay under its words. */
	head: HTMLElement
	/** One per item, each holding [data-push] > [data-lift]. */
	cards: HTMLElement[]
	/** The card shown (raised), for aria-expanded. */
	setShown: (i: number | null) => void
	/** The card the note describes: render its content, then set note.dataset.words to its index. */
	setNoted: (i: number | null) => void
}

export interface RunApi {
	setTapped: (i: number | null) => void
	setFocused: (i: number | null) => void
	stop: () => void
}

/** Starts the run over rendered parts. Returns the controls a card's click and focus call, and `stop`. */
export function startRun({ root, stage, note, head, cards, setShown, setNoted }: RunParts): RunApi {
	const n = cards.length
	const els = cards.map((li) => ({ anchor: li, push: li.querySelector<HTMLElement>('[data-push]')!, lift: li.querySelector<HTMLElement>('[data-lift]')! }))
	const reduce = window.matchMedia(REDUCE)
	const still = () => reduce.matches || navigator.webdriver === true
	let g = readGeometry(stage)
	const now = () => performance.now()

	let words = { l: 0, r: 0, b: -Infinity }
	const measure = () => {
		const s = stage.getBoundingClientRect()
		const h = head.getBoundingClientRect()
		const cx = s.left + s.width / 2
		const cy = s.top + s.height / 2
		const text = document.createRange()
		text.selectNodeContents(head)
		const lines = [...text.getClientRects()].filter((r) => r.width > 0)
		const left = lines.length ? Math.min(...lines.map((r) => r.left)) : h.left
		const right = lines.length ? Math.max(...lines.map((r) => r.right)) : h.right
		text.detach()
		words = { l: left - cx, r: right - cx, b: h.bottom - cy }
		stage.style.setProperty('--run-w', `${stage.clientWidth}px`)
	}
	measure()

	const tw = (v = 0): Tween => ({ from: v, to: v, t0: -Infinity })
	const value = (t: Tween, at: number, dur = g.dur) => {
		const p = (at - t.t0) / dur
		return p >= 1 ? t.to : t.from + (t.to - t.from) * g.ease(Math.max(0, p))
	}
	const retarget = (t: Tween, to: number, at: number, dur = g.dur) => {
		if (Math.abs(t.to - to) < SETTLED && (to !== 0 || t.to === 0)) return
		t.from = reduce.matches ? to : value(t, at, dur)
		t.to = to
		t.t0 = reduce.matches ? -Infinity : at
	}
	const moving = (t: Tween, at: number, dur = g.dur) => at - t.t0 < dur && t.from !== t.to

	const omega = () => 6.4 / (g.dur / 1000)
	const sp = (): Spring => ({ x: 0, v: 0, to: 0 })
	const aim = (s: Spring, to: number) => {
		if (Math.abs(s.to - to) < 0.01) return
		s.to = to
		if (reduce.matches) {
			s.x = to
			s.v = 0
		}
	}
	const step = (s: Spring, dt: number) => {
		if (s.x === s.to && s.v === 0) return
		const w = omega()
		const e = s.x - s.to
		const b = s.v + w * e
		const decay = Math.exp(-w * dt)
		s.x = s.to + (e + b * dt) * decay
		s.v = (b - w * (e + b * dt)) * decay
		if (Math.abs(s.x - s.to) < 0.05 && Math.abs(s.v) < 0.5) {
			s.x = s.to
			s.v = 0
		}
	}
	const settled = (s: Spring) => s.x === s.to && s.v === 0
	const poses: Pose[] = els.map(() => ({ lift: sp(), tilt: sp(), pushX: sp(), pushY: sp() }))

	const loop = () => Math.max(n, g.start + (g.w / 2 + g.card / 2 + 4) / g.stepX)
	const along = () => ((n - 1) * loop()) / n
	let deliveredAt: number | null = null
	let drifted = 0
	const pace = tw(1)
	let last = now()
	const conveyor = (at: number) => {
		if (still()) return along() + g.card / g.stepX
		if (deliveredAt === null) return 0
		return along() * rush((at - deliveredAt) / 1000 / g.deliver) + drifted
	}

	const rest = els.map(() => ({ x: 0, y: 0, drawnY: 0, m: 0, on: false }))
	let hovered: number | null = null
	let focused: number | null = null
	let tapped: number | null = null
	let up: number | null = null

	let noteFor: number | null = null
	let noteOpen = false
	let noteGoneAt = 0
	let upSince = 0
	let noteWords: number | null = null
	function placeNote(at: number, half: number, under: (x: number, reach: number) => boolean) {
		if (noteFor !== up && noteOpen) {
			delete note.dataset.open
			noteOpen = false
			noteGoneAt = at + g.noteFade
		}
		if (noteFor !== up && !noteOpen && at >= noteGoneAt) {
			noteFor = up
			if (up !== null && noteWords !== up) {
				noteWords = up
				setNoted(up)
			}
		}
		if (noteFor === null || noteFor !== up) return
		const c0 = rest[noteFor]
		const lift = poses[noteFor].lift.x
		const reachX = g.card * 0.6
		let left = c0.x + reachX + g.noteGap
		let top = c0.drawnY - lift - half
		if (left + g.noteW > g.w / 2 - g.noteGap) {
			left = c0.x - reachX - g.noteGap - g.noteW
			if (left < -g.w / 2 + g.noteGap) {
				left = c0.x - g.noteW / 2
				top = c0.drawnY - lift + reachX + g.noteGap
			}
		}
		left = Math.min(g.w / 2 - g.noteGap - g.noteW, Math.max(-g.w / 2 + g.noteGap, left))
		const roof = under(left + g.noteW / 2, g.noteW / 2) ? words.b + g.noteGap : -g.h / 2 + g.noteGap
		top = Math.min(g.h / 2 - g.noteGap - note.offsetHeight, Math.max(roof, top))
		note.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`
		if (!noteOpen && at - upSince >= g.noteIntent && note.dataset.words === String(up)) {
			note.dataset.open = ''
			noteOpen = true
		}
	}

	const layout = (at: number) => {
		const c = conveyor(at)
		const L = loop()
		const space = L / n
		const half = g.card / 2
		const reachY = half + 6 + g.skewTan * (half + 6)
		const lowY = -g.h / 2 + 4
		const highY = g.h / 2 - 4
		const under = (x: number, reach: number) => x - reach < words.r + g.noteGap && x + reach > words.l
		const below = Math.max(lowY, words.b + g.noteGap)
		const ramp = g.card * 0.5
		const ceiling = (x: number) => {
			const reach = g.card * 0.6
			if (x + reach <= words.l) return lowY
			const t = Math.min(1, Math.max(0, (words.r + g.noteGap - (x - reach)) / ramp))
			return lowY + (below - lowY) * t * t * (3 - 2 * t)
		}
		for (let k = 0; k < n; k++) {
			const q = c - k * space
			const m = q < 0 ? 0 : q % L
			const s = g.start - m
			const wave = Math.sin((2 * Math.PI * s) / g.waveSlots)
			const a = s + 0.09 * wave
			const x = a * g.stepX
			const yRest = g.offY - a * g.stepY + g.wave * wave
			const gone = x + g.card / 2 + 4 < -g.w / 2
			const p = poses[k]
			const lift = p.lift.x
			const tilt = p.tilt.x
			const pushX = p.pushX.x
			const pushY = p.pushY.x
			const top = ceiling(x + pushX) + reachY + lift - pushY
			const bottom = highY - reachY - pushY
			const y = top <= bottom ? Math.min(bottom, Math.max(top, yRest)) : (top + bottom) / 2
			const place = Math.min(highY - reachY, Math.max(ceiling(x) + reachY, yRest))
			const r = rest[k]
			r.x = x
			r.y = place
			r.drawnY = y
			r.m = m
			r.on = !gone && x - g.card / 4 < g.w / 2
			const e = els[k]
			e.anchor.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
			e.anchor.style.visibility = gone ? 'hidden' : 'visible'
			e.anchor.style.zIndex = String(reduce.matches && k === up ? n + 2 : 1 + Math.min(n - 1, Math.floor(m / space)))
			e.push.style.transform = `translate3d(${pushX.toFixed(2)}px, ${pushY.toFixed(2)}px, 0)`
			e.lift.style.transform = `translate3d(0, ${(-lift).toFixed(2)}px, 0) rotate(${tilt.toFixed(3)}deg)`
		}
		placeNote(at, half, under)
	}

	const on = (k: number, px: number, py: number, drawn: boolean) => {
		const r = rest[k]
		const half = g.card / 2
		let dx: number
		let dy: number
		if (drawn) {
			const p = poses[k]
			dx = px - (r.x + p.pushX.x)
			dy = py - (r.drawnY + p.pushY.x - p.lift.x)
			const turn = (-p.tilt.x * Math.PI) / 180
			;[dx, dy] = [dx * Math.cos(turn) - dy * Math.sin(turn), dx * Math.sin(turn) + dy * Math.cos(turn)]
		} else {
			dx = px - r.x
			dy = py - r.y
		}
		const v = dy - g.skewTan * dx
		return Math.abs(dx) <= half && Math.abs(v) <= half
	}
	const hit = (px: number, py: number) => {
		if (hovered !== null && on(hovered, px, py, true)) return hovered
		let best: number | null = null
		for (let k = 0; k < n; k++) {
			if (k === hovered || !rest[k].on || !on(k, px, py, true)) continue
			if (best === null || rest[k].m > rest[best].m) best = k
		}
		if (hovered !== null && on(hovered, px, py, false) && (best === null || rest[best].m < rest[hovered].m)) return hovered
		return best
	}

	const pushFrom = (px: number, py: number) => {
		const len = Math.hypot(g.stepX, g.stepY) || 1
		const mx = -g.stepX / len
		const my = g.stepY / len
		const reach = len * g.reach
		const most = len * g.push
		const ahead: { k: number; d: number }[] = []
		for (let k = 0; k < n; k++) {
			const r = rest[k]
			if (k !== up && r.on && (r.x - px) * mx + (r.y - py) * my > 0) ahead.push({ k, d: Math.hypot(r.x - px, r.y - py) })
			else {
				aim(poses[k].pushX, 0)
				aim(poses[k].pushY, 0)
			}
		}
		ahead.sort((a, b) => a.d - b.d).forEach(({ k, d }, rank) => {
			const push = most * Math.min(1, Math.max(0, 1 - d / reach)) * (1 - expoIn(Math.min(1, (rank + 1) / 5)))
			aim(poses[k].pushX, reduce.matches ? 0 : mx * push)
			aim(poses[k].pushY, reduce.matches ? 0 : my * push)
		})
	}

	let pointer: { x: number; y: number } | null = null
	let pointerMoved = false
	let scrolledAt = -Infinity
	let frameBox: DOMRect | null = null
	const toStage = () => {
		if (!pointer) return null
		const s = frameBox ?? stage.getBoundingClientRect()
		return { x: pointer.x - s.left - s.width / 2, y: pointer.y - s.top - s.height / 2 }
	}

	const decide = (at = now()) => {
		const next = hovered ?? tapped ?? focused
		if (next !== up) {
			up = next
			upSince = at
			setShown(next)
			for (let k = 0; k < n; k++) {
				const raise = k === up && !reduce.matches
				aim(poses[k].lift, raise ? g.lift : 0)
				aim(poses[k].tilt, raise ? g.tilt : 0)
			}
			retarget(pace, up === null ? 1 : 0, at, g.calm)
		}
		const p = toStage()
		if (up === null) {
			for (const pose of poses) {
				aim(pose.pushX, 0)
				aim(pose.pushY, 0)
			}
		} else if (hovered !== null && p) pushFrom(p.x, p.y)
		else pushFrom(rest[up].x, rest[up].y)
		wake()
	}

	let raf = 0
	let inView = false
	const tick = () => {
		raf = 0
		frameBox = pointer ? stage.getBoundingClientRect() : null
		const at = now()
		const dt = Math.min(0.05, Math.max(0, (at - last) / 1000))
		last = at
		if (deliveredAt !== null && !still()) drifted += g.drift * value(pace, at, g.calm) * dt
		for (const p of poses) {
			step(p.lift, dt)
			step(p.tilt, dt)
			step(p.pushX, dt)
			step(p.pushY, dt)
		}
		layout(at)
		const rushing = deliveredAt !== null && !still() && (at - deliveredAt) / 1000 < 3.5 * g.deliver
		if (pointer && at - scrolledAt >= SCROLL_QUIET && !rushing) {
			const p = toStage()!
			const next = hit(p.x, p.y)
			if (next !== hovered) {
				hovered = next
				decide(at)
			} else if (pointerMoved && hovered !== null) pushFrom(p.x, p.y)
		}
		pointerMoved = false
		frameBox = null
		const busy =
			(deliveredAt !== null && !still()) ||
			pointer !== null ||
			moving(pace, at, g.calm) ||
			noteFor !== up ||
			(up !== null && !noteOpen) ||
			poses.some((p) => !settled(p.lift) || !settled(p.tilt) || !settled(p.pushX) || !settled(p.pushY))
		if (busy) wake()
	}
	function wake() {
		if (!raf && inView && !document.hidden) {
			last = now()
			raf = requestAnimationFrame(tick)
		}
	}

	const onMove = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return
		pointer = { x: e.clientX, y: e.clientY }
		pointerMoved = true
		wake()
	}
	const onOut = () => {
		pointer = null
		if (hovered !== null) {
			hovered = null
			decide()
		}
	}
	const onLeave = (e: PointerEvent) => {
		if (e.pointerType === 'mouse') onOut()
	}
	const onScroll = () => {
		scrolledAt = now()
		if (hovered !== null) {
			hovered = null
			decide()
		}
		wake()
	}
	const onDown = (e: PointerEvent) => {
		if (tapped !== null && !e.composedPath().includes(stage)) {
			tapped = null
			decide()
		}
	}
	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && (tapped !== null || focused !== null || hovered !== null)) {
			tapped = null
			focused = null
			decide()
		}
	}

	const visibleShare = () => {
		const s = stage.getBoundingClientRect()
		const seen = Math.min(s.bottom, window.innerHeight) - Math.max(s.top, 0)
		return Math.max(0, seen) / Math.max(1, s.height)
	}
	if (visibleShare() >= 0.6) deliveredAt = now() - 20 * 1000 * g.deliver
	const deliver = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting || deliveredAt !== null) return
		deliveredAt = now()
		deliver.disconnect()
		wake()
	}, { rootMargin: '0px 0px 25% 0px', threshold: [0] })
	if (deliveredAt === null) deliver.observe(stage)
	const io = new IntersectionObserver(([entry]) => {
		inView = entry.isIntersecting
		wake()
	}, { rootMargin: '100px' })
	io.observe(stage)
	const ro = new ResizeObserver(() => {
		g = readGeometry(stage)
		measure()
		layout(now())
		wake()
	})
	ro.observe(stage)
	ro.observe(head)
	const onVisible = () => wake()
	const onReduce = () => {
		g = readGeometry(stage)
		hovered = null
		tapped = null
		decide()
		layout(now())
	}
	layout(now())
	stage.dataset.live = ''
	root.addEventListener('pointermove', onMove)
	root.addEventListener('pointerleave', onLeave)
	window.addEventListener('blur', onOut)
	window.addEventListener('scroll', onScroll, { passive: true })
	window.addEventListener('pointerdown', onDown)
	window.addEventListener('keydown', onKey)
	document.addEventListener('visibilitychange', onVisible)
	reduce.addEventListener('change', onReduce)
	return {
		setTapped: (i) => {
			tapped = i
			decide()
		},
		setFocused: (i) => {
			focused = i
			decide()
		},
		stop: () => {
			cancelAnimationFrame(raf)
			deliver.disconnect()
			io.disconnect()
			ro.disconnect()
			root.removeEventListener('pointermove', onMove)
			root.removeEventListener('pointerleave', onLeave)
			window.removeEventListener('blur', onOut)
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('pointerdown', onDown)
			window.removeEventListener('keydown', onKey)
			document.removeEventListener('visibilitychange', onVisible)
			reduce.removeEventListener('change', onReduce)
			delete stage.dataset.live
		},
	}
}
