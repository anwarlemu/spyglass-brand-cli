// The templates wall's motion (site v2/V2Templates/templatesMotion.ts), framework-free so the React component and the
// web component run the same code: a helix of tiles drifting toward the viewer and turning slowly around the words,
// each tile fading in where it clears the headline and out before it reaches the edge, while the chip under the
// headline rolls through the template names and its surface stretches to each name's width.
//
// Tiles are elements the wall styles itself: with `pictures` each shows one (background cover, color as posted);
// without, each takes one of four neutral tones (data-tone 1 to 4), so the wall never needs a third-party picture.
// Every length, count and duration is a --ds-templates-* token read from the root, so the CSS decides the layout.
// Reduced motion draws one still frame (the first name, the tunnel at rest). `at` draws the frame at that time and
// holds it (a still for print and screenshots).

export interface TemplatesWallElements {
	root: HTMLElement
	tunnel: HTMLElement
	box: HTMLElement
	tiles: HTMLElement[]
	/** The rows of words the tiles keep clear of (the headline, the chip, the lead, the status). */
	rows: HTMLElement[]
	names: HTMLElement[]
	chip: HTMLElement
	capL: HTMLElement
	capR: HTMLElement
	bar: HTMLElement
}

export interface TemplatesWallOptions {
	/** Pictures for the tiles, used in turn; none draws the neutral tones. */
	pictures?: string[]
	/** Draw the frame at this time (ms) and hold it. */
	at?: number
}

export interface TemplatesWall {
	destroy(): void
}

/** The number of tile elements the wall renders (the pool the tunnel draws from). */
export const TEMPLATES_WALL_TILES = 80

type Tier = 'near' | 'mid' | 'far'
interface Place { n: number; pick: number; flip: number; along: number; across: number; tile: number }

const TIER_SCALE: Record<Tier, number> = { near: 1.5, mid: 1, far: 0.5 }
const TIER_NEAR = 1.25
const TIER_FAR = 0.6
const CLEAR_BAND = 0.15
const TONES = 4

function bezier(x1: number, y1: number, x2: number, y2: number) {
	const at = (t: number, a: number, b: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t
	return (x: number) => {
		if (x <= 0) return 0
		if (x >= 1) return 1
		let lo = 0
		let hi = 1
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2
			if (at(mid, x1, x2) < x) lo = mid
			else hi = mid
		}
		return at((lo + hi) / 2, y1, y2)
	}
}

