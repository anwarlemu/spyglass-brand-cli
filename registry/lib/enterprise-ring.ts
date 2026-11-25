// The enterprise hero's ring, shared by EnterpriseHero.tsx and <spyglass-enterprise-hero> (site pages/Enterprise
// HeroRing.tsx and HeroRing.module.css): twelve places around the headline (ten from 768, six on phones), each holding a
// set of creatives. A card rises in (a 40ms stagger), then bobs 8px on a 6s loop while the hero is on screen; under a
// mouse (after 80ms), on focus or a tap it comes forward (1.1) with a tag naming its hook and how long it ran; a press
// steps to the next creative in its set. Every 6s, while nobody is touching it, one card comes forward on its own for 2s.

export type RingRatio = '3:4' | '4:5' | '1:1'

export interface RingCard {
	/** The advertiser (the placeholder's label and the button's name). */
	brand: string
	/** The ad's headline. */
	title: string
	/** The creative's shape. */
	ratio: RingRatio
	/** The hook it uses, in the tag ("Hook: product showcase"). */
	hook: string
	/** The tag's lines under the hook: "Ran 7 days", "Posted 9 days ago". */
	meta: string[]
	/** The creative. Without one the card draws a neutral placeholder. */
	src?: string
	/** The placeholder's neutral gradient, 1 (darkest) to 4. */
	tone?: 1 | 2 | 3 | 4
}

type Slot = { u: number; v: number; s: number; wide?: true; mid?: [number, number]; phone?: [number, number] }

/** The places, clockwise from the top left, as fractions of the ring's half width and height. */
export const RING_PLACES: Slot[] = [
	{ u: -0.86, v: -0.84, s: 1, mid: [-0.92, -1], phone: [-1, -1] },
	{ u: -0.46, v: -1, s: 0.84 },
	{ u: -0.04, v: -1, s: 0.92, phone: [0, -0.92] },
	{ u: 0.4, v: -1, s: 0.84 },
	{ u: 0.84, v: -0.86, s: 1, mid: [0.92, -1], phone: [1, -1] },
	{ u: 1, v: 0.04, s: 0.84, wide: true },
	{ u: 0.82, v: 0.86, s: 1, mid: [0.92, 1], phone: [1, 1] },
	{ u: 0.38, v: 1, s: 0.84 },
	{ u: -0.06, v: 1, s: 0.92, phone: [0, 0.92] },
	{ u: -0.48, v: 1, s: 0.84 },
	{ u: -0.88, v: 0.84, s: 1, mid: [-0.92, 1], phone: [-1, 1] },
	{ u: -1, v: -0.06, s: 0.84, wide: true },
]

/** A place's custom properties (the CSS does the rest). */
export function ringPlaceStyle(i: number): Record<string, string> {
	const s = RING_PLACES[i]
	return { '--u': String(s.u), '--v': String(s.v), '--s': String(s.s), '--mu': String(s.mid?.[0] ?? s.u), '--mv': String(s.mid?.[1] ?? s.v), '--pu': String(s.phone?.[0] ?? 0), '--pv': String(s.phone?.[1] ?? 0), '--i': String(i), '--float-at': String((i * 1.27) % 6) }
}

export const ringAspect = (r: RingRatio) => r.replace(':', ' / ')

const card = (brand: string, title: string, ratio: RingRatio, hook: string, meta: string, tone: 1 | 2 | 3 | 4): RingCard => ({ brand, title, ratio, hook, meta: [meta], tone })

