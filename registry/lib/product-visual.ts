// The product visuals, framework-free: both flavors hand this a stage element and a kind, and it builds the visual's
// markup and runs its loop, so React and the web component render the same nodes. Ported from the site's
// pages/Products/visuals (records, add, themes, filters, narrow, timeline, ranked sheet) and v2/V2Features (links
// board, patterns switch); the feature rows on a product page each show one.
//
// Every loop paces like the site's (components/loopPacing): it starts once the stage is on screen and the tab is
// visible, holds its first step for --ds-read-first, then changes and holds for --ds-read-hold each time; with reduced
// motion it stays on its resting step. A switch the visitor can press (the ranked sheet's and the patterns' tabs) stops
// the loop on the view they chose. The records run the shared creative sequence (lib/panels-motion.ts) in its reading
// pace. The links board draws its own timeline (lib/product-visual-board.ts); it holds its composed frame first, so a
// visitor sees the board whole before it clears.
import { startPanelsMotion } from '@/lib/panels-motion'
import { ASCII_TEXTURE } from '@/lib/textures'
import {
	BOARD_AVATAR, BOARD_SCENE, BOARD_STEP, BOARD_STILL, BOARD_TILES, BOARD_VIEW,
	boardAvatarAt, boardChipAt, boardTileAt, boardZoomAt,
} from '@/lib/product-visual-board'
import {
	productVisualDefaults,
	type AddData, type BoardData, type FiltersData, type NarrowData, type PatternsData, type ProductVisualDataMap,
	type ProductVisualKind, type RecordData, type SheetData, type ThemesData, type ThreadData, type TimelineData,
} from '@/lib/product-visual-data'
import { toSlot, type ImageSlot } from '@/lib/image'

export * from '@/lib/product-visual-data'
export { productVisualCss } from '@/lib/product-visual-css'

/** Where the stage's ASCII field sits, by feature row (the site's ASCII_AT). */
export const productVisualAsciiAt = ['0 0', '40% 24%', '64% 56%', '20% 80%']

type Kid = Node | string | number | null | undefined | false | Kid[]
type Attrs = Record<string, string | number | boolean | null | undefined>

function el(tag: string, attrs: Attrs = {}, ...kids: Kid[]): HTMLElement {
	const node = document.createElement(tag)
	for (const [k, v] of Object.entries(attrs)) {
		if (v === undefined || v === null || v === false) continue
		node.setAttribute(k, v === true ? '' : String(v))
	}
	append(node, kids)
	return node
}
function append(node: Node, kids: Kid[]) {
	for (const kid of kids) {
		if (kid === null || kid === undefined || kid === false) continue
		if (Array.isArray(kid)) append(node, kid)
		else node.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid)
	}
}
const SVG = 'http://www.w3.org/2000/svg'
function svg(paths: string[], circle = false): SVGElement {
	const s = document.createElementNS(SVG, 'svg')
	s.setAttribute('class', 'ds-pv-icon')
	s.setAttribute('viewBox', '0 0 16 16')
	s.setAttribute('aria-hidden', 'true')
	if (circle) {
		const c = document.createElementNS(SVG, 'circle')
		c.setAttribute('cx', '7')
		c.setAttribute('cy', '7')
		c.setAttribute('r', '4.5')
		s.appendChild(c)
	}
	for (const d of paths) {
		const p = document.createElementNS(SVG, 'path')
		p.setAttribute('d', d)
		s.appendChild(p)
	}
	return s
}
const searchIcon = () => svg(['m10.5 10.5 3 3'], true)
const filterIcon = () => svg(['M2.5 4.5h11M4.5 8h7M6.5 11.5h3'])

const ANGLES = [160, 200, 135, 225, 180, 150, 210, 120, 170]
/** A picture: the image when there is one (a src or { src, alt, fit, position }), else a neutral shape (its angle
 * varies by slot), marked as a placeholder. */
function pic(image: string | ImageSlot | undefined, i: number, attrs: Attrs = {}, at: { x?: number; y?: number; zoom?: number } = {}) {
	const style = `--pv-ph-a: ${ANGLES[i % ANGLES.length]}deg`
	const slot = toSlot(image)
	const x = at.x ?? 50
	const y = at.y ?? 50
	const where = slot.position ?? `${x}% ${y}%`
	const img = slot.src
		? el('img', { class: 'ds-pv-img', src: slot.src, alt: slot.alt ?? '', loading: 'lazy', decoding: 'async', style: `object-position: ${where}; transform-origin: ${where}${slot.fit ? `; object-fit: ${slot.fit}` : ''}${at.zoom ? `; scale: ${at.zoom}` : ''}` })
		: el('span', { class: 'ds-pv-ph', 'data-ds-placeholder': '' })
	return el('span', { class: 'ds-pv-pic', style, ...attrs }, img)
}
/** A round mark: the image, or the initial. */
function mark(src: string | undefined, initial: string | undefined, tone?: 'inset' | 'row', cls = 'ds-pv-mark') {
	return el('span', { class: cls, 'data-tone': tone }, src ? el('img', { src, alt: '', loading: 'lazy' }) : el('span', { 'aria-hidden': 'true' }, initial ?? ''))
}
const sr = (text?: string) => (text ? el('p', { class: 'ds-pv-sr' }, text) : null)

