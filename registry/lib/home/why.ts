// The home's "Why" section (site v2/V2Why: V2Why, ArchiveAxis, WhyPricing, WhyCustom), framework-free: the copy, the
// archive's runs and the three instruments' motion, so both flavors draw and animate the same panels. The archive's
// advertiser is an Acme placeholder (the site shows a real brand); its creatives come through `creatives`.
import { lerp, setData, setStyle, setText, span, type Scene, type Tokens } from '@/lib/home/scene'
import { snap, type Motion, type Timeline, type Track } from '@/lib/home/demo'
import type { ImageSlot } from '@/lib/image'

export type WhyKey = 'memory' | 'pricing' | 'custom'
export interface WhyReason { key: WhyKey; title: string; line: string }
export type Run = { start: string; stop: string | null }
export type PricingCall = { tool: string; returned: string | null; credits: number }

export interface WhyContent {
	headline: string
	lead: string
	reasons: WhyReason[]
	archive: { brand: string; channel: string; daysLive: string; today: string; runs: Run[]; summary: string }
	meter: { period: string; pool: string; used: string; seat: string; seatPrice: string; failed: string; rule: string; calls: PricingCall[] }
	custom: { stack: string[]; used: string; one: string; all: string; summary: string }
}

export const whyContent: WhyContent = {
	headline: 'Why Spyglass',
	lead: 'One schema for Meta, Instagram and TikTok today, with more sources coming.',
	reasons: [
		{ key: 'memory', title: 'An archive, built for agents', line: 'No scrapers to build, nothing to store or analyze. The archive is already there, structured for your agents.' },
		{ key: 'pricing', title: 'Only pay for what you use', line: 'No seats, ever. One credit per record, and you can see every one of them.' },
		{ key: 'custom', title: 'Built to be customized', line: 'Stop paying for ten tools you barely use. Shape the archive into exactly what your team needs.' },
	],
	archive: {
		brand: 'Acme',
		channel: 'Meta ads',
		daysLive: 'Days live',
		today: 'Today',
		runs: [
			{ start: '2026-10-08', stop: null },
			{ start: '2026-08-04', stop: '2026-10-02' },
			{ start: '2026-06-22', stop: '2026-08-29' },
			{ start: '2026-05-20', stop: '2026-07-14' },
			{ start: '2026-03-02', stop: '2026-05-03' },
			{ start: '2026-02-09', stop: '2026-04-11' },
			{ start: '2026-01-12', stop: '2026-03-19' },
			{ start: '2025-11-03', stop: '2026-01-08' },
			{ start: '2025-08-26', stop: '2025-11-21' },
			{ start: '2025-07-28', stop: '2025-09-30' },
			{ start: '2025-05-05', stop: '2025-07-02' },
			{ start: '2025-02-10', stop: '2025-04-16' },
		],
		summary: 'Twelve Meta ads on a timeline from January 2025 to today: one still running, eleven stopped and all kept.',
	},
	meter: {
		period: 'This month',
		pool: 'API and MCP',
		used: 'Credits used',
		seat: 'Per seat',
		seatPrice: '$0',
		failed: 'Failed',
		rule: 'One credit per record returned',
		calls: [
			{ tool: 'getMedia', returned: '50 posts', credits: 50 },
			{ tool: 'getAccounts', returned: '3 brands', credits: 3 },
			{ tool: 'getMedia', returned: null, credits: 0 },
			{ tool: 'getAccounts', returned: '12 creators', credits: 12 },
			{ tool: 'getMedia', returned: '20 ads', credits: 20 },
		],
	},
	custom: {
		stack: ['Ad tracker', 'Creator database', 'Social listening', 'Competitor alerts', 'Trend reports', 'Landing page tool', 'Scraper', 'Analytics', 'Reporting tool', 'Spreadsheets'],
		used: '10%',
		one: 'Spyglass, your way',
		all: '100%',
		summary: 'Ten tools, each doing one different thing and each 10% used; then Spyglass, customized to do all ten, 100% used.',
	},
}