/** Acme placeholders: twelve sets of three or four, as the site's ring. */
export const ringPlaceholders: RingCard[][] = [
	[card('Acme Shoes', 'Everyday sneaker', '3:4', 'Product showcase', 'Ran 190 days', 3), card('Acme Shoes', 'Better than leather', '3:4', 'Product showcase', 'Ran 7 days', 2), card('Acme Wear', 'The grid', '4:5', 'Product showcase', 'Ran 9 days', 4)],
	[card('Acme Skin', 'Body cleanser', '3:4', 'New launch reveal', 'Ran 12 days', 4), card('Acme Skin', 'The fragrance', '1:1', 'New launch reveal', 'Ran 55 days', 2), card('Acme Beauty', 'Eau de parfum', '3:4', 'New launch reveal', 'Ran 11 days', 3)],
	[{ ...card('Acme Shoes', 'New colorway', '4:5', 'New launch reveal', 'Posted 21 days ago', 4), meta: ['Posted 21 days ago', '486K views'] }, card('Acme Drinks', 'The drop of the summer', '3:4', 'New launch reveal', 'Ran 59 days', 3), card('Acme Skin', 'Blue glass', '4:5', 'New launch reveal', 'Ran 9 days', 2), card('Acme Beauty', 'Lip liner', '3:4', 'New launch reveal', 'Ran 34 days', 4)],
	[card('Acme Audio', 'Headphone (a)', '3:4', 'New launch reveal', 'Ran 17 days', 2), card('Acme Audio', 'Headphone (1)', '1:1', 'New launch reveal', 'Ran 13 days', 3), card('Acme Beauty', 'The kit', '4:5', 'New launch reveal', 'Ran 105 days', 4)],
	[{ ...card('Acme Pantry', 'Blossom honey', '4:5', 'Product showcase', 'Posted 5 days ago', 3), meta: ['Posted 5 days ago', '64K views'] }, card('Acme Goods', 'Sorted and stunning', '4:5', 'Product showcase', 'Ran 21 days', 2), card('Acme Skin', 'The dewy cream', '4:5', 'Product showcase', 'Ran 18 days', 4), card('Acme Beauty', 'Essentials', '3:4', 'Product showcase', 'Running 7 days', 3)],
	[card('Acme Fit', 'Made by the sea', '1:1', 'New launch reveal', 'Ran 30 days', 2), card('Acme Fit', 'The powders', '1:1', 'New launch reveal', 'Ran 4 days', 3), card('Acme Skin', 'Bottles', '4:5', 'New launch reveal', 'Ran 3 days', 4)],
	[{ ...card('Acme Drinks', 'Poured', '4:5', 'Product showcase', 'Posted 9 days ago', 4), meta: ['Posted 9 days ago', '128K views'] }, card('Acme Shoes', 'Color edit', '3:4', 'Product showcase', 'Ran 47 days', 3), card('Acme Skin', 'Gingerbread', '4:5', 'Product showcase', 'Ran 6 days', 2), card('Acme Beauty', 'Velvet', '4:5', 'Product showcase', 'Ran 6 days', 4)],
	[card('Acme Fit', 'The meal', '4:5', 'New launch reveal', 'Ran 16 days', 3), card('Acme Beauty', 'The collection', '3:4', 'New launch reveal', 'Ran 19 days', 4), card('Acme Beauty', 'Blush', '4:5', 'New launch reveal', 'Ran 5 days', 2)],
	[card('Acme Drinks', 'Lemon lovers', '4:5', 'New launch reveal', 'Ran 10 days', 4), card('Acme Beauty', 'Pear', '3:4', 'New launch reveal', 'Ran 19 days', 3), card('Acme Skin', 'The travel duo', '1:1', 'New launch reveal', 'Ran 10 days', 2)],
	[card('Acme Home', 'The pot', '1:1', 'New launch reveal', 'Ran 18 days', 3), card('Acme Home', 'The candle', '3:4', 'New launch reveal', 'Ran 129 days', 2), card('Acme Skin', 'Violet jar', '3:4', 'New launch reveal', 'Ran 5 days', 4)],
	[card('Acme Beauty', 'The pink edit', '4:5', 'New launch reveal', 'Ran 121 days', 4), card('Acme Beauty', 'Meet the tube', '3:4', 'New launch reveal', 'Ran 38 days', 2), card('Acme Beauty', 'Cloud set', '1:1', 'New launch reveal', 'Ran 39 days', 3)],
	[card('Acme Beauty', 'Warm bronzer', '4:5', 'New launch reveal', 'Ran 49 days', 2), card('Acme Skin', 'Peach stack', '4:5', 'New launch reveal', 'Ran 5 days', 4), card('Acme Beauty', 'The fragrance', '1:1', 'New launch reveal', 'Ran 138 days', 3)],
]

/** Starts loading the creative a press on card `i` would show next, so a real picture never flashes blank (the site's HeroRing does the same when a card comes forward). */
export function preloadNextRingCard(sets: RingCard[][], i: number | null, at: number[]) {
	if (i === null || typeof Image === 'undefined') return
	const set = sets[i]
	const src = set?.[((at[i] ?? 0) + 1) % set.length]?.src
	if (!src) return
	const img = new Image()
	img.src = src
	img.decode().catch(() => undefined)
}

