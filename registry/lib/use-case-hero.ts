// The use case hero (site pages/UseCasesPage: UseCaseHero, UseCaseChat with chatClock, BuildHero): its copy, and the
// two loops both flavors drive the same way. Each flavor renders the same markup (data attributes name the parts) and
// hands its root to runChat or runBuild, which animate it frame by frame as the site does; React and the element never
// re-render for the motion, so both paint the same frames.
//
// The chat: a session window where a question types into the composer, sends, and the answer settles in (the status,
// the tool call, the lead, the table rows one by one, the thumbnails), holds, shrinks away and the next question
// types. The first question shows already answered. The chips under the composer pick a question (the pill slides to
// the pressed chip); a pointer over the chat or focus in it holds the current answer. With reduced motion the chat
// shows an answered turn and a chip swaps it at once.
//
// The build visual: a team's own ad library in a browser window, six tiles in a grid; every few seconds the sort
// changes (longest running, most impressions), the tiles glide to their new places and the sort label, the badges and
// the request's sortBy swap (the old text rises out, the new rises in). Still with reduced motion.

import type { ImageSlot } from '@/lib/image'

/** A picture in the chat: the user's own image (`src`, with `fit` and `position`), or a neutral placeholder in a tone from 1 to 4. */
export interface ChatPicture extends ImageSlot {
	alt: string
	/** Width over height (the strip on phones keeps it). */
	ratio?: number
	tone?: 1 | 2 | 3 | 4
}

export interface ChatRow {
	label: string
	detail: string
	value: string
	picture?: ChatPicture
}

export interface ChatTurn {
	/** The chip that picks this question. */
	chip: string
	/** An @mention typed before the question. */
	mention?: string
	question: string
	/** "Worked for 3s". */
	status: string
	tool: string
	args: string
	lead: string
	columns: readonly [string, string]
	rows: ChatRow[]
	/** A post the answer leads with (a picture, a title and a detail) instead of a plain lead line. */
	post?: { picture: ChatPicture; title: string; detail: string }
}

export interface ChatContent {
	server: string
	status: string
	composer: string
	/** The chat's name for assistive tech. */
	label: string
	/** The chips' group name. */
	chipsLabel: string
	turns: readonly ChatTurn[]
}

export interface BuildTile extends ImageSlot {
	id: string
	alt: string
	tone?: 1 | 2 | 3 | 4
	/** The badge for each sort key. */
	figure: Record<string, string>
}

export interface BuildSort {
	key: string
	label: string
	/** The request's sortBy value. */
	sortBy: string
	/** Tile ids in grid order. */
	order: string[]
}

export interface BuildContent {
	url: string
	builtOn: string
	title: string
	meta: string
	call: { method: string; path: string; lines: { key: string; value: string | null }[] }
	tiles: BuildTile[]
	sorts: BuildSort[]
	/** What the visual shows, for assistive tech. */
	description: string
}

export interface UseCaseAction {
	label: string
	href: string
}

export interface UseCaseHeroContent {
	/** The heading's id stem (the page's slug). */
	id: string
	name: string
	line: string
	/** Who it is for, under the actions ("For creative strategists..."; the period is added). */
	forWho: string
	primary: UseCaseAction
	secondary: UseCaseAction
	/** The visual's source note, for assistive tech. */
	source?: string
}

// ----- Copy (Acme) -----

const tone = (n: number) => ((n % 4) + 1) as 1 | 2 | 3 | 4
const pic = (alt: string, n: number, ratio = 4 / 5): ChatPicture => ({ alt, tone: tone(n), ratio })

export const useCaseHeroContent: UseCaseHeroContent = {
	id: 'creative-research',
	name: 'Creative research',
	line: 'The hooks, angles and formats that win for any brand, worked out before you ask.',
	forWho: 'For creative strategists, designers and performance teams',
	primary: { label: 'Get a free API key', href: '/sign-up' },
	secondary: { label: 'Read the docs', href: '/docs' },
	source: 'An example question and answer. The figures are illustrative.',
}

