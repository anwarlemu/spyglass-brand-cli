// The product hero's results run (site pages/Products/ResultsRun.tsx), framework-free so both flavors run the same
// clock. A question is typed into the composer at a human pace (a seeded rhythm per question, faster on common letter
// pairs, slower after spaces and on capitals), its row of result cards flicks in from the right on the site's flick
// curve, drifts left slowly (8px a second) while it is read, then flicks out to the left as the question is erased, and
// the next question begins. A card under the pointer, or focus inside the stage, eases the clock to a stop (200ms) so
// the card can be read; it runs again on leaving. It runs only while on screen and the tab is visible; with reduced
// motion the first question and its row stay still. Each card's detail drops facts from the end until it fits.
//
// The DOM it drives (both flavors render it): the run [data-ph-run] holding the composer's text [data-ph-text], its
// hint [data-ph-hint] and send button [data-ph-send], and the stage [data-stage] with one [data-row] per question, each
// with [data-card] items whose [data-face] holds a [data-detail] (a title, then [data-fact] items).

import type { DragSource } from '@/lib/effects/field-drag'

export interface HeroPicture { src: string; alt: string }

/** Cards per row the live light follows (the site's SLOTS). */
const SLOTS = 8

/**
 * The bridge between the run and a live light (the site's lightBridge): `source` goes to the dispersion field's `drag`
 * at once, and the run plugs its card boxes in while it runs, so the cards push and stir the light as they flick and
 * drift. `origin` returns the field's canvas, the box the cards are measured against.
 */
export interface HeroLight {
	source: DragSource
	plug: (next: DragSource | null) => void
	origin: () => Element | null
}

export function createHeroLight(origin: () => Element | null): HeroLight {
	let live: DragSource | null = null
	const source: DragSource = {
		now: () => live?.now() ?? 0,
		rects: (ms, out) => live?.rects(ms, out) ?? 0,
		pace: () => live?.pace?.() ?? 1,
	}
	return { source, plug: (next) => (live = next), origin }
}

/**
 * Marks the hero `data-live` once the live light's canvas has drawn (data-ready), so the pre-drawn still under it
 * fades out (the site's .hero:has(> canvas.field[data-ready]) > .still). `find` returns the canvas, which a web
 * component's light renders a moment later; it is looked for on each frame for up to two seconds.
 */
export function watchHeroLight(hero: HTMLElement, find: () => HTMLCanvasElement | null): () => void {
	let mo: MutationObserver | null = null
	let raf = 0
	let tries = 0
	const look = () => {
		const canvas = find()
		if (!canvas) {
			if (tries++ < 120) raf = requestAnimationFrame(look)
			return
		}
		const sync = () => hero.toggleAttribute('data-live', canvas.dataset.ready === 'true')
		sync()
		mo = new MutationObserver(sync)
		mo.observe(canvas, { attributes: true, attributeFilter: ['data-ready'] })
	}
	look()
	return () => {
		cancelAnimationFrame(raf)
		mo?.disconnect()
		hero.removeAttribute('data-live')
	}
}

export interface HeroResult {
	id: string
	/** The card's picture (4:5). */
	picture?: HeroPicture
	/** A second picture beside the first (a pair). */
	pair?: HeroPicture
	/** A figure instead of a picture. */
	stat?: { value: string; caption: string }
	/** Chips at the foot of the picture. */
	notes?: string[]
	/** A 20px mark beside the label. */
	mark?: string
	label: string
	meta?: string
	/** What turns up on hover or focus: a title and facts. */
	detail: { title: string; facts: { term: string; value: string }[] }
}

export interface HeroSet {
	question: string
	/** The row's accessible name. */
	resultsLabel: string
	results: HeroResult[]
}