export const ringCardLabel = (c: RingCard, at: number, of: number) => `${c.brand}: ${c.title}. Hook: ${c.hook.toLowerCase()}. ${c.meta.join(', ')}. ${at + 1} of ${of} with this hook. Show the next one.`

// The ring's CSS, the same for both flavors. The place's size follows the room the hero has (container units); from
// 768 the two side places go, below 768 only the six phone places stay.
export const ringCss = `
.ds-ring { position: absolute; z-index: 1; inset: 0; margin: 0; padding: 0; list-style: none; container-type: size; }
.ds-ring-place {
  --L: round(down, clamp(var(--ds-ent-ring-card-min), min((50cqh - var(--ds-ent-ring-words)) / 0.96, 16cqw), var(--ds-ent-ring-card)), 4px);
  --rx: calc(50cqw - var(--L) * 0.42 - var(--ds-ent-ring-edge));
  --ry: calc(50cqh - var(--L) / 2 - var(--ds-ent-ring-edge));
  position: absolute; left: calc(50% + var(--u) * var(--rx)); top: calc(50% + var(--v) * var(--ry)); z-index: 1;
  width: round(var(--L) * var(--s) * 0.75, 4px); translate: -50% -50%;
  animation: ds-ring-enter var(--ds-duration-slow) var(--ds-ent-ring-ease-enter) calc(var(--i) * var(--ds-duration-stagger)) both;
}
.ds-ring-place[data-forward] { z-index: 3; }
@keyframes ds-ring-enter { from { opacity: 0; transform: translateY(var(--ds-ent-ring-enter-y)) scale(var(--ds-ent-ring-enter-scale)) rotate(var(--ds-ent-ring-enter-turn)); } to { opacity: 1; transform: none; } }
.ds-ring-card {
  display: block; width: 100%; padding: 0; border: 0; border-radius: var(--ds-radius-sm); background: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
  animation: ds-ring-float 6s ease-in-out calc(var(--float-at) * -1s) infinite; animation-play-state: paused;
  transition: scale var(--ds-duration-glide) var(--ds-ent-ring-ease-hover);
}
.ds-ring-card:focus-visible { outline: 2px solid var(--ds-color-edge-focus); outline-offset: 2px; }
.ds-ring[data-run="true"] .ds-ring-card { animation-play-state: running; }
@keyframes ds-ring-float { 0%, 100% { translate: 0; } 50% { translate: 0 calc(var(--ds-ent-ring-float) * -1); } }
.ds-ring-place[data-forward] .ds-ring-card { scale: var(--ds-ent-ring-forward); }
@media (hover: hover) and (pointer: fine) { .ds-ring-card:hover { scale: var(--ds-ent-ring-forward); } }
.ds-ring-card:active, .ds-ring-place[data-forward] .ds-ring-card:active { scale: var(--ds-ent-ring-press); transition-duration: var(--ds-duration-press); }
.ds-ring-frame { position: relative; display: block; width: 100%; border-radius: inherit; overflow: hidden; background: var(--ds-color-surface-raised); transition: aspect-ratio var(--ds-duration-glide) var(--ds-ent-ring-ease-hover); }
.ds-ring-frame img { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; }
.ds-ring-frame[data-tone="1"] { background: linear-gradient(to bottom, var(--ds-color-neutral-4), var(--ds-color-neutral-2)); }
.ds-ring-frame[data-tone="2"] { background: linear-gradient(to bottom, var(--ds-color-neutral-5), var(--ds-color-neutral-3)); }
.ds-ring-frame[data-tone="3"] { background: linear-gradient(to bottom, var(--ds-color-neutral-6), var(--ds-color-neutral-4)); }
.ds-ring-frame[data-tone="4"] { background: linear-gradient(to bottom, var(--ds-color-neutral-7), var(--ds-color-neutral-5)); }
.ds-ring-frame[data-stepped] > * { animation: ds-ring-swap var(--ds-duration-glide) var(--ds-ent-ring-ease-enter) both; }
@keyframes ds-ring-swap { from { opacity: 0; transform: scale(var(--ds-ent-ring-swap-from)); } }
.ds-ring-tag {
  --grown: calc((var(--ds-ent-ring-forward) - 1) / 2 * 100%);
  position: absolute; z-index: 1; top: calc(100% + var(--grown) + var(--ds-ent-ring-tag-gap)); left: calc(var(--grown) * -1);
  display: flex; flex-direction: column; align-items: flex-start; padding: 8px 12px;
  border: 1px solid var(--ds-color-edge); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-subtle); color: var(--ds-color-fg);
  font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-loop);
}
.ds-ring-tag[data-side="above"] { top: auto; bottom: calc(100% + var(--grown) + var(--ds-ent-ring-tag-gap)); }
.ds-ring-tag[data-side="inside"] { top: auto; bottom: var(--ds-ent-ring-tag-gap); left: var(--ds-ent-ring-tag-gap); }
.ds-ring-tag[data-align="end"] { right: calc(var(--grown) * -1); left: auto; }
.ds-ring-tag[data-side="inside"][data-align="end"] { right: var(--ds-ent-ring-tag-gap); }
.ds-ring-tag[data-shown] { opacity: 1; animation: ds-ring-tag-in var(--ds-duration-micro) var(--ds-easing-loop); }
@keyframes ds-ring-tag-in { from { opacity: 0; translate: 0 4px; } }
@media (width < 1280px) { .ds-ring-place { left: calc(50% + var(--mu) * var(--rx)); top: calc(50% + var(--mv) * var(--ry)); } .ds-ring-place[data-wide] { display: none; } }
@media (width < 768px) {
  .ds-ring-place { --L: var(--ds-ent-ring-card-phone); --rx: calc(50cqw - var(--L) * 0.42 - var(--ds-layout-gutter)); left: calc(50% + var(--pu) * var(--rx)); top: calc(50% + var(--pv) * var(--ry)); width: round(var(--L) * 0.75, 4px); }
  .ds-ring-place:not([data-phone]) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-ring-place, .ds-ring-card, .ds-ring-frame[data-stepped] > *, .ds-ring-tag[data-shown] { animation: none; }
  .ds-ring-card, .ds-ring-frame { transition: none; }
  .ds-ring-place[data-forward] .ds-ring-card, .ds-ring-card:hover, .ds-ring-card:active { scale: none; }
}
.ds-ent-hero-ascii { display: none; }
@media (min-width: 1024px) {
  .ds-ent-hero-ascii {
    position: absolute; z-index: 0; inset: 0; display: block; pointer-events: none; opacity: var(--ds-ent-hero-ascii-opacity);
    background-position: left center, right center; background-size: var(--ds-ent-hero-ascii-tile), var(--ds-ent-hero-ascii-tile); background-repeat: no-repeat;
    mask-image: linear-gradient(to right, var(--ds-color-black) calc(50% - var(--ds-ent-hero-ascii-clear) - var(--ds-ent-hero-ascii-feather)), transparent calc(50% - var(--ds-ent-hero-ascii-clear)), transparent calc(50% + var(--ds-ent-hero-ascii-clear)), var(--ds-color-black) calc(50% + var(--ds-ent-hero-ascii-clear) + var(--ds-ent-hero-ascii-feather))), linear-gradient(to bottom, transparent, var(--ds-color-black) 160px, var(--ds-color-black) calc(100% - 160px), transparent);
    mask-composite: intersect;
  }
}
.ds-ent-hero { min-height: max(var(--ds-ent-hero-min-h), calc(100svh - var(--ds-size-header))); }
@media (width < 768px) { .ds-ent-hero { padding-block: calc(var(--ds-ent-ring-card-phone) + var(--ds-ent-ring-edge) + var(--ds-space-3xl)); } }
@media (min-width: 768px) { .ds-ent-hero-keep { white-space: nowrap; } }
`

