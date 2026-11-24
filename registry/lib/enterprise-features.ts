// The enterprise features, shared by EnterpriseFeatures.tsx and <spyglass-enterprise-features> (site pages/Enterprise
// FeatureGrid and Feature*.tsx, v2/V2Features/Demo and timeline): the copy and data (Acme), the looping sketches'
// timelines and the runner that plays them. Each sketch is a set of tracks (an element, its rest style and keyframes
// at times in its loop), played as infinite Web Animations from a time of its own, only while a quarter of it is on
// screen and the tab visible. Reduced motion leaves every sketch at rest (its finished state). Automated browsers
// (navigator.webdriver) get the rest state too, so screenshots and visual checks are stable.
import { LOGOS } from '@/lib/logos'

/** A picture in a sketch: your image, or a neutral gradient (tone 1, darkest, to 4). */
export interface FeatureShot { src?: string; tone?: 1 | 2 | 3 | 4; crop?: string }
/** A mark in a tile: your image (drawn White through a mask), or the name's first letter. */
export interface FeatureMark { name: string; mark?: string; label?: string }

export const enterpriseFeaturesContent = {
	headline: 'Built for your team',
	data: {
		title: 'Consolidate your data',
		line: 'We audit your systems and consolidate mission-critical operations into a single data layer.',
		tools: [{ name: 'Store', label: 'Store' }, { name: 'Ads manager', label: 'Ads' }, { name: 'Analytics', label: 'Analytics' }] as { name: string; mark?: string; label?: string }[],
		question: '3 systems audited',
		answer: 'One data layer',
		summary: 'Your store, ads manager and analytics, audited and wired into Acme as one data layer.',
	},
	archive: {
		title: 'Integrate the archive',
		line: 'We connect the Acme API to provide always-on competitive positioning, draft new strategy, and supercharge your applications.',
		live: 'Live',
		source: 'Acme API',
		scope: 'Running shoes',
		records: [
			{ brand: 'Acme Run', meta: 'Ran 74 days', status: 'Stopped 3 Nov', picked: true, shot: { tone: 3 } },
			{ brand: 'Acme Sport', meta: 'Ran 72 days', status: 'Stopped 2 Jul', picked: true, shot: { tone: 4 } },
			{ brand: 'Acme Trail', meta: '14.6K likes', status: 'Social post', shot: { tone: 2 } },
			{ brand: 'Acme Travel', meta: 'Running 63 days', status: 'Live', live: true, shot: { tone: 3 } },
			{ brand: 'Acme Trail', meta: '10.9K likes', status: 'Social post', shot: { tone: 1 } },
			{ brand: 'Acme Outdoor', meta: 'Ran 48 days', status: 'Stopped 27 Aug', shot: { tone: 4 } },
			{ brand: 'Acme Trail', meta: '6.9K likes', status: 'Social post', shot: { tone: 2 } },
		] as { brand: string; meta: string; status: string; picked?: boolean; live?: boolean; shot: { src?: string; tone?: 1 | 2 | 3 | 4; crop?: string } }[],
		draft: 'Draft: lead with the shoe alone',
		app: 'Your dashboard',
		stat: { value: '14', label: 'rival launches' },
		summary: 'The Acme API streams the archive: running-shoe ads and social posts arrive one by one. The stream stops, the two longest-running ads light, a strategy is drafted from them, lead with the shoe alone, and it lands in your dashboard beside 14 rival launches.',
	},
	agents: {
		title: 'Connect your AI agents',
		line: 'Your agents get auditable and configurable access through one brand-owned control plane.',
		clients: [{ name: 'Assistant' }, { name: 'Chat' }, { name: 'Editor' }] as { name: string; mark?: string; label?: string }[],
		hub: 'Your control plane',
		summary: 'Three agents, each wired through one control plane that your brand owns.',
	},
	engineers: {
		title: 'Launch your creative engine',
		line: 'Our engineers embed with your team to design, build and run the agents and workflows behind your creative output.',
		you: 'You',
		us: 'Acme engineer',
		steps: ['Every Monday', 'Rank rival launches', 'Draft the brief'] as [string, string, string],
		summary: 'Two cursors, yours and an Acme engineer’s, build a workflow together: every Monday, rank rival launches, draft the brief.',
	},
	builds: {
		title: 'Scale your creative army',
		line: 'We source the creators, influencers and creatives who fit your brand, brief them on real data, and scale your creative army, completely done-for-you. Or, you can do it yourself.',
		dashboard: { tab: 'Growth', caption: 'Sales by hook, this month', rows: [{ label: 'Founder story', value: 38 }, { label: 'Taste test', value: 24 }, { label: 'Price per meal', value: 11 }] },
		creators: { tab: 'Partnerships', caption: 'Added to', tool: { name: 'CRM' } as { name: string; mark?: string; label?: string }, rows: [{ name: '@acme.tess', note: '4 brand ads' }, { name: '@acme.nicole', note: '3 brand ads' }, { name: '@acme.tom', note: '2 brand ads' }] as { name: string; note: string; avatar?: string }[] },
		hooks: { tab: 'Creative', review: '“No afternoon crash, finally.”', source: '212 reviews say it', hook: 'Hook: No afternoon crash', rivals: '31 rival ads use it', ads: [{ tone: 3 }, { tone: 4 }, { tone: 2 }] as { src?: string; tone?: 1 | 2 | 3 | 4; crop?: string }[] },
		summary: 'One API, three teams, each with its own view: Growth’s sales by hook; Partnerships’ creators added to the CRM; Creative’s hooks from reviews, checked against rivals’ ads.',
	},
	tools: {
		title: 'Customize your stack',
		line: 'Your team can build custom tools, environments, and simulations while saving on software spend, bloat, and security.',
		request: 'Build a launch simulator',
		name: 'Launch simulator',
		metric: '30-day revenue',
		options: [{ label: '$2.99', value: '$18k', rows: 3 }, { label: '$3.49', value: '$24k', rows: 4 }, { label: '$3.99', value: '$11k', rows: 2 }],
		tag: ['Simulation', 'Built by your team'],
		summary: 'Your team asks for a launch simulator and gets one, already running: it projects 30-day revenue at three launch prices, $18k at $2.99, $24k at $3.49 and $11k at $3.99, with $3.49 ahead. A simulation built by your team.',
	},
	reports: {
		title: 'Unlimited access',
		line: 'Teams can provision access across teammates, departments, and the company, without paying for additional seats.',
		messages: [
			{ text: '14 new competitor ads', channel: '#creative', ads: [{ tone: 3, tag: 'Ran 74 days' }, { tone: 2, tag: 'Running 63 days' }] },
			{ text: 'Monday brief is ready', channel: '#growth', ads: [{ tone: 4, tag: 'Scene: Billboard at dusk' }, { tone: 2, tag: 'Product: Night serum' }] },
			{ text: '3 hooks are rising', channel: '#brand', ads: [{ tone: 3, tag: 'Hook: Does it actually work?' }, { tone: 4, tag: 'Angle: Skin first' }] },
			{ text: '5 launches to look at', channel: '#company', ads: [{ tone: 2, tag: 'Angle: Built for long runs' }, { tone: 3, tag: 'Carousel, 5 cards' }] },
		] as { text: string; channel: string; ads: [{ src?: string; tone?: 1 | 2 | 3 | 4; crop?: string } & { tag: string }, { src?: string; tone?: 1 | 2 | 3 | 4; crop?: string } & { tag: string }] }[],
		summary: 'What Acme finds, shared with every team: 14 new competitor ads, to #creative; Monday brief is ready, to #growth; 3 hooks are rising, to #brand; 5 launches to look at, to #company. Behind each message, the ads it is about.',
	},
	alpha: {
		title: 'Own your alpha',
		line: 'Zero data retention allows for you to own the alpha that keeps your company ahead.',
		workspace: 'Your private workspace',
		shots: [{ tone: 3 }, { tone: 4 }, { tone: 2 }] as { src?: string; tone?: 1 | 2 | 3 | 4; crop?: string }[],
		ask: 'Which hooks drive sales?',
		answer: 'Founder hooks drive 38% of sales',
		product: 'Acme',
		answering: 'Answering your question…',
		deleted: 'Deleted. Nothing stored.',
		summary: 'Top, your private workspace: your team’s three best ads and what you learned from them: founder hooks drive 38% of sales. Below, Acme. When you ask which hooks drive sales, copies of your ads arrive while it answers; the answer comes back to you, then each copy is deleted, leaving three empty slots: deleted, nothing stored.',
	},
}
export type EnterpriseFeaturesContent = typeof enterpriseFeaturesContent