/** A creative in the archive's frame: an image, or an Acme placeholder tone (1 to 4). */
export interface WhyCreative extends ImageSlot { tone?: 1 | 2 | 3 | 4 }
export const whyCreatives: WhyCreative[] = [{ tone: 3 }, { tone: 2 }, { tone: 4 }, { tone: 1 }]

// ----- The archive axis -----

/** The runs the frame visits, in turn, and the one it rests on. */
export const VISITS = [0, 2, 6, 11]
export const REST_VISIT = 2
export const ARCHIVE_TODAY = '2026-11-19'

const parse = (iso: string) => iso.split('-').map(Number) as [number, number, number]
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const months = (iso: string) => {
	const [y, m, d] = parse(iso)
	return (y - 2025) * 12 + (m - 1) + (d - 1) / daysIn(y, m)
}
const SPAN = months(ARCHIVE_TODAY)
export const along = (iso: string) => months(iso) / SPAN
export const endOf = (r: Run) => along(r.stop ?? ARCHIVE_TODAY)
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
export const daysLive = (run: Run) => Math.round((utc(run.stop ?? ARCHIVE_TODAY) - utc(run.start)) / 86_400_000)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const short = (iso: string) => {
	const [y, m, d] = parse(iso)
	return `${MONTHS[m - 1]} ${d}${y === 2026 ? '' : `, ${y}`}`
}
export const between = (a: string, b: string) => {
	const ya = a.slice(0, 4)
	const same = ya === b.slice(0, 4) && ya !== '2026'
	return `${same ? short(a).replace(`, ${ya}`, '') : short(a)} to ${short(b)}`
}
export const runStatus = (r: Run) => (r.stop ? `Stopped ${short(r.stop)}` : 'Running')
export const runRange = (r: Run) => (r.stop ? between(r.start, r.stop) : `Since ${short(r.start)}`)
export const pct = (x: number) => `${(x * 100).toFixed(3)}%`
export const TICKS = [...['2025-01-01', '2025-04-01', '2025-07-01', '2025-10-01', '2026-01-01', '2026-04-01', '2026-07-01', '2026-10-01'].map((iso) => ({ at: along(iso), major: iso.endsWith('01-01') })), { at: 1, major: true }]
export const YEARS = [{ label: '2025', at: along('2025-01-01') }, { label: '2026', at: along('2026-01-01') }]
/** A run's bar in the 44-column server layout: its start column and its run of = signs. */
export const barCells = (run: Run) => {
	const a = Math.floor(along(run.start) * 44)
	const b = Math.max(a + 2, Math.round(endOf(run) * 44))
	return { a, b }
}