function readTokens(el: HTMLElement) {
	const css = getComputedStyle(el)
	const v = (name: string) => css.getPropertyValue(name).trim()
	const ms = (name: string) => {
		const raw = v(name)
		const n = parseFloat(raw) || 0
		return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
	}
	const num = (name: string) => parseFloat(v(name)) || 0
	const curve = v('--ds-easing-templates-name').match(/-?\d*\.?\d+/g)?.map(Number) ?? [0.85, 0, 0.15, 1]
	return {
		ease: bezier(curve[0] ?? 0.85, curve[1] ?? 0, curve[2] ?? 0.15, curve[3] ?? 1),
		step: ms('--ds-templates-name-step') || 2400,
		move: ms('--ds-templates-name-move') || 600,
		appear: ms('--ds-templates-appear') || 600,
		gather: ms('--ds-templates-gather'),
		appearScale: num('--ds-templates-appear-scale'),
		edge: num('--ds-templates-edge'),
		designW: num('--ds-templates-design-w') || 500,
		designH: num('--ds-templates-design-h') || 1084,
		tileW: num('--ds-templates-tile-w') || 176,
		tileH: num('--ds-templates-tile-h') || 220,
		pitch: (num('--ds-templates-tile-h') || 220) + num('--ds-templates-tile-gap'),
		perTurn: num('--ds-templates-per-turn') || 18.5,
		perspective: num('--ds-templates-perspective') || 520,
		count: num('--ds-templates-count') || 74,
		near: num('--ds-templates-near'),
		drift: num('--ds-templates-drift'),
		turn: num('--ds-templates-turn'),
		nearDim: num('--ds-templates-near-dim'),
		brightFrom: num('--ds-templates-bright-from') || 560,
		brightUntil: num('--ds-templates-bright-until') || 880,
		clear: num('--ds-templates-clear'),
	}
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const smooth = (n: number) => {
	const x = clamp01(n)
	return x * x * (3 - 2 * x)
}
const mod = (n: number, m: number) => ((n % m) + m) % m
const squircle = (x: number, y: number) => (x ** 4 + y ** 4) ** 0.25

export function createTemplatesWall(els: TemplatesWallElements, options: TemplatesWallOptions = {}): TemplatesWall {
	const pictures = options.pictures?.filter(Boolean) ?? []
	const picks = Math.max(1, pictures.length || TONES * 7)
	const names = els.names.length
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
	const frozen = options.at !== undefined
	let t = readTokens(els.root)

	let S = 0
	let radius = 0
	let dz = 1
	let stepDeg = 0
	let scale = 1
	let halfW = 0
	let halfH = 0
	let clearA = 1
	let clearB = 1
	let places: (Place | undefined)[] = []
	let free: number[] = []
	const present: number[] = []
	const whole: boolean[] = []
	const tiers: Tier[] = []
	let chipH = 0
	let barW = 1
	let widths: number[] = []

	const flowAt = (clock: number) => ((t.drift / dz) * clock) / 1000
	const turnAt = (clock: number) => (-t.turn * clock) / 1000
	const tierAt = (z: number): Tier => {
		const drawn = (t.perspective / z) * scale
		return drawn >= TIER_NEAR ? 'near' : drawn >= TIER_FAR ? 'mid' : 'far'
	}

	const measure = () => {
		t = readTokens(els.root)
		S = Math.round(t.count)
		radius = (t.pitch * t.perTurn) / (2 * Math.PI)
		dz = t.pitch / t.perTurn
		stepDeg = 360 / t.perTurn
		const W = els.tunnel.clientWidth
		const H = els.tunnel.clientHeight
		scale = Math.max(W / t.designW, H / t.designH) || 1
		halfW = W / 2
		halfH = H / 2
		els.box.style.transform = `translate(-50%, -50%) scale(${scale})`

		const frame = els.tunnel.getBoundingClientRect()
		const cx = frame.left + frame.width / 2
		const cy = frame.top + frame.height / 2
		const corners: [number, number][] = []
		let blockW = 1
		let blockH = 1
		for (const row of els.rows) {
			const r = row.getBoundingClientRect()
			const x = Math.max(Math.abs(r.left - cx), Math.abs(r.right - cx)) + t.clear
			const y = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy)) + t.clear
			corners.push([x, y])
			blockW = Math.max(blockW, x)
			blockH = Math.max(blockH, y)
		}
		const grow = Math.max(1, ...corners.map(([x, y]) => squircle(x / blockW, y / blockH)))
		clearA = blockW * grow
		clearB = blockH * grow

		places = []
		free = els.tiles.map((el, j) => {
			el.style.visibility = ''
			present[j] = 0
			return j
		})
		chipH = els.chip.offsetHeight
		barW = els.bar.offsetWidth || 1
		const pad = parseFloat(getComputedStyle(els.chip).paddingInlineStart) || 0
		widths = els.names.map((n) => Math.ceil((n.offsetWidth + 2 * pad) / 4) * 4)
	}

	const decoded = new Map<string, boolean>()
	const keep: HTMLImageElement[] = []
	const loaded = (url: string) => {
		const state = decoded.get(url)
		if (state !== undefined) return state
		decoded.set(url, false)
		const img = new Image()
		img.src = url
		keep.push(img)
		const done = () => {
			decoded.set(url, true)
			if (!raf && !settle) settle = requestAnimationFrame(() => {
				settle = 0
				if (!raf) draw()
			})
		}
		img.decode().then(done, done)
		return false
	}
	const dress = (j: number, pick: number, tier: Tier) => {
		const el = els.tiles[j]!
		tiers[j] = tier
		el.style.width = `${t.tileW * TIER_SCALE[tier]}px`
		el.style.height = `${t.tileH * TIER_SCALE[tier]}px`
		if (pictures.length) {
			const url = pictures[pick % pictures.length]!
			if (el.dataset.src !== url) {
				el.dataset.src = url
				el.style.backgroundImage = `url("${url}")`
			}
			whole[j] = loaded(url)
		} else {
			el.dataset.tone = String((pick % TONES) + 1)
			whole[j] = true
		}
	}
	const release = (place: Place) => {
		els.tiles[place.tile]!.style.visibility = ''
		free.push(place.tile)
		place.tile = -1
	}

	const drawName = (clock: number) => {
		const k = Math.max(0, Math.floor(clock / t.step))
		const local = clock - k * t.step
		const pos = k === 0 ? 0 : k - 1 + t.ease(clamp01(local / t.move))
		els.names.forEach((el, i) => {
			const d = mod(i - pos + names / 2, names) - names / 2
			el.style.transform = `translate3d(0, ${d * chipH}px, 0)`
			el.style.opacity = Math.abs(d) < 1 ? '1' : '0'
		})
		const i0 = Math.floor(pos)
		const f = pos - i0
		const w0 = widths[mod(i0, names)] ?? 0
		const w1 = widths[mod(i0 + 1, names)] ?? 0
		const reach = Math.max(0, (w0 + (w1 - w0) * f) / 2 - chipH / 2)
		els.capL.style.transform = `translate3d(${-reach}px, 0, 0)`
		els.capR.style.transform = `translate3d(${reach}px, 0, 0)`
		els.bar.style.transform = `scaleX(${(2 * reach) / barW})`
	}

	const drawTunnel = (clock: number, dt: number) => {
		const flow = flowAt(clock)
		const turn = turnAt(clock)
		const f = t.perspective
		const perMs = t.drift / dz / 1000 || 1e-9
		const far = t.near + S * dz
		for (let i = 0; i < S; i++) {
			const n = i + S * Math.floor((flow - i) / S)
			let place = places[i]
			if (!place || place.n !== n) {
				if (place && place.tile >= 0) release(place)
				const best = (n + ((t.brightFrom + t.brightUntil) / 2 - t.near) / dz) / perMs
				const quarter = mod(-Math.round((n * stepDeg + turnAt(best)) / 90), 4)
				const sideways = quarter % 2 === 1
				place = places[i] = { n, pick: mod(n, picks), flip: quarter * 90, along: sideways ? t.tileW : t.tileH, across: sideways ? t.tileH : t.tileW, tile: -1 }
			}
			const z = t.near + (flow - n) * dz
			const angle = mod(n * stepDeg + turn, 360)
			const rad = (angle * Math.PI) / 180
			const dx = -Math.sin(rad)
			const dy = Math.cos(rad)
			const zIn = z + place.along / 2
			const zOut = z - place.along / 2
			let clear = Infinity
			let reach = Infinity
			let offL = true
			let offR = true
			if (zOut > 1) {
				reach = 0
				for (let edge = 0; edge < 2; edge++) {
					const zEdge = edge ? zOut : zIn
					const r = (f * radius) / zEdge
					const half = ((place.across / 2) * f) / zEdge
					for (let side = -1; side <= 1; side++) {
						const x = (r * dx + side * half * dy) * scale
						const y = (r * dy - side * half * dx) * scale
						if (!edge) clear = Math.min(clear, squircle(x / clearA, y / clearB))
						reach = Math.max(reach, Math.abs(y))
						offL &&= x < -halfW
						offR &&= x > halfW
					}
				}
			}
			const bright = (t.nearDim + (1 - t.nearDim) * smooth((z - t.near) / (t.brightFrom - t.near))) * (1 - smooth((z - t.brightUntil) / (far - t.brightUntil))) * smooth((clear - 1) / CLEAR_BAND)
			const room = halfH - t.edge - reach
			const held = place.tile >= 0
			const wanted = (held ? room > 0 : room > 8) && !offL && !offR && bright >= 0.004
			if (!held) {
				if (!wanted || !free.length) continue
				place.tile = free.pop() as number
				present[place.tile] = 0
				dress(place.tile, place.pick, tierAt(z))
			}
			const j = place.tile
			const el = els.tiles[j]!
			if (wanted) {
				if (!whole[j] && pictures.length) whole[j] = loaded(pictures[place.pick % pictures.length]!)
				if (present[j]! > 0 || (whole[j] && !gathering) || dt === Infinity) present[j] = Math.min(1, present[j]! + dt / t.appear)
			} else {
				present[j] = Math.max(0, present[j]! - dt / t.appear)
				if (present[j] === 0) {
					release(place)
					continue
				}
			}
			const tier = tierAt(z)
			if (tier !== tiers[j]) dress(j, place.pick, tier)
			const here = 1 - (1 - present[j]!) ** 3
			const size = (t.appearScale + (1 - t.appearScale) * here) / TIER_SCALE[tiers[j]!]
			el.style.transform = `translateZ(${(f - z).toFixed(2)}px) rotateZ(${angle.toFixed(3)}deg) translateY(${radius.toFixed(1)}px) rotateX(90deg) rotateZ(${place.flip}deg) scale(${size.toFixed(4)})`
			el.style.opacity = (bright * here).toFixed(3)
			el.style.visibility = present[j]! > 0 ? 'visible' : ''
		}
		if (gathering && (performance.now() >= gatherUntil || places.every((p) => !p || p.tile < 0 || whole[p.tile]))) gathering = false
	}

	let clock = options.at ?? 0
	let last = 0
	let raf = 0
	let settle = 0
	let inView = false
	let armed = false
	let gathering = false
	let gatherUntil = 0
	let gatherTimer = 0
	// A first frame (dt Infinity) shows every tile that is ready at once; the clock runs from there.
	const draw = (dt = Infinity) => {
		const at = reduced.matches && !frozen ? 0 : clock
		drawName(at)
		drawTunnel(at, dt)
	}
	const running = () => armed && inView && !document.hidden && !frozen && !reduced.matches
	const tick = (now: number) => {
		const dt = now - last > 500 ? 33 : now - last
		last = now
		clock += dt
		draw(dt)
		raf = requestAnimationFrame(tick)
	}
	const sync = () => {
		if (running() && !raf) {
			last = performance.now()
			raf = requestAnimationFrame(tick)
		} else if (!running() && raf) {
			cancelAnimationFrame(raf)
			raf = 0
		}
	}
	const arm = () => {
		if (armed) return
		armed = true
		gathering = !frozen && pictures.length > 0
		gatherUntil = performance.now() + t.gather
		gatherTimer = window.setTimeout(() => {
			if (gathering && !raf) draw()
		}, t.gather)
		measure()
		draw()
		els.root.dataset.ready = ''
		sync()
	}

	const near = new IntersectionObserver(([e]) => e?.isIntersecting && arm(), { rootMargin: '100% 0px' })
	near.observe(els.tunnel)
	const seen = new IntersectionObserver(([e]) => {
		inView = !!e?.isIntersecting
		sync()
	})
	seen.observe(els.tunnel)
	const remeasure = () => {
		if (!armed) return
		measure()
		draw()
	}
	let lastW = els.tunnel.clientWidth
	const ro = new ResizeObserver(() => {
		const w = els.tunnel.clientWidth
		if (w === lastW) return
		lastW = w
		remeasure()
	})
	ro.observe(els.tunnel)
	let alive = true
	document.fonts?.ready.then(() => alive && remeasure())
	const onReduced = () => {
		if (armed) draw()
		sync()
	}
	reduced.addEventListener('change', onReduced)
	document.addEventListener('visibilitychange', sync)
	arm()

	return {
		destroy() {
			alive = false
			cancelAnimationFrame(raf)
			cancelAnimationFrame(settle)
			clearTimeout(gatherTimer)
			near.disconnect()
			seen.disconnect()
			ro.disconnect()
			reduced.removeEventListener('change', onReduced)
			document.removeEventListener('visibilitychange', sync)
		},
	}
}