export const useCaseChatContent: ChatContent = {
	server: 'Spyglass MCP',
	status: 'Connected',
	composer: 'Ask about any brand, ad, post or creator',
	label: 'An AI chat with the Spyglass MCP connected, asking three questions in turn',
	chipsLabel: 'Questions',
	turns: [
		{
			chip: 'Acme’s hooks',
			question: 'What hooks has Acme leaned on in its Meta ads in the last 30 days?',
			status: 'Worked for 5s',
			tool: 'getBrandMediaInsights',
			args: 'brandId: "acme", type: "HOOK"',
			lead: 'Acme’s Meta ads from Oct 17 to Nov 16 leaned on a handful of repeatable hooks:',
			columns: ['Hook', 'Ads'],
			rows: [
				{ label: 'Mornings without the rush', detail: 'A full breakfast in about a minute.', value: '71', picture: pic('An Acme ad: a breakfast on a kitchen counter.', 0) },
				{ label: 'Healthy eating takes effort', detail: 'Skip the meal prep, keep the nutrition.', value: '64', picture: pic('An Acme ad: a lunch box beside a laptop.', 1) },
				{ label: 'Better value than the usual', detail: '“My breakfast costs less than your coffee.”', value: '47', picture: pic('An Acme ad: a coffee cup and a price tag.', 2) },
				{ label: 'Try before committing', detail: 'A sampler box takes the risk out of a flavor.', value: '33', picture: pic('An Acme ad: a box of sample packs.', 3) },
			],
		},
		{
			chip: 'Northwind’s hooks',
			mention: '@Northwind',
			question: 'Which hooks does this brand lean on?',
			status: 'Worked for 3s',
			tool: 'getBrandMediaInsights',
			args: 'brandId: "northwind", type: "HOOK"',
			lead: '87 hooks across Northwind’s Meta ads in the last 90 days. The top three:',
			columns: ['Hook', 'Ads'],
			rows: [
				{ label: 'Every morning', detail: '“Less than $3 a day. Every morning.”', value: '46', picture: pic('A Northwind ad: three canisters on a shelf.', 1, 406 / 720) },
				{ label: 'For everyday athletes', detail: '“You know I take my training seriously.”', value: '20', picture: pic('A Northwind ad: a shaker on a gym bench.', 2) },
				{ label: 'Candid takes', detail: '“I’m going to be honest.” Reactions in a creator’s words.', value: '16', picture: pic('A Northwind ad: a creator talking to the camera.', 3) },
			],
		},
		{
			chip: 'Who it speaks to',
			question: 'Who are Northwind’s ads made for?',
			status: 'Worked for 3s',
			tool: 'getBrandMediaInsights',
			args: 'brandId: "northwind", type: "TARGET_PERSONA"',
			lead: '52 personas. The three Northwind speaks to most:',
			columns: ['Persona', 'Ads'],
			rows: [
				{ label: 'Fitness enthusiasts', detail: '“A note to my athletes”, on gym turf.', value: '71', picture: pic('A Northwind ad: a box on gym turf.', 2) },
				{ label: 'Health-conscious', detail: '“50+ whole food ingredients.”', value: '65', picture: pic('A Northwind ad: two hands hold pouches.', 3) },
				{ label: 'Supplement users', detail: '“This replaced my supplement stack.”', value: '53', picture: pic('A Northwind ad: a shaker and a stick pack.', 0, 406 / 720) },
			],
		},
	],
}

export const useCaseBuildContent: BuildContent = {
	url: 'ads.yourteam.com',
	builtOn: 'Built on Spyglass',
	title: 'Running shoes',
	meta: 'Meta ads from Acme Run, Strider, Fleetfoot and 2 more',
	call: {
		method: 'POST',
		path: '/v2/media',
		lines: [
			{ key: 'accountIds', value: '[acme-run, strider, …]' },
			{ key: 'channel', value: '"META_AD"' },
			{ key: 'sortBy', value: null },
		],
	},
	tiles: [
		{ id: 'a', alt: 'A gold running shoe lit against a dark ground.', tone: 3, figure: { longest: '84 days', impressions: 'Top 4%' } },
		{ id: 'b', alt: 'A trail shoe, its parts labelled.', tone: 2, figure: { longest: '61 days', impressions: 'Top 1%' } },
		{ id: 'c', alt: 'A running shoe on orange cloth.', tone: 4, figure: { longest: '47 days', impressions: 'Top 9%' } },
		{ id: 'd', alt: 'A pale blue running shoe, close up.', tone: 1, figure: { longest: '38 days', impressions: 'Top 2%' } },
		{ id: 'e', alt: 'A running shoe in motion, gold on brown.', tone: 2, figure: { longest: '22 days', impressions: 'Top 12%' } },
		{ id: 'f', alt: 'A running shoe on a 3D printer’s bed.', tone: 3, figure: { longest: '14 days', impressions: 'Top 6%' } },
	],
	sorts: [
		{ key: 'longest', label: 'Longest running', sortBy: '"LONGEST_RUN"', order: ['a', 'b', 'c', 'd', 'e', 'f'] },
		{ key: 'impressions', label: 'Most impressions', sortBy: '"MOST_IMPRESSIONS"', order: ['b', 'd', 'a', 'f', 'c', 'e'] },
	],
	description: 'A team’s own ad library of running shoe ads, built on one Spyglass call: POST /v2/media with the brands, the Meta ads channel and a sort. Change the sort from longest running to most impressions and the library reorders itself.',
}