export type FeatureKey = 'data' | 'archive' | 'agents' | 'engineers' | 'builds' | 'tools' | 'reports' | 'alpha'
/** The cards in order, with where each crops the ASCII texture. */
export const FEATURE_ORDER: { key: FeatureKey; ascii: string; start: number }[] = [
	{ key: 'data', ascii: '-440px -800px', start: 2200 },
	{ key: 'archive', ascii: '-360px -160px', start: 9200 },
	{ key: 'agents', ascii: '0 0', start: 4400 },
	{ key: 'engineers', ascii: '-200px -640px', start: 3400 },
	{ key: 'builds', ascii: '-880px -120px', start: 4000 },
	{ key: 'tools', ascii: '-120px -360px', start: 4000 },
	{ key: 'reports', ascii: '-560px -320px', start: 2200 },
	{ key: 'alpha', ascii: '-720px -480px', start: 7200 },
]

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
/** The logomark, as a mask (the control plane's hub, the data layer, the product's label). */
export const LOGOMARK_MASK = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGOS.mark.width} ${LOGOS.mark.height}" fill="#000">${LOGOS.mark.body}</svg>`)
/** A neutral chat glyph for the message bar. */
export const CHAT_MASK = svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><path d="M5 3h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-7l-5 4v-4H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"/></svg>')