// ----- Pacing -----
const REDUCED = '(prefers-reduced-motion: reduce)'
const CHANGE = 700 // the site's --dur-loop-change: a step's change, before its hold starts
const ms = (raw: string, fallback: number) => {
	const v = raw.trim()
	const n = parseFloat(v)
	if (!Number.isFinite(n)) return fallback
	return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n
}
const pacing = (root: Element) => {
	const cs = getComputedStyle(root)
	return { first: ms(cs.getPropertyValue('--ds-read-first'), 3800), hold: ms(cs.getPropertyValue('--ds-read-hold'), 2800) }
}

interface Cycle {
	choose(i: number): void
	shown(): number
	dispose(): void
}
/** Steps 0..n-1 from `rest` while on screen; `apply` draws a step. With reduced motion it shows `still`. */
function cycle(root: HTMLElement, n: number, rest: number, apply: (i: number) => void, still = rest): Cycle {
	const reduce = window.matchMedia(REDUCED)
	let step = rest
	let inView = false
	let chosen = false
	let fresh = true
	let timer = 0
	let key = ''
	let drawn = -1
	const shown = () => (reduce.matches && !chosen ? still : step)
	const sync = () => {
		const now = shown()
		if (now !== drawn) {
			drawn = now
			apply(now)
		}
		const cycling = inView && !document.hidden && !reduce.matches && !chosen && n > 1
		const next = `${cycling}:${step}`
		if (next === key) return
		key = next
		window.clearTimeout(timer)
		if (!cycling) {
			fresh = true
			return
		}
		const p = pacing(root)
		timer = window.setTimeout(() => {
			fresh = false
			step = (step + 1) % n
			sync()
		}, fresh ? p.first : CHANGE + p.hold)
	}
	const io = new IntersectionObserver(([e]) => {
		inView = e.isIntersecting
		sync()
	}, { threshold: 0.15 })
	io.observe(root)
	document.addEventListener('visibilitychange', sync)
	reduce.addEventListener('change', sync)
	sync()
	return {
		choose(i) {
			if (i === shown()) return
			step = i
			chosen = true
			sync()
		},
		shown,
		dispose() {
			window.clearTimeout(timer)
			io.disconnect()
			document.removeEventListener('visibilitychange', sync)
			reduce.removeEventListener('change', sync)
		},
	}
}

/** The switch's indicator: a pill under the chosen of n equal segments. */
function steps(labels: string[], at: number, attrs: Attrs = {}, tab?: { panel: string; ids: string[] }) {
	const items = labels.map((label, i) =>
		tab
			? el('button', { type: 'button', role: 'tab', id: tab.ids[i], 'aria-controls': tab.panel, class: 'ds-pv-step' }, label)
			: el('span', { class: 'ds-pv-step' }, label),
	)
	const row = el('div', { class: 'ds-pv-steps', style: `--n: ${labels.length}; --i: ${at}`, ...attrs }, el('span', { class: 'ds-pv-indicator', 'aria-hidden': 'true' }), items)
	const set = (i: number) => {
		row.style.setProperty('--i', String(i))
		items.forEach((item, k) => {
			if (tab) {
				item.setAttribute('aria-selected', String(k === i))
				item.tabIndex = k === i ? 0 : -1
			} else item.toggleAttribute('data-on', k === i)
		})
	}
	set(at)
	return { row, items, set }
}
const on = (nodes: Element[], i: number) => nodes.forEach((n, k) => n.toggleAttribute('data-on', k === i))

let uid = 0
type Built = { node: HTMLElement; start(root: HTMLElement): () => void }
const noop = () => () => () => {}