export const useCaseBuildHeroContent: UseCaseHeroContent = {
	id: 'build-your-own',
	name: 'Build your own',
	line: 'Your own agents, ad libraries and tools, built on Spyglass’s API and MCP server.',
	forWho: 'For developers, AI builders and growth teams',
	primary: { label: 'Get a free API key', href: '/sign-up' },
	secondary: { label: 'Read the docs', href: '/docs' },
	source: 'An example library. The figures are illustrative.',
}

/** The composer's text for a turn: the mention, a space, the question. */
export const typedText = (t: ChatTurn) => (t.mention ? `${t.mention} ${t.question}` : t.question)
/** A turn's pictures, in the strip's order. */
export const turnPictures = (t: ChatTurn): ChatPicture[] => (t.post ? [] : t.rows.flatMap((r) => (r.picture ? [r.picture] : [])))
/** Where the build tile with this id sits for a sort: its column and row. */
export function tileSlot(sort: BuildSort, id: string) {
	const slot = sort.order.indexOf(id)
	return { col: slot % 3, row: Math.floor(slot / 3) }
}

// ----- Pacing (site loopPacing: --dur-read-*) -----

const READ = { lead: 800, holdFirst: 3800, hold: 2800, laterPace: 0.8, change: 700 }

// ----- The clock (site V2HowItWorks/sessionClock, HeroVideo/reference, humanTyping, chatClock), 60 frames a second -----

type Track = readonly (readonly [number, number])[]
const FPS = 60
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
const DELETE_FROM = 384
const BLINK = { off: 16, on: 16 }
const GRID_A_SHOW0 = 119
const GRID_A_STARTS = [119, 121, 123, 123, 127, 128, 130, 130, 133, 135, 137]
const GRID_A_FADE = 45
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
const sentAfter = (type: number[]) => type[type.length - 1] + 8
function answerBeats(sent: number, rows: number, thumbs: number) {
	const shift = sent + 39 - GRID_A_SHOW0
	const s = GRID_A_STARTS
	const rowStarts = Array.from({ length: rows }, (_, k) => s[Math.min(5 + k, s.length - 1)])
	const lineIn = [s[0], s[4], ...rowStarts].map((f) => f + shift)
	const thumbIn = Array.from({ length: thumbs }, (_, i) => s[1] + shift + i * THUMB_STEP)
	const rest = (GRID_A_DY.find(([, v]) => v === 0)?.[0] ?? GRID_A_DY[GRID_A_DY.length - 1][0]) + shift
	return { shift, lineIn, thumbIn, rest, clear: DELETE_FROM + shift }
}
const outFrames = (clear: number) => Array.from({ length: PARTS }, (_, i) => clear + SHRINK + i * OUT_STEP)
const riseAt = (shift: number, rest: number, f: number) => at(GRID_A_DY, Math.min(f - shift, rest - shift))
const lineFade = (inAt: number, f: number) => easeOutCubic(clamp((f - inAt) / GRID_A_FADE))