// Pacing, from the site's tokens (ms): --dur-loop-flick, --dur-ph-hold, --dur-caret-blink / 2, --dur-read-hold,
// --dur-read-lead-later, --read-type-later; --search-drift (px a second); the erase step and the gap between
// questions from HeroVideo/reference (1.25 and 24 frames at 60fps).
const CHANGE = 1400
const HOLD = 7000
const CARET_REST = 530
const READ_HOLD = 2800
const LEAD_LATER = 400
const LATER_PACE = 0.8
const DRIFT = 8 / 1000
const ERASE = (1.25 * 1000) / 60
const GAP = (24 * 1000) / 60

// The site's flick (v3/V3Search/conveyor.ts): a fast middle that settles long.
const FLICK = [0, 0.0043, 0.0091, 0.0144, 0.0201, 0.0263, 0.033, 0.0411, 0.0493, 0.0589, 0.0694, 0.0814, 0.0948, 0.1097, 0.1266, 0.1468, 0.1702, 0.1989, 0.2334, 0.2784, 0.3373, 0.4153, 0.502, 0.5755, 0.6317, 0.675, 0.7103, 0.7394, 0.7643, 0.7859, 0.8045, 0.8213, 0.8366, 0.8495, 0.8619, 0.8735, 0.8835, 0.8932, 0.9018, 0.9101, 0.9175, 0.9242, 0.9307, 0.9367, 0.9422, 0.9473, 0.9521, 0.9569, 0.9607, 0.9645, 0.9683, 0.9712, 0.9746, 0.9774, 0.9802, 0.9828, 0.9847, 0.9866, 0.9885, 0.9905, 0.9919, 0.9933, 0.9943, 0.9957, 0.9964, 0.9971, 0.9981, 0.9986, 0.9991, 0.9993, 0.9995, 0.9998, 1]

export function flick(u: number) {
	if (u <= 0) return 0
	if (u >= 1) return 1
	const f = u * (FLICK.length - 1)
	const i = Math.floor(f)
	return FLICK[i] + (FLICK[i + 1] - FLICK[i]) * (f - i)
}