// ----- Records: brand, creative, page, creator, tagged -----
function record(kind: ProductVisualKind, d: RecordData): Built {
	const variant = kind === 'creator-record' || kind === 'tagged-record' ? 'creator' : 'brand'
	const clip = kind === 'page-record'
	const stack = (rank: number, cls: string, render: (k: number) => Kid) => el('span', { class: 'ds-pv-stack' }, d.sets.map((_, k) => el('span', { class: cls, 'data-set': k, 'data-rank': rank }, render(k))))
	const motion = el('div', { class: 'ds-pv-record', 'data-variant': variant, 'aria-hidden': 'true' },
		el('span', { class: 'ds-pv-picture' }, d.sets.map((s, k) => pic(s.picture, k, { 'data-set': k, 'data-rank': 0 }))),
		el('span', { class: 'ds-pv-panel' },
			stack(1, 'ds-pv-who', (k) => {
				const s = d.sets[k]
				return [s.mark ? mark(s.mark.src, s.mark.initial ?? s.name[0]) : null, el('span', { class: 'ds-pv-names', 'data-clip': clip }, el('span', { class: 'ds-pv-name' }, s.name), el('span', { class: 'ds-pv-handle' }, s.sub))]
			}),
			d.labels.map((label, i) => el('span', { class: 'ds-pv-row ds-pv-rule' }, el('span', { class: 'ds-pv-label' }, label), stack(i + 2, 'ds-pv-value', (k) => d.sets[k].values[i] ?? ''))),
		),
	)
	const node = el('div', { class: 'ds-pv-root ds-pv-center' }, motion, sr(d.summary))
	return { node, start: () => startPanelsMotion(motion, { reading: true }) }
}

function thread(d: ThreadData): Built {
	const stack = (rank: number, cls: string, render: (k: number) => Kid) => el('span', { class: 'ds-pv-stack' }, d.sets.map((_, k) => el('span', { class: cls, 'data-set': k, 'data-rank': rank }, render(k))))
	const rows = Math.max(...d.sets.map((s) => s.comments.length))
	const motion = el('div', { class: 'ds-pv-record', 'data-variant': 'thread', 'aria-hidden': 'true' },
		el('span', { class: 'ds-pv-picture' }, d.sets.map((s, k) => pic(s.picture, k, { 'data-set': k, 'data-rank': 0 }))),
		el('span', { class: 'ds-pv-panel' },
			stack(1, 'ds-pv-who', (k) => [el('span', { class: 'ds-pv-name' }, d.handle), el('span', { class: 'ds-pv-handle' }, d.sets[k].meta)]),
			Array.from({ length: rows }, (_, i) => el('span', { class: 'ds-pv-row ds-pv-rule', 'data-thread': true }, stack(i + 2, 'ds-pv-comment', (k) => {
				const c = d.sets[k].comments[i]
				if (!c) return null
				return [mark(c.avatar, c.handle[0]?.toUpperCase(), 'inset'), el('span', { class: 'ds-pv-body' }, el('span', { class: 'ds-pv-by' }, el('span', {}, c.handle), el('span', {}, c.likes)), el('span', { class: 'ds-pv-text ds-pv-ellipsis' }, c.text))]
			}))),
		),
	)
	motion.querySelectorAll('.ds-pv-stack > .ds-pv-who').forEach((n) => n.setAttribute('data-column', ''))
	const node = el('div', { class: 'ds-pv-root ds-pv-center' }, motion, sr(d.summary))
	return { node, start: () => startPanelsMotion(motion, { reading: true }) }
}

// ----- Add an account -----
function add(d: AddData): Built {
	const last = d.steps.length - 1
	const s = steps(d.steps, last)
	const a = d.account
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-add', 'data-step': last },
		el('div', { class: 'ds-pv-sheet', 'data-tight': true, 'aria-hidden': 'true', inert: true },
			el('div', { class: 'ds-pv-head' }, el('span', { class: 'ds-pv-strong' }, d.title), el('span', { class: 'ds-pv-sub' }, d.free)),
			el('div', { class: 'ds-pv-field' }, d.inputs.map((input) => el('span', { class: 'ds-pv-input' }, input))),
			el('div', { class: 'ds-pv-control' }, s.row),
			el('div', { class: 'ds-pv-account' }, el('div', {}, el('div', { class: 'ds-pv-account-row' },
				mark(a.avatar, a.initial),
				el('span', { class: 'ds-pv-details' },
					el('span', { class: 'ds-pv-bars' }, el('span', { class: 'ds-pv-bar' }), el('span', { class: 'ds-pv-bar' })),
					el('span', { class: 'ds-pv-text-block' }, el('span', { class: 'ds-pv-name' }, a.name), el('span', { class: 'ds-pv-sub ds-pv-ellipsis' }, `${a.category}, ${a.followers}`)),
				),
			))),
		),
		sr(d.summary),
	)
	return { node, start: (root) => cycle(root, d.steps.length, last, (i) => { node.dataset.step = String(i); s.set(i) }).dispose }
}