/** The archive axis's scene: the frame visits four runs in turn, the span and the readout following. */
export function buildArchive(runs: Run[]) {
	return function build(root: HTMLElement, tok: Tokens): Scene {
		const pics = [...root.querySelectorAll<HTMLElement>('[data-pic]')]
		const lanes = root.querySelector<HTMLElement>('[data-lanes]')!
		const bars = [...root.querySelectorAll<HTMLElement>('[data-bar]')]
		const ticks = [...root.querySelectorAll<HTMLElement>('[data-tick]')]
		const years = [...root.querySelectorAll<HTMLElement>('[data-year]')]
		const sel = root.querySelector<HTMLElement>('[data-span]')
		const days = root.querySelector('[data-days]')
		const stat = root.querySelector<HTMLElement>('[data-status]')
		const rng = root.querySelector('[data-range]')
		const fading = [...root.querySelectorAll<HTMLElement>('[data-fade]')]
		const step = tok.ms('--ds-loop-step', 2600)
		const change = tok.ms('--ds-loop-change', 700)
		const home = tok.ms('--ds-loop-flick', 1400)
		const easeLoop = tok.ease('--ds-easing-loop', [0.4, 0, 0.2, 1])
		const shown = VISITS.map((v) => ({ run: runs[v], v }))
		const W = lanes.clientWidth
		const x = (at: number) => Math.min(W - 1, Math.round(at * W))
		const cols = Math.floor(W / 8)
		const cellsOf = (r: Run) => {
			const a = Math.min(cols - 2, Math.floor(along(r.start) * cols))
			return { a, b: Math.min(cols, Math.max(a + 2, Math.round(endOf(r) * cols))) }
		}
		runs.forEach((run, i) => {
			const { a, b } = cellsOf(run)
			setStyle(bars[i], 'left', `${a * 8}px`)
			setText(bars[i], '='.repeat(b - a))
		})
		TICKS.forEach((t, i) => setStyle(ticks[i], 'left', `${x(t.at)}px`))
		YEARS.forEach((y, i) => setStyle(years[i], 'left', `${x(y.at)}px`))
		const spanOf = (r: Run) => {
			const { a, b } = cellsOf(r)
			return { a: a * 8, b: Math.min(W, b * 8) }
		}
		type Seg = { from: number; to: number; at: number; dur: number }
		const segs: Seg[] = []
		let at = 0
		VISITS.forEach((_, j) => {
			segs.push({ from: j, to: j, at, dur: step })
			at += step
			const next = (j + 1) % VISITS.length
			const dur = next === 0 ? home : change
			segs.push({ from: j, to: next, at, dur })
			at += dur
		})
		const loop = at
		const rest = segs[REST_VISIT * 2].at + step / 2
		let shownReadout = -1
		const readout = (j: number) => {
			if (j === shownReadout) return
			shownReadout = j
			const r = shown[j].run
			setText(days, String(daysLive(r)))
			setText(stat, runStatus(r))
			setData(stat, 'running', r.stop ? null : '')
			setText(rng, runRange(r))
		}
		const draw = (t: number) => {
			const seg = segs.find((sg) => t >= sg.at && t < sg.at + sg.dur) ?? segs[0]
			const p = span(t, seg.at, seg.at + seg.dur)
			const k = easeLoop(p)
			const moving = seg.from !== seg.to
			const now = moving && p >= 0.5 ? seg.to : seg.from
			const A = spanOf(shown[seg.from].run)
			const B = spanOf(shown[seg.to].run)
			const left = Math.round(lerp(A.a, B.a, moving ? k : 0))
			const right = Math.round(lerp(A.b, B.b, moving ? k : 0))
			setStyle(sel, 'left', `${left}px`)
			setStyle(sel, 'width', `${Math.max(1, right - left)}px`)
			bars.forEach((bar, i) => setData(bar, 'on', i === shown[now].v ? '' : null))
			readout(now)
			const words = moving ? Math.min(1, Math.abs(p - 0.5) / 0.25).toFixed(3) : '1'
			fading.forEach((el) => setStyle(el, 'opacity', words))
			pics.forEach((pic, i) => {
				const arriving = moving && i === seg.to
				const leaving = moving && i === seg.from
				const still = !moving && i === seg.from
				setStyle(pic, 'z-index', arriving ? '2' : leaving || still ? '1' : '0')
				setStyle(pic, 'opacity', arriving ? k.toFixed(3) : leaving || still ? '1' : '0')
			})
		}
		return { loop, rest, draw }
	}
}

// ----- The pricing meter -----

export const SERVER_COLS = 18
export function meterCells(calls: PricingCall[], cols: number) {
	const total = calls.reduce((sum, c) => sum + c.credits, 0)
	let sum = 0
	return calls.map((c) => {
		const a = Math.min(cols - 1, Math.round((sum / total) * cols))
		sum += c.credits
		const b = c.credits === 0 ? a : Math.min(cols, Math.max(a + 1, Math.round((sum / total) * cols)))
		return { a, b }
	})
}
export const fmt = (n: number) => n.toLocaleString('en-US')