// The site's human typing (components/humanTyping.ts): when each key lands, in ms from the first.
const ROLLS = new Set(['th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd', 'ha', 'es', 'ng', 'st', 'as', 'or', 'ou', 'ea'])
const REACH = /[A-Z0-9?.,!’'"\-:;()&@#%]/
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
export function keystrokes(text: string, pace = 1): number[] {
	const chars = [...text]
	const r = seeded(seedOf(text))
	const out: number[] = []
	let at = 0
	chars.forEach((ch, k) => {
		if (k > 0) {
			const prev = chars[k - 1]
			let ms: number
			if (ROLLS.has(prev + ch) && r() < 0.55) ms = 60 + r() * 12
			else {
				ms = 68 + r() * 36
				if (prev === ' ') ms += 36 + r() * 32
				if (ch === ' ') ms += 8 + r() * 16
				if (REACH.test(ch)) ms += 24 + r() * 28
				ms = Math.min(160, Math.max(60, ms))
			}
			at += ms * pace
		}
		out.push(Math.round(at))
	})
	return out
}

// A card's detail drops facts from the end until its title clears the top padding and nothing overflows.
function fitDetails(root: ParentNode) {
	for (const detail of root.querySelectorAll<HTMLElement>('[data-detail]')) {
		const title = detail.firstElementChild as HTMLElement | null
		if (!title) continue
		const top = parseFloat(getComputedStyle(detail).paddingTop) || 0
		const facts = [...detail.querySelectorAll<HTMLElement>('[data-fact]')]
		facts.forEach((f) => f.removeAttribute('data-cut'))
		const over = () => title.offsetTop < top - 0.5 || detail.scrollHeight > detail.clientHeight + 0.5
		for (let i = facts.length - 1; i >= 0 && over(); i -= 1) facts[i].setAttribute('data-cut', '')
	}
}

interface Cycle { typeAt: number[]; arrive: number; landed: number; leave: number; len: number }

/**
 * Starts the run inside `run` for these questions (one per row, in order); returns the function that stops it. With
 * `light` (createHeroLight), the cards' boxes feed the live light's drag.
 */
export function startResultsRun(run: HTMLElement, questions: string[], light?: HeroLight): () => void {
	const stage = run.querySelector<HTMLElement>('[data-stage]')
	const textEl = run.querySelector<HTMLElement>('[data-ph-text]')
	const hint = run.querySelector<HTMLElement>('[data-ph-hint]')
	const send = run.querySelector<HTMLElement>('[data-ph-send]')
	if (!stage || !textEl || questions.length === 0) return () => {}
	const rows = [...stage.querySelectorAll<HTMLElement>('[data-row]')]
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

	const lengthOf = (q: string, leave: number) => Math.max(leave + q.length * ERASE, leave + CHANGE) + GAP
	const cycles: Cycle[] = questions.map((q) => {
		const typeAt = keystrokes(q, LATER_PACE).map((k) => k + LEAD_LATER)
		const arrive = typeAt[0] ?? 0
		const landed = arrive + CHANGE
		const leave = Math.max(landed + HOLD, (typeAt[typeAt.length - 1] ?? 0) + READ_HOLD)
		return { typeAt, arrive, landed, leave, len: lengthOf(q, leave) }
	})
	const first = cycles[0]
	const start = Math.max((first.typeAt[first.typeAt.length - 1] ?? 0) + CARET_REST, first.landed)
	first.leave = Math.max(first.leave, start + HOLD)
	first.len = lengthOf(questions[0], first.leave)
	const loopLen = cycles.reduce((s, c) => s + c.len, 0)

	let span = 0
	const bias = rows.map(() => 0)
	const placed = rows.map(() => 0)
	const boxes: number[][][] = rows.map(() => [])
	let boxed = false
	const measure = () => {
		let widest = 0
		const middle = stage.getBoundingClientRect().left + stage.clientWidth / 2
		const origin = light?.origin()?.getBoundingClientRect()
		boxed = !!origin
		rows.forEach((row, i) => {
			const faces = [...row.querySelectorAll<HTMLElement>('[data-face]')].map((c) => c.getBoundingClientRect()).filter((b) => b.width > 0)
			if (faces.length === 0) return
			const left = Math.min(...faces.map((b) => b.left))
			const right = Math.max(...faces.map((b) => b.right))
			widest = Math.max(widest, right - left)
			bias[i] = (left + right) / 2 - middle - placed[i]
			boxes[i] = origin ? faces.slice(0, SLOTS).map((b) => [b.left - origin.left - placed[i], b.top - origin.top, b.width, b.height]) : []
		})
		span = stage.clientWidth / 2 + widest / 2
		fitDetails(stage)
	}

	const frameAt = (at: number) => {
		if (reduced.matches) return { text: questions[0], run: { index: 0, x: bias[0] }, moving: false, typing: false }
		let index = 0
		let t = at % loopLen
		while (t >= cycles[index].len) {
			t -= cycles[index].len
			index += 1
		}
		const c = cycles[index]
		const glide = at < first.len ? bias[0] - DRIFT * (t - start) : -DRIFT * (t - (c.landed + c.leave) / 2)
		const q = questions[index]
		const shown = t < c.leave ? c.typeAt.filter((a) => a <= t).length : q.length - Math.floor((t - c.leave) / ERASE)
		let x: number | null = null
		let moving = false
		if (t >= c.arrive && t < c.landed) {
			x = (1 - flick((t - c.arrive) / CHANGE)) * span + glide
			moving = true
		} else if (t >= c.landed && t < c.leave) x = glide
		else if (t >= c.leave && t < c.leave + CHANGE) {
			x = -flick((t - c.leave) / CHANGE) * span + glide
			moving = true
		}
		const lastChar = c.typeAt[c.typeAt.length - 1] ?? 0
		const typing = (t >= (c.typeAt[0] ?? 0) && t < lastChar + CARET_REST) || (t >= c.leave && t < c.leave + q.length * ERASE + CARET_REST)
		return { text: q.slice(0, Math.max(shown, 0)), run: x === null ? null : { index, x }, moving, typing }
	}

	let clock = start
	let lastText: string | null = null
	let moving = false
	let typing = false
	const draw = () => {
		const frame = frameAt(clock)
		if (frame.text !== lastText) {
			lastText = frame.text
			textEl.textContent = frame.text
			hint?.toggleAttribute('hidden', frame.text.length > 0)
			send?.toggleAttribute('data-awake', frame.text.length > 0)
		}
		if (frame.moving !== moving) {
			moving = frame.moving
			stage.toggleAttribute('data-moving', moving)
		}
		if (frame.typing !== typing) {
			typing = frame.typing
			run.toggleAttribute('data-typing', typing)
		}
		rows.forEach((row, i) => {
			const on = frame.run?.index === i
			placed[i] = on && frame.run ? frame.run.x - bias[i] : 0
			row.style.visibility = on ? 'visible' : 'hidden'
			row.style.transform = on ? `translate3d(${placed[i].toFixed(2)}px, 0, 0)` : ''
		})
	}

	let hovered = 0
	let focused = false
	let pace = 1
	light?.plug({
		now: () => clock,
		rects: (at, out) => {
			if (!boxed && light?.origin()) measure()
			out.fill(Number.NaN)
			const r = frameAt(at).run
			if (r) {
				const offset = r.x - bias[r.index]
				boxes[r.index].forEach((b, j) => {
					const k = (r.index * SLOTS + j) * 4
					out[k] = b[0] + offset
					out[k + 1] = b[1]
					out[k + 2] = b[2]
					out[k + 3] = b[3]
				})
			}
			return rows.length * SLOTS
		},
		pace: () => pace,
	})
	let raf = 0
	let last = 0
	let running = false
	let inView = false
	const tick = (now: number) => {
		const dt = Math.min(now - last, 100)
		pace += ((hovered > 0 || focused ? 0 : 1) - pace) * Math.min(1, dt / 200)
		clock += dt * pace
		last = now
		draw()
		raf = requestAnimationFrame(tick)
	}
	const sync = () => {
		const on = !reduced.matches && inView && document.visibilityState === 'visible'
		if (on === running) return
		running = on
		run.toggleAttribute('data-running', on)
		cancelAnimationFrame(raf)
		if (on) {
			last = performance.now()
			raf = requestAnimationFrame(tick)
		}
	}

	const enter = () => (hovered += 1)
	const leaveCard = () => (hovered = Math.max(0, hovered - 1))
	const cards = [...stage.querySelectorAll<HTMLElement>('[data-card]')]
	cards.forEach((c) => {
		c.addEventListener('pointerenter', enter)
		c.addEventListener('pointerleave', leaveCard)
	})
	const rootNode = stage.getRootNode() as Document | ShadowRoot
	const onFocus = () => (focused = stage.contains(rootNode.activeElement))
	const onBlur = () => requestAnimationFrame(onFocus)
	stage.addEventListener('focusin', onFocus)
	stage.addEventListener('focusout', onBlur)

	measure()
	draw()
	const ro = new ResizeObserver(() => {
		measure()
		draw()
	})
	ro.observe(stage)
	document.fonts?.ready.then(() => fitDetails(stage))
	const io = new IntersectionObserver(([e]) => {
		inView = e.isIntersecting
		sync()
	})
	io.observe(run)
	document.addEventListener('visibilitychange', sync)
	const onReduced = () => {
		draw()
		sync()
	}
	reduced.addEventListener('change', onReduced)

	return () => {
		light?.plug(null)
		cancelAnimationFrame(raf)
		ro.disconnect()
		io.disconnect()
		cards.forEach((c) => {
			c.removeEventListener('pointerenter', enter)
			c.removeEventListener('pointerleave', leaveCard)
		})
		stage.removeEventListener('focusin', onFocus)
		stage.removeEventListener('focusout', onBlur)
		document.removeEventListener('visibilitychange', sync)
		reduced.removeEventListener('change', onReduced)
	}
}

// The hero's CSS (ProductHero.module.css and V3Search.module.css's composer), shared by both flavors. `ascii` is the
// texture's data URI for the unlit hero's margins.
export const PRODUCT_HERO_CSS = (ascii: string) => `
.ds-ph-ascii { display: none; }
@media (min-width: 1024px) {
  .ds-ph-ascii {
    --clear: calc(min(var(--ds-ph-head-w), 100vw - 2 * var(--ds-layout-gutter)) / 2 + var(--ds-space-4xl));
    --feather: var(--ds-space-6xl);
    position: absolute; z-index: -1; top: 0; left: 50%; display: block; width: 100vw; height: var(--ds-ph-ascii-h); translate: -50%; pointer-events: none;
    background: url("${ascii}") left center / var(--ds-feature-ascii-tile) no-repeat, url("${ascii}") right center / var(--ds-feature-ascii-tile) no-repeat;
    mask-image: linear-gradient(to right, var(--ds-color-black) calc(50% - var(--clear) - var(--feather)), transparent calc(50% - var(--clear)), transparent calc(50% + var(--clear)), var(--ds-color-black) calc(50% + var(--clear) + var(--feather))), linear-gradient(to bottom, transparent, var(--ds-color-black) var(--ds-ph-ascii-top), var(--ds-color-black) calc(100% - var(--ds-ph-ascii-foot)), transparent);
    mask-composite: intersect;
  }
}
.ds-ph { min-height: max(var(--ds-ph-min-h), 100svh - var(--ds-size-header)); }
.ds-ph-light { position: absolute; z-index: -1; inset: 0; display: block; width: 100%; height: 100%; pointer-events: none; mask-image: linear-gradient(to bottom, var(--ds-color-black) calc(100% - var(--ds-ph-light-foot)), transparent); }
.ds-ph-light > img, .ds-ph-light > picture, .ds-ph-light > picture > img { display: block; width: 100%; height: 100%; max-width: none; }
.ds-ph-still { transition: opacity var(--ds-duration-micro) var(--ds-easing-out); }
.ds-ph[data-live] .ds-ph-still { opacity: 0; }
.ds-ph-composer { width: min(100% - 2 * var(--ds-layout-gutter), var(--ds-layout-measure)); }
.ds-ph-caret { display: inline-block; width: 1px; height: var(--ds-size-icon-md); margin-left: 1px; vertical-align: top; background: var(--ds-color-fg); translate: 0 2px; }
[data-running]:not([data-typing]) .ds-ph-caret { animation: ds-ph-blink var(--ds-ph-caret-blink) linear infinite; }
@keyframes ds-ph-blink { 0%, 49.99% { opacity: 1; } 50%, 100% { opacity: 0; } }
.ds-ph-send { transition: background-color var(--ds-duration-micro) var(--ds-easing-loop), color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-ph-send[data-awake] { background: var(--ds-color-action-primary); color: var(--ds-color-action-primary-fg); }
.ds-ph-stage { width: 100vw; overflow-x: clip; pointer-events: none; }
.ds-ph-row { grid-area: 1 / 1; visibility: hidden; }
.ds-ph-row:first-child { visibility: visible; }
@media (min-width: 768px) and (max-width: 1279.98px) { .ds-ph-card:nth-child(n + 6) { display: none; } }
.ds-ph-card { width: var(--ds-ph-card-w-phone); }
@media (min-width: 768px) { .ds-ph-card { width: var(--ds-ph-card-w); } }
.ds-ph-turn { transform: perspective(var(--ds-ph-card-depth)) rotateY(var(--ds-ph-card-turn)); transform-style: preserve-3d; }
.ds-ph-face { transition: transform var(--ds-duration-close) var(--ds-easing-out); }
.ds-ph-face img { -webkit-user-drag: none; user-select: none; }
.ds-ph-stat-value { font-family: var(--ds-font-heading); font-size: var(--ds-ph-stat-size); line-height: var(--ds-ph-stat-leading); }
.ds-ph-label { text-shadow: 0 0 var(--ds-space-xs) var(--ds-color-black), 0 0 var(--ds-space-sm) var(--ds-color-black); }
.ds-ph-detail { visibility: hidden; transition: visibility 0s linear var(--ds-duration-exit); }
.ds-ph-face::after { content: ""; position: absolute; z-index: 2; inset: 0; border: 1px solid var(--ds-color-edge-strong); border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity var(--ds-duration-exit) var(--ds-easing-loop); }
.ds-ph-detail::before { content: ""; position: absolute; z-index: -1; inset: 0; background: linear-gradient(to top, var(--ds-ph-scrim) 0%, var(--ds-ph-scrim) 64%, var(--ds-ph-scrim-top) 100%); opacity: 0; transition: opacity var(--ds-duration-exit) var(--ds-easing-loop); }
.ds-ph-reveal { opacity: 0; translate: 0 var(--ds-space-sm); transition: opacity var(--ds-duration-exit) var(--ds-easing-loop), translate var(--ds-duration-exit) var(--ds-easing-loop); }
.ds-ph-fact dd { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
.ds-ph-fact[data-cut] { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (hover: hover) and (pointer: fine) {
  .ds-ph-stage:not([data-moving]) .ds-ph-card { pointer-events: auto; }
  .ds-ph-card:hover { z-index: 1; }
  .ds-ph-card:hover .ds-ph-face { transform: rotateY(calc(var(--ds-ph-card-turn) * -1)) translateZ(var(--ds-ph-card-forward)); transition-duration: var(--ds-duration-entrance); }
  .ds-ph-card:hover .ds-ph-face::after, .ds-ph-card:hover .ds-ph-detail::before, .ds-ph-card:hover .ds-ph-reveal { opacity: 1; translate: 0 0; transition-duration: var(--ds-duration-slow); transition-delay: calc(var(--ds-ph-detail-intent) + var(--i, 0) * var(--ds-duration-stagger)); }
  .ds-ph-card:hover .ds-ph-detail { visibility: visible; transition-delay: var(--ds-ph-detail-intent); }
}
.ds-ph-card:focus-visible { z-index: 1; }
.ds-ph-card:focus-visible .ds-ph-face { outline: 2px solid var(--ds-color-white); outline-offset: 2px; transform: rotateY(calc(var(--ds-ph-card-turn) * -1)) translateZ(var(--ds-ph-card-forward)); transition-duration: var(--ds-duration-entrance); }
.ds-ph-card:focus-visible .ds-ph-face::after, .ds-ph-card:focus-visible .ds-ph-detail::before, .ds-ph-card:focus-visible .ds-ph-reveal { opacity: 1; translate: 0 0; transition-duration: var(--ds-duration-slow); transition-delay: calc(var(--i, 0) * var(--ds-duration-stagger)); }
.ds-ph-card:focus-visible .ds-ph-detail { visibility: visible; transition-delay: 0s; }
@media (prefers-reduced-motion: reduce) {
  .ds-ph-face, .ds-ph-card:hover .ds-ph-face, .ds-ph-card:focus-visible .ds-ph-face { transform: none; transition: none; }
  .ds-ph-reveal, .ds-ph-card:hover .ds-ph-reveal, .ds-ph-card:focus-visible .ds-ph-reveal { translate: none; }
  [data-running] .ds-ph-caret { animation: none; }
  .ds-ph-send, .ds-ph-still { transition: none; }
}
`