// ----- Comment themes -----
function themes(d: ThemesData): Built {
	const s = steps(d.themes.map((t) => t.label), 0)
	const shares = d.themes.map((t) => el('span', { class: 'ds-pv-share' }, t.share))
	const views = d.themes.map((t) => el('div', { class: 'ds-pv-view' }, t.comments.map((c) => el('div', { class: 'ds-pv-theme-comment' },
		mark(c.avatar, c.handle[0]?.toUpperCase(), 'inset'),
		el('span', { class: 'ds-pv-body' }, el('span', {}, c.handle), el('span', { class: 'ds-pv-ellipsis' }, c.text)),
	))))
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-add ds-pv-themes' },
		el('div', { class: 'ds-pv-sheet', 'data-tight': true, 'aria-hidden': 'true' },
			el('div', { class: 'ds-pv-head' }, el('span', { class: 'ds-pv-strong' }, d.title), el('span', { class: 'ds-pv-shares' }, shares)),
			el('div', { class: 'ds-pv-control' }, s.row),
			el('div', { class: 'ds-pv-views' }, views),
		),
		sr(d.summary),
	)
	const draw = (i: number) => { s.set(i); on(shares, i); on(views, i) }
	draw(0)
	return { node, start: (root) => cycle(root, d.themes.length, 0, draw).dispose }
}

// ----- Creator filters -----
function filters(d: FiltersData): Built {
	const n = Math.max(...d.filters.map((f) => f.step)) + 1
	const chips = d.filters.map((f) => el('span', { class: 'ds-pv-chip' }, el('span', {}, f.label), el('span', {}, f.value)))
	const rows = d.rows.map((r) => el('div', { class: 'ds-pv-fold' }, el('div', {}, el('div', { class: 'ds-pv-face ds-pv-rule' },
		mark(r.avatar, r.initial, 'row'),
		el('span', { class: 'ds-pv-who-col' }, el('span', { class: 'ds-pv-strong ds-pv-ellipsis' }, r.handle), el('span', { class: 'ds-pv-sub ds-pv-ellipsis' }, r.city)),
		el('span', { class: 'ds-pv-figure' }, r.followers),
	))))
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-filters' },
		el('div', { class: 'ds-pv-sheet', 'aria-hidden': 'true' },
			el('div', { class: 'ds-pv-query' }, searchIcon(), el('span', {}, d.query)),
			el('div', { class: 'ds-pv-chips' }, chips),
			el('div', {}, rows),
		),
		sr(d.summary),
	)
	const draw = (i: number) => {
		d.filters.forEach((f, k) => chips[k].toggleAttribute('data-on', f.step > 0 && i >= f.step))
		d.rows.forEach((r, k) => rows[k].toggleAttribute('data-out', r.out !== 0 && i >= r.out))
	}
	draw(n - 1)
	return { node, start: (root) => cycle(root, n, n - 1, draw).dispose }
}

// ----- Narrow -----
function narrow(d: NarrowData): Built {
	const n = d.counts.length
	const counts = d.counts.map((c) => el('span', {}, c))
	const pills = d.filters.map((f) => el('span', { class: 'ds-pv-pill' }, f))
	const tiles = d.tiles.map((t, i) => pic(t, i))
	const node = el('div', { class: 'ds-pv-root ds-pv-center' },
		el('div', { class: 'ds-pv-narrow', 'aria-hidden': 'true' },
			el('div', { class: 'ds-pv-search' }, searchIcon(), el('span', { class: 'ds-pv-ellipsis' }, d.query), el('span', { class: 'ds-pv-counts' }, counts)),
			el('div', { class: 'ds-pv-narrow-filters' }, filterIcon(), pills),
			el('div', { class: 'ds-pv-grid' }, tiles.map((t) => el('span', { class: 'ds-pv-slot' }, t))),
		),
		sr(d.summary),
	)
	const draw = (i: number) => {
		on(counts, i)
		pills.forEach((p, k) => p.toggleAttribute('data-on', i > k))
		d.tiles.forEach((t, k) => tiles[k].toggleAttribute('data-out', Boolean(t.out) && i >= t.out))
	}
	draw(n - 1)
	return { node, start: (root) => cycle(root, n, n - 1, draw).dispose }
}