// ---------------------------------------------------------------------------------------------------------------------
// The agents' wires, the tools' chart and the reports' scroll (site data).

export type Glyph = { x: number; y: number; g: string }
const across = (from: number, to: number): Glyph[] => {
	const out: Glyph[] = []
	const dir = Math.sign(to - from)
	for (let x = from; dir * (to - x) >= 0; x += dir * 8) out.push({ x, y: 28, g: '-' })
	return out
}
export const WIRES: Glyph[][] = [
	[{ x: 24, y: 10, g: ':' }, { x: 24, y: 28, g: '+' }, ...across(32, 104)],
	[{ x: 112, y: 10, g: ':' }, { x: 112, y: 28, g: '+' }, { x: 112, y: 46, g: ':' }],
	[{ x: 200, y: 10, g: ':' }, { x: 200, y: 28, g: '+' }, ...across(192, 120)],
]
export const DATA_DASHES = 4
export const TOOL_AXIS = '-'.repeat(24)
export const toolColumn = (rows: number, top: boolean) => Array.from({ length: rows }, () => (top ? '#' : '=').repeat(4))
export const toolWinner = (options: { rows: number }[]) => options.reduce((best, o, i) => (o.rows > options[best].rows ? i : best), 0)

const R_FRAME = 1000 / 60
const R_HOLD = 74
const R_SCROLL_FRAMES = 52
const R_STEP = 131
const R_TRAVEL = 447 / 266
const R_LAG = 3.3
const R_SCROLL = [0, 0.0094, 0.0363, 0.0729, 0.132, 0.1765, 0.2297, 0.2812, 0.3335, 0.3844, 0.4294, 0.4683, 0.5123, 0.5481, 0.5817, 0.6152, 0.6488, 0.6734, 0.7002, 0.7271, 0.7494, 0.7696, 0.7886, 0.8054, 0.821, 0.8378, 0.8512, 0.8658, 0.8792, 0.8893, 0.8993, 0.9094, 0.9183, 0.9273, 0.934, 0.9407, 0.9474, 0.9541, 0.9586, 0.9642, 0.9687, 0.9732, 0.9754, 0.9799, 0.9843, 0.9888, 0.9899, 0.9933, 0.9955, 0.9978, 0.9978, 0.9989, 1]
const R_CHIP_H = 35
const R_LABEL_OUT: [number, number, number][] = [[0, 0, 1], [1, -2, 1], [2, -4, 1], [3, -6, 0.95], [4, -9, 1], [5, -11, 0.9], [6, -14, 0.68], [8, -17, 0.36], [9, -19.5, 0.14], [10, -21, 0]]
const R_LABEL_IN: [number, number, number][] = [[7, 15, 0], [8, 13, 0.27], [9, 11, 0.46], [10, 9, 0.54], [11, 8, 0.64], [12, 7, 0.73], [13, 6, 0.78], [14, 5, 0.88], [15, 4, 0.97], [16, 4, 1], [17, 3, 1], [19, 2, 1], [21, 1, 1], [28, 0, 1]]
type Box4 = [number, number, number, number]
const R_LAYOUTS: [Box4, Box4][] = [[[0, 0.041, 0.477, 0.951], [0.566, 0.15, 1, 0.85]], [[0, 0, 0.689, 0.387], [0.409, 0.519, 1, 1]]]
/** Where a report's ad sits in its layer (left, top, width, height in %). */
export function reportBox(m: number, c: number): Record<string, string> {
	const [l, t, r, b] = R_LAYOUTS[m % R_LAYOUTS.length][c]
	return { left: `${l * 100}%`, top: `${t * 100}%`, width: `${(r - l) * 100}%`, height: `${(b - t) * 100}%` }
}
export const REPORTS_START = (R_HOLD / 2) * R_FRAME