/** The meter's scene: the month's calls arrive one by one, each charging its records, then the month turns over. */
export function buildMeter(calls: PricingCall[]) {
	const N = calls.length
	const LAST = N - 1
	const TOTAL = calls.reduce((sum, c) => sum + c.credits, 0)
	return function build(root: HTMLElement, tok: Tokens): Scene {
		const rows = [...root.querySelectorAll<HTMLElement>('[data-row]')]
		const bars = [...root.querySelectorAll<HTMLElement>('[data-bar]')]
		const nums = [...root.querySelectorAll<HTMLElement>('[data-credits]')]
		const total = root.querySelector<HTMLElement>('[data-total]')
		const lane = root.querySelector<HTMLElement>('[data-lane]')!
		const flick = tok.ms('--ds-loop-flick', 1400)
		const change = tok.ms('--ds-loop-change', 700)
		const fade = tok.ms('--ds-loop-badge', 500)
		const step = tok.ms('--ds-loop-step', 2600)
		const ease = tok.ease('--ds-easing-loop', [0.4, 0, 0.2, 1])
		const cols = Math.max(N, Math.floor(lane.clientWidth / 8))
		const cells = meterCells(calls, cols)
		cells.forEach(({ a }, i) => setStyle(bars[i], 'left', `${a * 8}px`))
		const startOf = (i: number) => i * flick
		const charged = startOf(LAST) + change
		const turn = charged + step
		const loop = turn + change
		const rest = charged + step / 2
		const before = calls.map((_, i) => calls.slice(0, i).reduce((sum, c) => sum + c.credits, 0))
		const draw = (t: number) => {
			if (t >= turn) {
				const p = span(t, turn, loop)
				const out = (1 - ease(p)).toFixed(3)
				rows.forEach((row) => setStyle(row, 'opacity', out))
				rows.forEach((row, i) => setData(row, 'on', i === LAST && p < 0.5 ? '' : null))
				setText(total, p < 0.5 ? fmt(TOTAL) : '0')
				setStyle(total, 'opacity', Math.min(1, Math.abs(p - 0.5) / 0.25).toFixed(3))
				return
			}
			setStyle(total, 'opacity', '1')
			const now = Math.min(LAST, Math.floor(t / flick))
			let sum = 0
			calls.forEach((call, i) => {
				const t0 = startOf(i)
				const shown = t >= t0
				setStyle(rows[i], 'opacity', shown ? ease(span(t, t0, t0 + fade)).toFixed(3) : '0')
				setData(rows[i], 'on', shown && i === now ? '' : null)
				const k = shown ? ease(span(t, t0, t0 + change)) : 0
				const { a, b } = cells[i]
				setText(bars[i], '='.repeat(Math.ceil((b - a) * k - 1e-6)))
				const c = Math.round(call.credits * k)
				setText(nums[i], String(c))
				if (shown) sum = before[i] + c
			})
			setText(total, fmt(sum))
		}
		return { loop, rest, draw }
	}
}

// ----- Built to be customized -----

export const CUSTOM_CELLS = 10

/** The tools' timeline: each tool's one lit cell goes dark in turn, then the last row fills, cell by cell. */
export function customTimeline(root: HTMLElement, m: Motion): Timeline {
	const duration = 2 * m.step
	const begin = m.fade + m.swap
	const show = { opacity: 1 }
	const hide = { opacity: 0 }
	const tracks: Track[] = []
	const cell = (el: Element, at: number) => {
		const dash = el.querySelector('[data-dash]')
		const hash = el.querySelector('[data-hash]')
		tracks.push({ el: hash, rest: show, frames: [...snap(m.swap, show, hide), ...snap(at, hide, show)] })
		tracks.push({ el: dash, rest: hide, frames: [...snap(m.swap, hide, show), ...snap(at, show, hide)] })
	}
	const rows = [...root.querySelectorAll('[data-tool]')]
	rows.forEach((row, i) => row.querySelectorAll('[data-cell]').forEach((el) => cell(el, begin + i * m.stagger)))
	const one = root.querySelector('[data-one]')
	const typed = begin + rows.length * m.stagger + m.change / 2
	one?.querySelectorAll('[data-cell]').forEach((el, k) => cell(el, typed + (k / CUSTOM_CELLS) * m.change))
	return { duration, tracks }
}