// ----- Timeline -----
const SCALE = '.'.repeat(64)
const RUN = '='.repeat(64)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
function timeline(d: TimelineData): Built {
	const from = day(d.axis.from)
	const span = day(d.axis.to) - from
	const at = (iso: string) => (day(iso) - from) / span
	const year = d.today.slice(0, 4)
	const short = (iso: string) => {
		const text = `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
		return iso.startsWith(year) ? text : `${text} ${iso.slice(0, 4)}`
	}
	const rest = Math.min(1, d.windows.length - 1)
	const s = steps(d.windows.map((w) => w.label), rest)
	const rows = d.rows.map((r, i) => {
		const start = at(r.first)
		const length = Math.max(at(r.latest) - start, 0)
		return el('div', { class: 'ds-pv-fold' }, el('div', {}, el('div', { class: 'ds-pv-face' },
			el('span', { class: 'ds-pv-thumb' }, pic(r.picture, i)),
			el('span', { class: 'ds-pv-who-col' }, el('span', { class: 'ds-pv-strong ds-pv-ellipsis' }, r.name), el('span', { class: 'ds-pv-sub ds-pv-ellipsis' }, `${short(r.first)} to ${short(r.latest)}`)),
			el('span', { class: 'ds-pv-glyphs ds-pv-track' }, SCALE, el('span', { class: 'ds-pv-window' }, SCALE), el('span', { class: 'ds-pv-run', style: `--start: ${start}; --span: ${length}` }, RUN)),
			el('span', { class: 'ds-pv-count' }, r.posts),
		)))
	})
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-timeline' },
		el('div', { class: 'ds-pv-sheet', 'aria-hidden': 'true' },
			el('div', { class: 'ds-pv-head' }, el('span', { class: 'ds-pv-brand' }, mark(d.brand.mark, d.brand.name[0], undefined, 'ds-pv-logo'), el('span', { class: 'ds-pv-strong' }, d.brand.name)), el('span', { class: 'ds-pv-sub' }, d.title)),
			el('div', { class: 'ds-pv-control' }, s.row),
			el('div', {}, rows),
			el('div', { class: 'ds-pv-axis' }, d.axis.labels.map((l) => el('span', {}, l))),
		),
		sr(d.summary),
	)
	const draw = (i: number) => {
		const w = d.windows[i]?.from ?? null
		node.style.setProperty('--shade', String(w ? 1 - at(w) : 1))
		s.set(i)
		d.rows.forEach((r, k) => rows[k].toggleAttribute('data-out', Boolean(w) && r.first < (w as string)))
	}
	draw(rest)
	return { node, start: (root) => cycle(root, d.windows.length, rest, draw).dispose }
}

// ----- Ranked sheet -----
const SHARE = '='.repeat(64)
function sheet(d: SheetData): Built {
	const id = `ds-pv-${++uid}`
	const n = d.views.length
	const tabs = d.views.map((label, i) => el('button', { type: 'button', role: 'tab', id: `${id}-tab-${i}`, 'aria-controls': `${id}-panel`, class: 'ds-pv-tab' }, label))
	const pill = el('span', { class: 'ds-pv-tray-pill', 'aria-hidden': 'true' })
	const tray = el('div', { role: 'tablist', 'aria-label': `${d.brand.name}: ${d.switchLabel}`, class: 'ds-pv-tray' }, pill, tabs)
	const slots = Math.max(...d.views.map((_, v) => d.rows.filter((r) => r.at[v] !== null).length))
	const rows = d.rows.map((r, k) => {
		const values = r.values.map((v) => el('span', {}, v))
		const fill = r.fill ? el('span', { class: 'ds-pv-fill' }, SHARE) : null
		const li = el('li', { class: 'ds-pv-rank', 'data-muted': r.muted },
			el('span', { class: 'ds-pv-rank-thumb' }, pic(r.picture, k)),
			el('span', { class: 'ds-pv-rank-main' },
				el('span', { class: 'ds-pv-rank-line' }, el('span', { class: 'ds-pv-name-cell ds-pv-ellipsis' }, r.name), r.tag ? el('span', { class: 'ds-pv-sub' }, r.tag) : null),
				fill ? el('span', { class: 'ds-pv-glyphs ds-pv-fill-track' }, SCALE, fill) : null,
			),
			el('span', { class: 'ds-pv-values' }, values),
		)
		return { li, values, fill }
	})
	const summary = el('p', { class: 'ds-pv-sr' })
	const panel = el('div', { role: 'tabpanel', id: `${id}-panel` }, el('ol', { class: 'ds-pv-ranked', style: `--slots: ${slots}`, 'aria-hidden': 'true' }, rows.map((r) => r.li)), summary)
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-sheetlist' },
		el('div', { class: 'ds-pv-sheet' },
			el('div', { class: 'ds-pv-sheet-head' }, mark(d.brand.logo, d.brand.name[0], undefined, 'ds-pv-logo'), el('span', { class: 'ds-pv-strong' }, d.brand.name), el('span', { class: 'ds-pv-sub ds-pv-ellipsis ds-pv-note' }, d.brand.note), tray),
			panel,
		),
	)
	const measure = () => {
		const tab = tabs.find((t) => t.getAttribute('aria-selected') === 'true')
		if (!tab) return
		pill.style.setProperty('--x', `${tab.offsetLeft}px`)
		pill.style.setProperty('--w', `${tab.offsetWidth}px`)
	}
	const draw = (i: number) => {
		tabs.forEach((t, k) => {
			t.setAttribute('aria-selected', String(k === i))
			t.tabIndex = k === i ? 0 : -1
		})
		panel.setAttribute('aria-labelledby', tabs[i].id)
		measure()
		d.rows.forEach((r, k) => {
			const place = r.at[i]
			rows[k].li.toggleAttribute('data-out', place === null)
			rows[k].li.style.setProperty('--at', String(place ?? r.at.find((a) => a !== null) ?? 0))
			on(rows[k].values, i)
			rows[k].fill?.style.setProperty('--share', String(r.fill?.[i] ?? 0))
		})
		summary.textContent = d.summary?.[i] ?? ''
	}
	draw(0)
	return {
		node,
		start(root) {
			const c = cycle(root, n, 0, draw, 0)
			const choose = (i: number) => c.choose(i)
			tabs.forEach((t, i) => t.addEventListener('click', () => choose(i)))
			tray.addEventListener('keydown', (e) => keys(e, c.shown(), n, (to) => { choose(to); tabs[to].focus() }))
			const ro = new ResizeObserver(measure)
			ro.observe(tray)
			return () => { c.dispose(); ro.disconnect() }
		},
	}
}

function keys(e: KeyboardEvent, at: number, n: number, go: (to: number) => void) {
	const to = e.key === 'ArrowRight' ? (at + 1) % n : e.key === 'ArrowLeft' ? (at + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null
	if (to === null) return
	e.preventDefault()
	go(to)
}

// ----- Patterns switch -----
const SHARE_MAX = 40
function patterns(d: PatternsData): Built {
	const id = `ds-pv-${++uid}`
	const n = d.views.length
	const ids = d.views.map((_, i) => `${id}-tab-${i}`)
	const s = steps(d.views.map((v) => v.label), 0, { role: 'tablist', 'aria-label': `${d.brand} patterns` }, { panel: `${id}-panel`, ids })
	const slots = Math.max(...d.views.map((v) => v.rows.length))
	const names: HTMLElement[][] = []
	const values: HTMLElement[][] = []
	const fills: HTMLElement[] = []
	const set = el('ol', { class: 'ds-pv-set' }, Array.from({ length: slots }, (_, slot) => {
		names[slot] = d.views.map((v) => el('span', {}, v.rows[slot]?.name ?? ''))
		values[slot] = d.views.map((v) => el('span', {}, v.rows[slot] ? `${v.rows[slot].share}%` : ''))
		fills[slot] = el('span', { class: 'ds-pv-bar-fill' })
		return el('li', { class: 'ds-pv-share-row' }, el('span', { class: 'ds-pv-swap' }, names[slot]), el('span', { class: 'ds-pv-swap' }, values[slot]), el('span', { class: 'ds-pv-bar-track' }, fills[slot]))
	}))
	const summary = el('p', { class: 'ds-pv-sr' })
	const panel = el('div', { role: 'tabpanel', id: `${id}-panel` }, set, summary)
	const ads = d.ads.map((a, i) => el('div', { class: 'ds-pv-ad' }, pic(a, i + 3, {}, { x: a.x }), el('span', { class: 'ds-pv-badge' }, '1')))
	const node = el('div', { class: 'ds-pv-root ds-pv-clip ds-pv-fade ds-pv-patterns' },
		el('div', { class: 'ds-pv-sheet' },
			el('div', { class: 'ds-pv-head' }, mark(d.logo, d.brand[0], undefined, 'ds-pv-logo'), el('span', { class: 'ds-pv-strong' }, d.brand), el('span', { class: 'ds-pv-sub' }, d.window)),
			el('div', { class: 'ds-pv-control' }, s.row),
			panel,
			el('div', { class: 'ds-pv-ads', 'aria-hidden': 'true' }, ads),
		),
	)
	const draw = (i: number) => {
		const view = d.views[i]
		s.set(i)
		panel.setAttribute('aria-labelledby', ids[i])
		set.setAttribute('aria-label', `Top ${view.label.toLowerCase()}, share of ${d.brand}'s ads`)
		for (let slot = 0; slot < slots; slot++) {
			names[slot].forEach((x, k) => { x.toggleAttribute('data-on', k === i); x.setAttribute('aria-hidden', String(k !== i)) })
			values[slot].forEach((x, k) => { x.toggleAttribute('data-on', k === i); x.setAttribute('aria-hidden', String(k !== i)) })
			fills[slot].style.transform = `scaleX(${Math.min((view.rows[slot]?.share ?? 0) / SHARE_MAX, 1)})`
		}
		ads.forEach((a, k) => a.toggleAttribute('data-top', view.top.includes(k)))
		summary.textContent = `${d.brand}, ${d.window.toLowerCase()}. Top ${view.label.toLowerCase().replace(/s$/, '')}: ${view.rows[0]?.name ?? ''}, ${view.rows[0]?.share ?? 0}% of ads.`
	}
	draw(0)
	return {
		node,
		start(root) {
			const c = cycle(root, n, 0, draw, 0)
			s.items.forEach((t, i) => t.addEventListener('click', () => c.choose(i)))
			s.row.addEventListener('keydown', (e) => keys(e, c.shown(), n, (to) => { c.choose(to); s.items[to].focus() }))
			return c.dispose
		},
	}
}