// Human typing: a seeded rhythm per text, quicker on common letter pairs, slower after spaces and on reached keys.
function seeded(seed: number) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}
function seedOf(text: string) {
	let h = 0x811c9dc5
	for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
	return h >>> 0
}
const ROLLS = new Set(['th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd', 'ha', 'es', 'ng', 'st', 'as', 'or', 'ou', 'ea'])
const REACH = /[A-Z0-9?.,!’'"\-:;()&@#%]/
function keyInterval(chars: string[], k: number, r: () => number) {
	const prev = chars[k - 1]
	const ch = chars[k]
	if (ROLLS.has(prev + ch) && r() < 0.55) return 60 + r() * 12
	let ms = 68 + r() * 36
	if (prev === ' ') ms += 36 + r() * 32
	if (ch === ' ') ms += 8 + r() * 16
	if (REACH.test(ch)) ms += 24 + r() * 28
	return Math.min(160, Math.max(60, ms))
}
function keystrokes(text: string, pace = 1): number[] {
	const chars = [...text]
	const r = seeded(seedOf(text))
	const out: number[] = []
	let t = 0
	chars.forEach((_, k) => {
		if (k > 0) t += keyInterval(chars, k, r) * pace
		out.push(Math.round(t))
	})
	return out
}

interface TurnShape { text: string; rows: number; thumbs: number }
interface TurnPace { pace: number; hold: number }
interface Play {
	turn: number
	start: number
	waitFrom: number
	type: number[]
	sent: number
	callIn: number
	shift: number
	lineIn: number[]
	thumbIn: number[]
	rest: number
	done: number
	clear: number
	out: number[]
	clearing: boolean
	cutTyping?: Play
	announced: boolean
}

function plan(turn: number, shape: TurnShape, typeFrom: number, start: number, waitFrom: number, { pace, hold }: TurnPace): Play {
	const type = keystrokes(shape.text, pace).map((ms) => typeFrom + Math.round((ms * FPS) / 1000))
	const sent = sentAfter(type)
	const beats = answerBeats(sent, shape.rows, shape.thumbs)
	const done = Math.ceil(beats.lineIn[beats.lineIn.length - 1] + GRID_A_FADE)
	const clear = Math.max(beats.clear, Math.max(done, beats.rest) + hold)
	return { turn, start, waitFrom, type, sent, callIn: sent + 4, shift: beats.shift, lineIn: beats.lineIn, thumbIn: beats.thumbIn, rest: beats.rest, done, clear, out: outFrames(clear), clearing: false, announced: false }
}
function clearAt(p: Play, frame: number) {
	p.clear = frame
	p.out = outFrames(frame)
}
const nextKey = (p: Play) => p.out[PARTS - 1] + GAP
const rise = (p: Play, g: number) => riseAt(p.shift, p.rest, g)
const charOn = (p: Play, k: number, f: number) => (f >= p.type[k] ? 1 : 0) * (1 - clamp((f - p.sent) / 3))
function caretOn(p: Play, f: number) {
	if (f >= p.sent) return false
	if (f >= p.type[0] - 1 || f < p.waitFrom) return true
	return (f - p.waitFrom) % (BLINK.off + BLINK.on) >= BLINK.off
}

const spoken = (t: ChatTurn) => [typedText(t), t.lead, ...t.rows.map((r) => `${r.label}: ${r.value} ${t.columns[1].toLowerCase()}.`)].join(' ')

const REDUCE = '(prefers-reduced-motion: reduce)'

/** Moves the chips' pill under the pressed chip (instantly on the first call). */
function placePill(root: HTMLElement) {
	const tray = root.querySelector<HTMLElement>('[data-chips]')
	const pill = root.querySelector<HTMLElement>('[data-pill]')
	const chip = tray?.querySelector<HTMLElement>('[aria-pressed="true"]')
	if (!tray || !pill || !chip || chip.offsetWidth === 0) return
	pill.style.width = `${chip.offsetWidth}px`
	pill.style.height = `${chip.offsetHeight}px`
	pill.style.transform = `translate(${chip.offsetLeft}px, ${chip.offsetTop}px)`
	if (!pill.dataset.placed) {
		pill.dataset.placed = ''
		pill.style.opacity = '1'
	}
}

/**
 * Runs the chat in `root` (the element with data-uch-chat): reads the parts by their data attributes and paints every
 * frame. Returns the cleanup. The chips are buttons with data-chip="<index>" inside data-chips.
 */
export function runChat(root: HTMLElement, turns: readonly ChatTurn[]): () => void {
	const reduce = window.matchMedia(REDUCE)
	const win = root.querySelector<HTMLElement>('[data-window]') ?? root
	const placeholder = root.querySelector<HTMLElement>('[data-placeholder]')
	const caret = root.querySelector<HTMLElement>('[data-caret]')
	const live = root.querySelector<HTMLElement>('[data-live]')
	const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-chip]')]
	const all = (scope: ParentNode, selector: string) => [...scope.querySelectorAll<HTMLElement>(selector)]

	const T = turns.map((_, i) => {
		const el = root.querySelector<HTMLElement>(`[data-turn="${i}"]`) as HTMLElement
		return {
			el,
			message: el.querySelector<HTMLElement>('[data-message]'),
			calls: all(el, '[data-call]'),
			lines: all(el, '[data-line]'),
			strip: el.querySelector<HTMLElement>('[data-strip]'),
			stripPics: all(el, '[data-pic]'),
			chars: all(root, `[data-typed] [data-q="${i}"] [data-char]`),
			typed: root.querySelector<HTMLElement>(`[data-typed] [data-q="${i}"]`),
			shown: null as boolean | null,
		}
	})
	let plays: Play[] = []
	let scale = 1
	let frame = 0
	const measure = () => {
		scale = win.clientWidth / 1920
	}
	const current = () => plays[plays.length - 1]
	const shapeOf = (turn: number): TurnShape => ({ text: typedText(turns[turn]), rows: turns[turn].rows.length, thumbs: T[turn].stripPics.length })
	const frames = (ms: number) => Math.round((ms * FPS) / 1000)
	let typedOnce = false
	const paceOf = (first: boolean): TurnPace => ({ pace: first ? 1 : READ.laterPace, hold: frames(first ? READ.holdFirst : READ.hold) })

	const mark = (turn: number) => {
		chips.forEach((c, i) => c.setAttribute('aria-pressed', String(i === turn)))
		placePill(root)
	}

	const play = (turn: number, now: number, kind: 'first' | 'auto' | 'chip') => {
		let cutTyping: Play | undefined
		plays = plays.filter((p) => {
			if (p.sent <= now) return true
			cutTyping = p
			return false
		})
		const prev = current()
		if (prev && !prev.clearing) {
			clearAt(prev, Math.max(now, prev.sent + 1))
			prev.clearing = true
		}
		plays = plays.filter((p) => nextKey(p) > now)
		const typeFrom = kind === 'first' ? now + Math.max(START, frames(READ.lead)) : Math.max(now + 3, prev ? nextKey(prev) : now + frames(READ.lead))
		const waitFrom = prev ? prev.out[prev.out.length - 1] : now
		const p = plan(turn, shapeOf(turn), typeFrom, now, waitFrom, paceOf(!typedOnce && kind !== 'chip'))
		typedOnce = true
		p.cutTyping = cutTyping
		plays.push(p)
		mark(turn)
	}

	// The first turn, already answered and settled, holding for the first read.
	const answered = () => {
		const first = paceOf(true)
		const probe = plan(0, shapeOf(0), START, 0, 0, first)
		const lastThumb = probe.thumbIn[probe.thumbIn.length - 1] ?? -Infinity
		let settled = Math.max(probe.done, probe.rest)
		while (itemScale60(settled - lastThumb) < 1 && settled < probe.clear) settled += 1
		const p = plan(0, shapeOf(0), START - settled, -settled, -settled, first)
		clearAt(p, Math.max(p.clear, first.hold))
		p.announced = true
		plays = [p]
		mark(0)
	}

	const jump = (turn: number) => {
		const far = frame - 100_000
		const p = plan(turn, shapeOf(turn), far, far, far, paceOf(false))
		clearAt(p, Infinity)
		p.announced = true
		plays = [p]
		mark(turn)
		paint(frame)
	}

	const announce = (turn: number) => {
		if (live) live.textContent = spoken(turns[turn])
	}

	let holding = false
	const step = (f: number) => {
		const p = current()
		if (!p || f < p.done) return
		if (!p.announced) {
			p.announced = true
			announce(p.turn)
		}
		if (p.clearing || f < p.clear) return
		if (holding) clearAt(p, f + 1)
		else play((p.turn + 1) % turns.length, f, 'auto')
	}

	const paint = (f: number) => {
		const cur = current()
		if (!cur) return
		const typing = cur.cutTyping && f < cur.type[0] ? cur.cutTyping : cur
		T.forEach((t, i) => {
			if (t.typed && t.typed.hidden !== (i !== typing.turn)) t.typed.hidden = i !== typing.turn
		})
		let empty = true
		T[typing.turn].chars.forEach((el, k) => {
			let o: number
			let on: boolean
			if (typing === cur) {
				o = charOn(cur, k, f)
				on = f >= cur.type[k] && f < cur.sent + 3
			} else {
				o = charOn(typing, k, cur.start) * (1 - clamp((f - cur.start) / 3))
				on = typing.type[k] <= cur.start && f < cur.start + 3 && cur.start < typing.sent + 3
			}
			el.style.display = on ? '' : 'none'
			el.style.opacity = String(o)
			if (on) empty = false
		})
		if (placeholder) placeholder.style.opacity = empty ? '1' : '0'
		if (caret) caret.style.opacity = caretOn(cur, f) ? '1' : '0'

		T.forEach((t, i) => {
			const p = [...plays].reverse().find((q) => q.turn === i && q.sent <= f && f < q.out[PART.message])
			const on = Boolean(p)
			if (on !== t.shown) {
				t.el.style.visibility = on ? '' : 'hidden'
				t.shown = on
			}
			if (!p) return
			const out = p.out
			if (t.message) {
				t.message.style.opacity = shown(p.sent, out[PART.message], f) ? '1' : '0'
				t.message.style.transform = `scale(${partScale(p.sent, out[PART.message], f)})`
			}
			for (const el of t.calls) {
				el.style.opacity = shown(p.callIn, out[PART.agent], f) ? '1' : '0'
				el.style.transform = `scale(${partScale(p.callIn, out[PART.agent], f)})`
			}
			const dy = (rise(p, f) * scale).toFixed(2)
			t.lines.forEach((el, k) => {
				const outAt = k === 0 ? out[PART.agent] : out[PART.table]
				el.style.opacity = String(f >= outAt ? 0 : lineFade(p.lineIn[k], f))
				el.style.transform = `translateY(${dy}px) scale(${settle60(outAt - 1 - f)})`
			})
			if (t.strip) t.strip.style.transform = `scale(${settle60(out[PART.thumbs] - 1 - f)})`
			t.stripPics.forEach((el, k) => {
				const inAt = p.thumbIn[k]
				el.style.opacity = shown(inAt, out[PART.thumbs], f) ? '1' : '0'
				el.style.transform = `scale(${f >= inAt ? itemScale60(f - inAt) : 0.8})`
			})
		})
	}

	let raf = 0
	let prevTime = 0
	let clock = 0
	let onScreen = false
	const stop = () => {
		cancelAnimationFrame(raf)
		raf = 0
		prevTime = 0
	}
	const tick = (now: number) => {
		if (prevTime) clock += Math.min(now - prevTime, 100)
		prevTime = now
		const f = Math.floor((clock * FPS) / 1000)
		while (frame < f) step(++frame)
		paint(frame)
		raf = requestAnimationFrame(tick)
	}
	const update = () => {
		const runIt = onScreen && !document.hidden && !reduce.matches
		if (runIt && !raf) raf = requestAnimationFrame(tick)
		if (!runIt && raf) stop()
	}
	const start = () => {
		root.dataset.live = ''
		measure()
		if (reduce.matches) {
			jump(current()?.turn ?? 0)
			announce(current()?.turn ?? 0)
		} else {
			plays = []
			frame = 0
			clock = 0
			answered()
			paint(0)
		}
	}
	start()

	const pick = (turn: number) => {
		if (reduce.matches) {
			jump(turn)
			announce(turn)
			return
		}
		play(turn, frame, 'chip')
		paint(frame)
		update()
	}
	const onChip = (e: Event) => {
		const chip = (e.target as Element | null)?.closest<HTMLElement>('[data-chip]')
		if (chip && root.contains(chip)) pick(Number(chip.dataset.chip))
	}
	root.addEventListener('click', onChip)

	let hovered = false
	let focused = false
	const hold = () => {
		holding = hovered || focused
	}
	const onEnter = (e: PointerEvent) => {
		if (e.pointerType === 'touch') return
		hovered = true
		hold()
	}
	const onLeave = () => {
		hovered = false
		hold()
	}
	const onFocusIn = () => {
		focused = true
		hold()
	}
	const onFocusOut = (e: FocusEvent) => {
		if (e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) return
		focused = false
		hold()
	}
	root.addEventListener('pointerenter', onEnter)
	root.addEventListener('pointerleave', onLeave)
	root.addEventListener('focusin', onFocusIn)
	root.addEventListener('focusout', onFocusOut)

	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		update()
	}, { threshold: 0.25 })
	io.observe(root)
	const resize = new ResizeObserver(() => {
		measure()
		placePill(root)
		paint(frame)
	})
	resize.observe(win)
	const onReduce = () => {
		stop()
		start()
		update()
	}
	document.addEventListener('visibilitychange', update)
	reduce.addEventListener('change', onReduce)

	return () => {
		stop()
		delete root.dataset.live
		io.disconnect()
		resize.disconnect()
		root.removeEventListener('click', onChip)
		root.removeEventListener('pointerenter', onEnter)
		root.removeEventListener('pointerleave', onLeave)
		root.removeEventListener('focusin', onFocusIn)
		root.removeEventListener('focusout', onFocusOut)
		document.removeEventListener('visibilitychange', update)
		reduce.removeEventListener('change', onReduce)
	}
}