const ms = (el: Element, name: string, fallback: number) => {
	const v = getComputedStyle(el).getPropertyValue(name).trim()
	const n = parseFloat(v)
	return Number.isFinite(n) ? (v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n) : fallback
}

export const ringIntent = (el: Element) => ms(el, '--ds-ent-ring-intent', 80)

/**
 * Places a card's tag below it, else above, else inside, keeping it inside the hero, off the headline's words and in the
 * window; it aligns to the card's end when it would run past the hero's right edge.
 */
export function placeRingTag(place: HTMLElement, section: HTMLElement) {
	const tag = place.querySelector<HTMLElement>('[data-ring-tag]')
	if (!tag) return
	const clear = parseFloat(getComputedStyle(section).getPropertyValue('--ds-ent-ring-tag-clear')) || 16
	const s = section.getBoundingClientRect()
	const words = [...section.querySelectorAll<HTMLElement>('[data-ring-words] > *')].map((n) => n.getBoundingClientRect())
	const next = section.nextElementSibling ?? (section.getRootNode() instanceof ShadowRoot ? (section.getRootNode() as ShadowRoot).host.nextElementSibling : null)
	const below = next ? Math.max(0, parseFloat(getComputedStyle(next).paddingTop) - clear) : 0
	const fits = () => {
		const r = tag.getBoundingClientRect()
		return r.top >= s.top + clear && r.bottom <= s.bottom + (tag.dataset.side === 'below' ? below : -clear) && r.bottom <= window.innerHeight - clear && !words.some((b) => r.left < b.right + clear && b.left < r.right + clear && r.top < b.bottom + clear && b.top < r.bottom + clear)
	}
	tag.dataset.align = 'start'
	for (const side of ['below', 'above', 'inside']) {
		tag.dataset.side = side
		if (side === 'inside' || fits()) break
	}
	if (tag.getBoundingClientRect().right > s.right - clear) tag.dataset.align = 'end'
}