// ---------------------------------------------------------------------------------------------------------------------
// Timelines.

type Frame = { at: number; style: Keyframe; ease?: string }
type Track = { el: Element | null | undefined; rest: Keyframe; frames: Frame[] }
type Timeline = { duration: number; tracks: Track[] }

const move = (from: number, to: number, a: Keyframe, b: Keyframe, ease: string): Frame[] => [{ at: from, style: a, ease }, { at: to, style: b }]
const snap = (at: number, a: Keyframe, b: Keyframe): Frame[] => [{ at, style: a }, { at: at + 1, style: b }]

const C_STEP = 1000 / 60
const curve = (b: number[]) => `cubic-bezier(${b.join(', ')})`
const ARRIVE = { dur: 21.78 * C_STEP, ease: curve([0.417, 0.889, 0.791, 0.925]) }
const LEAVE = { dur: 10.02 * C_STEP, ease: curve([0.34, 0.82, 0.621, 0.953]), scale: 0.955 }
const LEAVE_STEP = 2 * C_STEP
const FRAME = 1000 / 30
const SETTLE = [0.9, 0.929, 0.943, 0.953, 0.962, 0.97, 0.976, 0.98, 0.984, 0.987, 0.99, 0.992, 0.994, 0.996, 0.997, 0.998, 0.999, 1]
const scaled = (opacity: number, scale: number): Keyframe => ({ opacity, transform: `scale(${Number(scale.toFixed(4))})` })
const settleAt = (k: number, from: number) => 1 - ((1 - SETTLE[k]) * (1 - from)) / (1 - SETTLE[0])
const settleIn = (at: number, from = SETTLE[0]): Frame[] => [{ at: at - 1, style: scaled(0, settleAt(0, from)) }, ...SETTLE.map((_, k) => ({ at: at + k * FRAME, style: scaled(1, settleAt(k, from)) }))]
const WHOLE = scaled(1, 1)
const hiddenAt = (scale = SETTLE[0]) => scaled(0, scale)

type Motion = { step: number; change: number; fade: number; swap: number; ease: string; glide: number; glideEase: string; stagger: number }
function readMotion(el: Element): Motion {
	const css = getComputedStyle(el)
	const v = (n: string) => css.getPropertyValue(n).trim()
	const ms = (n: string, f: number) => {
		const raw = v(n)
		const x = parseFloat(raw)
		return Number.isFinite(x) ? (raw.endsWith('ms') ? x : raw.endsWith('s') ? x * 1000 : x) : f
	}
	return { step: ms('--ds-ent-feat-step', 2600), change: ms('--ds-ent-feat-change', 700), fade: ms('--ds-ent-feat-fade', 500), swap: ms('--ds-ent-feat-switch', 150), ease: v('--ds-easing-loop') || 'ease-in-out', glide: ms('--ds-ent-feat-glide', 400), glideEase: v('--ds-easing-out') || 'ease-out', stagger: ms('--ds-ent-feat-stagger', 180) }
}

const on = { opacity: 1 }
const off = { opacity: 0 }