// ----- The build visual's loop -----

/** Swaps the text in a data-swap box: the shown text rises out and the new one rises in (at once with reduced motion). */
function swapText(box: HTMLElement, text: string, reduced: boolean) {
	const shownItem = box.querySelector<HTMLElement>('[data-state="in"]')
	if (shownItem?.textContent === text) return
	for (const old of box.querySelectorAll<HTMLElement>('[data-state="out"]')) old.remove()
	const item = document.createElement('span')
	item.className = 'ds-uch-swap-item'
	item.textContent = text
	if (reduced || !shownItem) {
		shownItem?.remove()
		item.dataset.state = 'in'
		box.append(item)
		return
	}
	shownItem.dataset.state = 'out'
	shownItem.setAttribute('aria-hidden', 'true')
	item.dataset.state = 'enter'
	box.append(item)
	requestAnimationFrame(() => requestAnimationFrame(() => {
		item.dataset.state = 'in'
	}))
	const drop = () => shownItem.remove()
	shownItem.addEventListener('transitionend', drop, { once: true })
	setTimeout(drop, 700)
}

/**
 * Runs the build visual in `root` (data-uch-build): tiles are data-tile="<id>", text that changes per sort is
 * data-swap="sort" (the sort label), data-swap="sortBy" and data-swap="figure:<tile id>". Steps while on screen and the
 * tab is visible; still with reduced motion. Returns the cleanup.
 */