export interface RingWatch {
	/** Whether the ring is on screen and the tab visible. */
	running: () => boolean
	stop: () => void
}

/**
 * Runs the ring while it is seen (writes data-run on it) and, unless motion is reduced, brings one card forward on its
 * own every 6s for 2s while nobody is touching the hero. `busy` says a card is already forward.
 */
export function watchRing(ring: HTMLElement, section: HTMLElement, busy: () => boolean, setHint: (i: number | null) => void): RingWatch {
	let running = false
	let onScreen = false
	const sync = () => {
		running = onScreen && document.visibilityState === 'visible'
		ring.dataset.run = String(running)
	}
	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		sync()
	})
	io.observe(ring)
	document.addEventListener('visibilitychange', sync)
	let timer = 0
	const cleanups: (() => void)[] = []
	if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && navigator.webdriver !== true) {
		const intent = ringIntent(ring)
		const every = ms(ring, '--ds-ent-ring-hint-every', 6000)
		const hold = ms(ring, '--ds-ent-ring-hint-hold', 2000)
		let last: number | null = null
		let seenSince = 0
		let touched = 0
		const touch = () => {
			touched = performance.now()
			setHint(null)
		}
		const step = () => {
			const now = performance.now()
			if (!running) seenSince = 0
			else if (!seenSince) seenSince = now
			const ready = running && !busy() && now - seenSince >= every - intent && now - touched >= every - intent
			const places = [...ring.querySelectorAll<HTMLElement>('[data-ring-place]')]
			const pool = ready ? places.map((el, i) => [i, el] as const).filter(([i, el]) => i !== last && el.offsetWidth > 0).map(([i]) => i) : []
			if (!pool.length) {
				timer = window.setTimeout(step, hold)
				return
			}
			last = pool[Math.floor(Math.random() * pool.length)]
			setHint(last)
			timer = window.setTimeout(() => {
				setHint(null)
				timer = window.setTimeout(step, every - hold)
			}, hold)
		}
		timer = window.setTimeout(step, hold)
		const onOver = (e: PointerEvent) => {
			if (e.composedPath().some((n) => n instanceof HTMLElement && n.hasAttribute('data-ring-card'))) touch()
		}
		section.addEventListener('pointerover', onOver)
		for (const t of ['pointerdown', 'keydown', 'focusin'] as const) section.addEventListener(t, touch)
		cleanups.push(() => {
			section.removeEventListener('pointerover', onOver)
			for (const t of ['pointerdown', 'keydown', 'focusin'] as const) section.removeEventListener(t, touch)
		})
	}
	return {
		running: () => running,
		stop: () => {
			window.clearTimeout(timer)
			io.disconnect()
			document.removeEventListener('visibilitychange', sync)
			cleanups.forEach((f) => f())
		},
	}
}