const TIMELINES: Record<FeatureKey, (root: HTMLElement, m: Motion) => Timeline> = {
	data(root, m) {
		const duration = 2 * m.step
		const shown = (el: Element) => (el as HTMLElement).offsetParent !== null
		const lit = (path: string) => [...root.querySelectorAll(`[data-path="${path}"]`)].filter(shown)
		const tracks: Track[] = []
		let t = m.step / 3
		for (const el of [...lit('q').reverse(), ...lit('row').reverse(), ...lit('a')]) {
			tracks.push({ el, rest: off, frames: [...snap(t, off, on), ...move(t + 1, t + m.fade, on, off, m.ease)] })
			t += 48
		}
		tracks.push({ el: root.querySelector('[data-answer]'), rest: on, frames: [...move(0, m.fade, on, off, m.ease), ...move(t, t + ARRIVE.dur, off, on, ARRIVE.ease)] })
		return { duration, tracks }
	},
	archive(root, m) {
		const duration = 4 * m.step
		const tracks: Track[] = []
		const whole = { opacity: 1, transform: 'scale(1)' }
		const gone = { opacity: 0, transform: `scale(${LEAVE.scale})` }
		const waiting = { opacity: 0, transform: 'scale(1)' }
		const n = Number(root.querySelector<HTMLElement>('[data-strip]')?.dataset.count ?? 0)
		const strip = root.querySelector<HTMLElement>('[data-strip]')
		const rows = [...root.querySelectorAll<HTMLElement>('[data-row]')]
		const pitch = rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 0
		const every = m.step / 4
		const y = (k: number): Keyframe => ({ transform: `translateY(${-k * pitch}px)` })
		const frames = Array.from({ length: n }, (_, i) => {
			const at = m.fade + i * every
			return move(at, at + m.glide, y(i), y(i + 1), m.glideEase)
		}).flat()
		const landed = m.fade + (n - 1) * every + m.glide
		tracks.push({ el: strip, rest: y(0), frames: [...frames, ...snap(landed, y(n), y(0))] })
		const read = 2 * m.step
		rows.forEach((el) => {
			if (el.dataset.place === 'picked') return
			const rest = { opacity: Number(getComputedStyle(el).opacity) }
			tracks.push({ el, rest, frames: [...move(0, m.fade, rest, on, m.ease), ...move(read, read + m.fade, on, rest, m.ease)] })
		})
		const drafted = read + m.fade
		tracks.push({ el: root.querySelector('[data-draft]'), rest: whole, frames: [...move(LEAVE_STEP, LEAVE_STEP + LEAVE.dur, whole, gone, LEAVE.ease), ...snap(LEAVE_STEP + LEAVE.dur, gone, waiting), ...move(drafted, drafted + ARRIVE.dur, waiting, whole, ARRIVE.ease)] })
		const shipped = 3 * m.step
		for (const el of [root.querySelector('[data-app-ground]'), root.querySelector('[data-app-head]')]) tracks.push({ el, rest: whole, frames: [...move(0, LEAVE.dur, whole, gone, LEAVE.ease), ...snap(LEAVE.dur, gone, waiting), ...move(shipped, shipped + ARRIVE.dur, waiting, whole, ARRIVE.ease)] })
		return { duration, tracks }
	},
	agents(root, m) {
		const duration = 2 * m.step
		const marks = root.querySelectorAll('[data-mark]')
		const tracks: Track[] = []
		WIRES.forEach((glyphs, i) => {
			const draw = m.step / 2 + i * m.stagger
			const els = root.querySelectorAll(`[data-wire="${i}"]`)
			glyphs.forEach((_, k) => {
				const at = draw + (k / glyphs.length) * m.change
				tracks.push({ el: els[k], rest: on, frames: [...move(0, m.fade, on, off, m.ease), ...snap(at, off, on)] })
			})
			tracks.push({ el: marks[i], rest: on, frames: [...move(0, m.fade, on, { opacity: 0.32 }, m.ease), ...move(draw, draw + m.swap, { opacity: 0.32 }, on, m.ease)] })
		})
		return { duration, tracks }
	},
	engineers(root, m) {
		const build = root.querySelector<HTMLElement>('[data-build]')
		const steps = [...root.querySelectorAll<HTMLElement>('[data-step]')]
		const links = [...root.querySelectorAll<HTMLElement>('[data-link]')]
		const you = root.querySelector<HTMLElement>('[data-you]')
		const us = root.querySelector<HTMLElement>('[data-us]')
		const duration = 2 * m.step
		if (!build || steps.length < 3 || !you || !us) return { duration, tracks: [] }
		type Point = { x: number; y: number }
		const reach = (a: Point, b: Point) => Math.round(Math.min(720, Math.max(420, 300 + Math.hypot(b.x - a.x, b.y - a.y) * 1.6)))
		const covered = (t: number) => t * t * t * (10 - 15 * t + 6 * t * t)
		const origin = build.getBoundingClientRect()
		const column = getComputedStyle(steps[0].parentElement?.parentElement ?? build).flexDirection === 'column'
		const at = (el: HTMLElement, dx = 0, dy = 0): Point => {
			const r = el.getBoundingClientRect()
			const x = column ? r.right - 8 : r.left + r.width / 2 + 8
			const y = column ? r.top + r.height / 2 - 4 : r.bottom - 12
			return { x: x - origin.left + dx, y: y - origin.top + dy }
		}
		const restYou = at(steps[0])
		const restUs = at(steps[2])
		you.style.left = `${restYou.x}px`
		you.style.top = `${restYou.y}px`
		us.style.left = `${restUs.x}px`
		us.style.top = `${restUs.y}px`
		const from = (rest: Point, p: Point): Keyframe => ({ transform: `translate(${p.x - rest.x}px, ${p.y - rest.y}px)` })
		const meetYou = at(steps[1], -32, 0)
		const meetUs = at(steps[1], 8, -16)
		const still = { transform: 'translate(0px, 0px)' }
		const glide = (rest: Point, t0: number, a: Point, b: Point, bend: number): Frame[] => {
			const dx = b.x - a.x
			const dy = b.y - a.y
			const len = Math.hypot(dx, dy) || 1
			const c = { x: (a.x + b.x) / 2 - (dy / len) * len * bend, y: (a.y + b.y) / 2 + (dx / len) * len * bend }
			const dur = reach(a, b)
			const past = Math.min(6, len * 0.04)
			const frames: Frame[] = []
			for (let i = 0; i <= 12; i++) {
				const t = i / 12
				const k = covered(t)
				const u = 1 - k
				const p = { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y }
				const over = t === 1 ? { x: p.x + (dx / len) * past, y: p.y + (dy / len) * past } : p
				frames.push({ at: t0 + t * dur, style: from(rest, over), ease: 'linear' })
			}
			frames.push({ at: t0 + dur + 160, style: from(rest, b), ease: 'ease-out' })
			return frames
		}
		const middle = reach(restYou, meetYou) + m.swap
		const left = middle + ARRIVE.dur + m.swap
		const right = left + m.stagger + 120
		const whole = { opacity: 1, transform: 'scale(1)' }
		const gone = { opacity: 0, transform: `scale(${LEAVE.scale})` }
		const waiting = { opacity: 0, transform: 'scale(1)' }
		const arrive = (el: HTMLElement, i: number, t: number): Track => ({ el, rest: whole, frames: [...move(i * LEAVE_STEP, i * LEAVE_STEP + LEAVE.dur, whole, gone, LEAVE.ease), ...snap(i * LEAVE_STEP + LEAVE.dur + 1, gone, waiting), ...move(t, t + ARRIVE.dur, waiting, whole, ARRIVE.ease)] })
		const draw = (el: HTMLElement, t: number): Track => {
			const flat = el.offsetWidth > el.offsetHeight
			const none = { opacity: 0, clipPath: flat ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)' }
			const full = { opacity: 1, clipPath: 'inset(0 0 0 0)' }
			return { el, rest: full, frames: [...move(0, LEAVE.dur, full, { ...full, opacity: 0 }, LEAVE.ease), ...snap(LEAVE.dur + 1, { ...full, opacity: 0 }, none), ...move(t, t + ARRIVE.dur, none, full, ARRIVE.ease)] }
		}
		return {
			duration,
			tracks: [
				arrive(steps[1], 0, middle),
				arrive(steps[0], 1, left + reach(meetYou, restYou)),
				arrive(steps[2], 2, right + reach(meetUs, restUs)),
				draw(links[0], left + reach(meetYou, restYou)),
				draw(links[1], right + reach(meetUs, restUs)),
				{ el: you, rest: still, frames: [...glide(restYou, 0, restYou, meetYou, 0.12), ...glide(restYou, left, meetYou, restYou, -0.1)] },
				{ el: us, rest: still, frames: [...glide(restUs, LEAVE_STEP * 2 + 90, restUs, meetUs, -0.14), ...glide(restUs, right, meetUs, restUs, 0.09)] },
			],
		}
	},
	builds(root, m) {
		const duration = 3 * m.step
		const whole = { opacity: 1, transform: 'scale(1)' }
		const gone = { opacity: 0, transform: `scale(${LEAVE.scale})` }
		const hidden = { opacity: 0, transform: 'scale(1)' }
		const panels = [...root.querySelectorAll('[data-panel]')]
		const tabs = [...root.querySelectorAll('[data-tab]')]
		const change = LEAVE.dur + ARRIVE.dur
		const at = (j: number) => (j + 1) * m.step - change
		const tracks: Track[] = []
		panels.forEach((el, i) => {
			const first = i === 0
			const inAt = at((i + 2) % 3)
			const outAt = at(i)
			const leave = [...move(outAt, outAt + LEAVE.dur, whole, gone, LEAVE.ease), ...snap(outAt + LEAVE.dur, gone, hidden)]
			const arrive = move(inAt + LEAVE.dur, inAt + change, hidden, whole, ARRIVE.ease)
			tracks.push({ el, rest: first ? whole : hidden, frames: first ? [...leave, ...arrive] : [...arrive, ...leave] })
			const swapOut = move(outAt, outAt + m.swap, on, off, m.ease)
			const swapIn = move(inAt + LEAVE.dur, inAt + LEAVE.dur + m.swap, off, on, m.ease)
			tracks.push({ el: tabs[i], rest: first ? on : off, frames: first ? [...swapOut, ...swapIn] : [...swapIn, ...swapOut] })
		})
		return { duration, tracks }
	},
	tools(root, m) {
		const duration = 2 * m.step
		const tracks: Track[] = []
		const made = m.fade + m.stagger
		const ready = made + ARRIVE.dur
		tracks.push({ el: root.querySelector('[data-tool-panel]'), rest: on, frames: [...move(0, m.fade, on, off, m.ease), ...move(made, ready, off, on, ARRIVE.ease)] })
		const run = ready + m.stagger
		root.querySelectorAll('[data-col]').forEach((col) => {
			const rows = [...col.querySelectorAll('[data-row]')].reverse()
			rows.forEach((el, k) => tracks.push({ el, rest: on, frames: [...snap(m.fade, on, off), ...snap(run + k * m.stagger, off, on)] }))
			const done = run + rows.length * m.stagger
			tracks.push({ el: col.querySelector('[data-value]'), rest: on, frames: [...snap(m.fade, on, off), ...snap(done, off, on)] })
		})
		const lit = run + 5 * m.stagger
		root.querySelectorAll('[data-lit]').forEach((el) => tracks.push({ el, rest: on, frames: [...snap(m.fade, on, off), ...move(lit, lit + m.fade, off, on, m.ease)] }))
		tracks.push({ el: root.querySelector('[data-tag]'), rest: on, frames: [...move(0, m.fade, on, off, m.ease), ...move(lit, lit + ARRIVE.dur, off, on, ARRIVE.ease)] })
		return { duration, tracks }
	},
	reports(root) {
		const count = root.querySelectorAll('[data-layer][data-c="0"]').length || 1
		const at = (frame: number) => frame * R_FRAME
		const pct = R_TRAVEL * 100
		const lift = (p: number): Keyframe => ({ transform: `translateY(${Number(p.toFixed(3))}%)` })
		const duration = at(count * R_STEP)
		const chip = root.querySelector<HTMLElement>('[data-bar]')
		const k = (chip?.offsetHeight ?? R_CHIP_H) / R_CHIP_H
		const label = (dy: number, opacity: number): Keyframe => ({ opacity, transform: `translateY(${Number((dy * k).toFixed(2))}px)` })
		const tracks: Track[] = []
		root.querySelectorAll<HTMLElement>('[data-layer]').forEach((el) => {
			const m = Number(el.dataset.m)
			const lag = Number(el.dataset.c) * R_LAG
			const inFrom = (((m - 1 + count) % count) * R_STEP + R_HOLD + lag) % (count * R_STEP)
			const outFrom = m * R_STEP + R_HOLD + lag
			const enter: Frame[] = R_SCROLL.map((p, j) => ({ at: at(inFrom + j), style: lift(pct * (1 - p)) }))
			const leave: Frame[] = R_SCROLL.map((p, j) => ({ at: at(outFrom + j), style: lift(-pct * p) }))
			const back = at(outFrom + R_SCROLL_FRAMES + 0.5)
			const reset: Frame[] = [{ at: back - 1, style: lift(-pct) }, { at: back, style: lift(pct) }]
			tracks.push({ el, rest: m === 0 ? lift(0) : lift(pct), frames: m === 0 ? [...leave, ...reset, ...enter] : [...enter, ...leave, ...reset] })
		})
		root.querySelectorAll<HTMLElement>('[data-label]').forEach((el) => {
			const m = Number(el.dataset.m)
			const outFrom = m * R_STEP + R_HOLD
			const inFrom = ((m - 1 + count) % count) * R_STEP + R_HOLD
			const leave: Frame[] = [...R_LABEL_OUT.map(([f, dy, o]) => ({ at: at(outFrom + f), style: label(dy, o) })), { at: at(outFrom + R_LABEL_OUT.at(-1)![0] + 1), style: label(0, 0) }]
			const enter: Frame[] = [{ at: at(inFrom + R_LABEL_IN[0][0]) - 1, style: label(0, 0) }, ...R_LABEL_IN.map(([f, dy, o]) => ({ at: at(inFrom + f), style: label(dy, o) }))]
			tracks.push({ el, rest: m === 0 ? label(0, 1) : label(0, 0), frames: m === 0 ? [...leave, ...enter] : [...enter, ...leave] })
		})
		return { duration, tracks }
	},
	alpha(root, m) {
		const duration = 3 * m.step
		const tracks: Track[] = []
		const el = (k: string) => root.querySelector(`[data-${k}]`)
		const all = (k: string) => [...root.querySelectorAll(`[data-${k}]`)]
		const asked = m.fade
		const sent = asked + ARRIVE.dur
		const answered = m.step + m.fade
		const cleared = 2 * m.step
		const copies = all('copy')
		const gone = cleared + (copies.length - 1) * m.stagger + m.change
		tracks.push({ el: el('answer'), rest: on, frames: [...move(0, m.fade, on, off, m.ease), ...move(answered, answered + ARRIVE.dur, off, on, ARRIVE.ease)] })
		tracks.push({ el: el('ask'), rest: off, frames: [...move(asked, asked + ARRIVE.dur, off, on, ARRIVE.ease), ...move(m.step, m.step + m.fade, on, off, m.ease)] })
		tracks.push({ el: el('deleted'), rest: WHOLE, frames: [...move(0, m.fade, WHOLE, { ...WHOLE, opacity: 0 }, m.ease), ...settleIn(gone)] })
		tracks.push({ el: el('answering'), rest: off, frames: [...move(asked, asked + ARRIVE.dur, off, on, ARRIVE.ease), ...move(cleared, cleared + m.fade, on, off, m.ease)] })
		copies.forEach((copy, i) => {
			const out = cleared + i * m.stagger
			tracks.push({ el: copy, rest: hiddenAt(0.8), frames: [...settleIn(sent + i * 2 * FRAME, 0.8), ...move(out, out + m.change, WHOLE, { ...WHOLE, opacity: 0 }, m.ease)] })
		})
		for (const sharp of all('sharp')) tracks.push({ el: sharp, rest: on, frames: move(m.step, m.step + m.change, on, off, m.ease) })
		for (const blurred of all('blurred')) tracks.push({ el: blurred, rest: off, frames: move(m.step, m.step + m.change, off, on, m.ease) })
		return { duration, tracks }
	},
}