// ----- Links board -----
function board(d: BoardData): Built {
	const scenes = d.scenes.map((s, n) => {
		const t0 = BOARD_TILES[0]
		const tileStyle = (t: { x: number; y: number; w: number; h: number }) => `--x: ${t.x}; --y: ${t.y}; --w: ${t.w}; --h: ${t.h}`
		const page = el('div', { class: 'ds-pv-tile', style: tileStyle(t0) },
			pic(s.page, n, {}, { y: s.page.y }),
			el('div', { class: 'ds-pv-page-ui' },
				el('span', { class: 'ds-pv-ads-count' }, s.page.ads),
				el('span', { class: 'ds-pv-url-bar' }, mark(s.logo, s.brand[0], undefined, 'ds-pv-logo'), el('span', { class: 'ds-pv-ellipsis' }, el('span', { class: 'ds-pv-sub' }, s.page.domain), s.page.path)),
			),
		)
		const tiles = BOARD_TILES.slice(1).map((t, i) => el('div', { class: 'ds-pv-tile', style: tileStyle(t) }, pic(s.tiles[i], n + i + 1, {}, s.tiles[i] ?? {})))
		const avatars = [0, 1].map((i) => el('div', { class: 'ds-pv-avatar', style: `--cx: ${BOARD_AVATAR.x[i]}; --cy: ${BOARD_AVATAR.y}; --d: ${BOARD_AVATAR.d}` }, pic(s.creators[i]?.avatar, n + i + 4)))
		const chips = [0, 1].map((i) => el('span', { class: 'ds-pv-handle-chip', style: `--cx: ${BOARD_AVATAR.x[i]}; --edge: ${BOARD_AVATAR.y + BOARD_AVATAR.d / 2}` }, s.creators[i]?.handle ?? ''))
		const scene = el('div', { class: 'ds-pv-scene', style: `visibility: ${n === 0 ? 'visible' : 'hidden'}` }, page, tiles, avatars.map((a, i) => [a, chips[i]]))
		return { scene, tiles: [page, ...tiles], avatars, chips }
	})
	const view = el('div', { class: 'ds-pv-boardview' }, scenes.map((s) => s.scene))
	const canvas = el('div', { class: 'ds-pv-canvas', 'aria-hidden': 'true' }, view)
	const node = el('div', { class: 'ds-pv-board' }, canvas,
		el('div', { class: 'ds-pv-sr' }, d.scenes.map((s) => el('p', {}, `${s.brand}: ${s.page.ads.replace('point here', 'point to')} ${s.page.domain}${s.page.path}. Creators it works with: ${s.creators.map((c) => c.handle).join(' and ')}.`))),
	)
	const loop = BOARD_SCENE * scenes.length
	return {
		node,
		start(root) {
			let u = 1
			const measure = () => (u = Math.max(node.clientWidth, node.clientHeight) / BOARD_VIEW)
			let shown = 0
			let drawn = -1
			const draw = (f: number) => {
				if (f === drawn) return
				drawn = f
				const n = Math.floor(f / BOARD_SCENE) % scenes.length
				const k = f - Math.floor(f / BOARD_SCENE) * BOARD_SCENE
				if (n !== shown) {
					scenes[shown].scene.style.visibility = 'hidden'
					scenes[n].scene.style.visibility = 'visible'
					shown = n
				}
				view.style.transform = `scale(${boardZoomAt(k)})`
				const p = scenes[n]
				p.tiles.forEach((t, i) => {
					const v = boardTileAt(i, k)
					t.style.opacity = String(v.opacity)
					t.style.transform = v.scale < 1 ? `scale(${v.scale})` : ''
				})
				for (let i = 0; i < 2; i++) {
					const a = boardAvatarAt(i, k)
					p.avatars[i].style.opacity = String(a.opacity)
					p.avatars[i].style.transform = `scale(${a.scale})`
					const c = boardChipAt(i, k)
					p.chips[i].style.opacity = String(c.opacity)
					p.chips[i].style.transform = `translate(-50%, ${(c.dy * u).toFixed(2)}px)`
				}
			}
			const reduce = window.matchMedia(REDUCED)
			let raf = 0
			let onScreen = false
			let last = 0
			let clock = BOARD_STILL * BOARD_STEP
			let owed = pacing(root).first
			const frame = () => (clock / BOARD_STEP) % loop
			const tick = (now: number) => {
				const dt = last ? Math.min(now - last, 100) : 0
				last = now
				if (owed > 0) owed -= dt
				else clock += dt
				draw(frame())
				raf = requestAnimationFrame(tick)
			}
			const update = () => {
				cancelAnimationFrame(raf)
				raf = 0
				last = 0
				if (reduce.matches) return draw(BOARD_STILL)
				draw(frame())
				if (onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(tick)
			}
			const io = new IntersectionObserver((entries) => {
				onScreen = entries[entries.length - 1].isIntersecting
				update()
			}, { threshold: 0.25 })
			const ro = new ResizeObserver(() => {
				measure()
				const f = drawn
				drawn = -1
				if (f >= 0) draw(f)
			})
			measure()
			io.observe(root)
			ro.observe(node)
			document.addEventListener('visibilitychange', update)
			reduce.addEventListener('change', update)
			update()
			return () => {
				cancelAnimationFrame(raf)
				io.disconnect()
				ro.disconnect()
				document.removeEventListener('visibilitychange', update)
				reduce.removeEventListener('change', update)
			}
		},
	}
}

function build(kind: ProductVisualKind, data: unknown): Built {
	switch (kind) {
		case 'brand-record':
		case 'creative-record':
		case 'page-record':
		case 'creator-record':
		case 'tagged-record':
			return record(kind, data as RecordData)
		case 'comment-thread':
			return thread(data as ThreadData)
		case 'add-account':
		case 'add-creator':
			return add(data as AddData)
		case 'comment-themes':
			return themes(data as ThemesData)
		case 'creator-filters':
			return filters(data as FiltersData)
		case 'filter-narrow':
		case 'posts-narrow':
			return narrow(data as NarrowData)
		case 'collabs-timeline':
		case 'tagged-timeline':
			return timeline(data as TimelineData)
		case 'media-mix':
		case 'campaigns':
		case 'pages-switch':
			return sheet(data as SheetData)
		case 'links-board':
			return board(data as BoardData)
		case 'patterns-switch':
			return patterns(data as PatternsData)
		default:
			return { node: el('div', { class: 'ds-pv-root' }), start: noop() }
	}
}

export interface MountProductVisualOptions<K extends ProductVisualKind = ProductVisualKind> {
	kind: K
	/** The kind's data; its Acme default when left out. */
	data?: ProductVisualDataMap[K]
	/** Which of the four ASCII field positions the stage takes (a product page alternates them by row), or false for none. */
	texture?: number | false
}

/** Builds the visual inside `stage` (the element carrying the `ds-pv` stage class) and starts its loop. Returns the
 * function that stops the loop and removes what it built. */
export function mountProductVisual<K extends ProductVisualKind>(stage: HTMLElement, { kind, data, texture = 0 }: MountProductVisualOptions<K>): () => void {
	const built = build(kind, data ?? productVisualDefaults[kind] ?? productVisualDefaults['brand-record'])
	const added: Node[] = []
	if (texture !== false) {
		const ascii = el('span', { class: 'ds-pv-ascii', 'aria-hidden': 'true', style: `--pv-ascii-at: ${productVisualAsciiAt[Math.abs(Math.trunc(texture)) % productVisualAsciiAt.length]}` })
		ascii.style.setProperty('--pv-ascii', `url("${ASCII_TEXTURE}")`)
		added.push(ascii)
	}
	added.push(built.node)
	added.forEach((n) => stage.appendChild(n))
	const stop = built.start(stage)
	return () => {
		stop()
		added.forEach((n) => n.parentNode?.removeChild(n))
	}
}