export function runBuild(root: HTMLElement, content: BuildContent): () => void {
	const reduce = window.matchMedia(REDUCE)
	let step = 0
	let fresh = true
	let timer = 0
	let inView = false
	const show = (n: number) => {
		const sort = content.sorts[n]
		const reduced = reduce.matches
		for (const tile of root.querySelectorAll<HTMLElement>('[data-tile]')) {
			const { col, row } = tileSlot(sort, tile.dataset.tile ?? '')
			tile.style.setProperty('--col', String(col))
			tile.style.setProperty('--row', String(row))
		}
		for (const box of root.querySelectorAll<HTMLElement>('[data-swap]')) {
			const which = box.dataset.swap ?? ''
			const text = which === 'sort' ? sort.label : which === 'sortBy' ? sort.sortBy : content.tiles.find((t) => `figure:${t.id}` === which)?.figure[sort.key] ?? ''
			swapText(box, text, reduced)
		}
	}
	const schedule = () => {
		clearTimeout(timer)
		const cycling = inView && !document.hidden && !reduce.matches
		if (!cycling) {
			fresh = true
			return
		}
		timer = window.setTimeout(() => {
			fresh = false
			step = (step + 1) % content.sorts.length
			show(step)
			schedule()
		}, fresh ? READ.holdFirst : READ.change + READ.hold)
	}
	const onReduce = () => {
		if (reduce.matches && step !== 0) {
			step = 0
			show(0)
		}
		schedule()
	}
	const io = new IntersectionObserver(([e]) => {
		inView = e.isIntersecting
		schedule()
	}, { threshold: 0.15 })
	io.observe(root)
	document.addEventListener('visibilitychange', schedule)
	reduce.addEventListener('change', onReduce)
	return () => {
		clearTimeout(timer)
		io.disconnect()
		document.removeEventListener('visibilitychange', schedule)
		reduce.removeEventListener('change', onReduce)
	}
}