function build({ duration, tracks }: Timeline): Animation[] {
	const out: Animation[] = []
	for (const { el, rest, frames } of tracks) {
		if (!el) continue
		const sorted = [...frames].sort((a, b) => a.at - b.at)
		const keyframes: Keyframe[] = [{ ...rest, offset: 0, easing: 'linear' }, ...sorted.map((f) => ({ ...f.style, offset: Math.min(Math.max(f.at / duration, 0), 1), easing: f.ease ?? 'linear' })), { ...rest, offset: 1 }]
		const animation = el.animate(keyframes, { duration, iterations: Infinity, fill: 'both' })
		animation.pause()
		out.push(animation)
	}
	return out
}

/** Plays one card's sketch. Returns stop. */
export function runFeature(el: HTMLElement, key: FeatureKey, start: number): () => void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
	let animations: Animation[] = []
	let onScreen = false
	let time = start
	let near = false
	const playing = () => onScreen && document.visibilityState === 'visible'
	const sync = () => {
		for (const a of animations) playing() ? a.play() : a.pause()
	}
	const clear = () => {
		const current = animations[0]?.currentTime
		if (typeof current === 'number') time = current
		for (const a of animations) a.cancel()
		animations = []
	}
	const setup = () => {
		if (!near) return
		clear()
		const timeline = TIMELINES[key](el, readMotion(el))
		if (reduce.matches || navigator.webdriver === true) return
		animations = build(timeline)
		for (const a of animations) a.currentTime = time
		sync()
	}
	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		sync()
	}, { threshold: 0.25 })
	const approach = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return
		approach.disconnect()
		near = true
		setup()
	}, { rootMargin: '100% 0px' })
	let width = el.clientWidth
	let frame = 0
	const ro = new ResizeObserver(() => {
		if (el.clientWidth === width) return
		width = el.clientWidth
		cancelAnimationFrame(frame)
		frame = requestAnimationFrame(setup)
	})
	approach.observe(el)
	io.observe(el)
	ro.observe(el)
	document.addEventListener('visibilitychange', sync)
	reduce.addEventListener('change', setup)
	return () => {
		approach.disconnect()
		io.disconnect()
		ro.disconnect()
		cancelAnimationFrame(frame)
		document.removeEventListener('visibilitychange', sync)
		reduce.removeEventListener('change', setup)
		for (const a of animations) a.cancel()
	}
}
