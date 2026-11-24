// The site's instrument clock (components/instrument/clock.ts), framework-free: a scene is built from a root's DOM
// and the brand tokens, then drawn at a time in its loop on each frame while at least half of it is on screen and the
// tab is visible. With reduced motion it draws its resting frame and stays there. Both flavors run the home's
// instruments (the archive axis, the pricing meter) with it.

export type Scene = { loop: number; rest: number; draw: (t: number) => void; dispose?: () => void }

export type Bezier = [number, number, number, number]

export type Tokens = {
	ms: (name: string, fallback: number) => number
	ease: (name: string, fallback: Bezier) => (x: number) => number
	px: (name: string, fallback: number) => number
	color: (name: string) => string
	font: (name: string) => string
}

/** A cubic-bezier curve as a function of progress. */
export function bezier([x1, y1, x2, y2]: Bezier) {
	const cx = 3 * x1
	const bx = 3 * (x2 - x1) - cx
	const ax = 1 - cx - bx
	const cy = 3 * y1
	const by = 3 * (y2 - y1) - cy
	const ay = 1 - cy - by
	const sx = (t: number) => ((ax * t + bx) * t + cx) * t
	const sy = (t: number) => ((ay * t + by) * t + cy) * t
	const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
	return (x: number) => {
		if (x <= 0) return 0
		if (x >= 1) return 1
		let t = x
		for (let i = 0; i < 8; i++) {
			const err = sx(t) - x
			if (Math.abs(err) < 1e-5) return sy(t)
			const d = dx(t)
			if (Math.abs(d) < 1e-6) break
			t -= err / d
		}
		let lo = 0
		let hi = 1
		t = x
		for (let i = 0; i < 24; i++) {
			const v = sx(t)
			if (Math.abs(v - x) < 1e-5) break
			if (v < x) lo = t
			else hi = t
			t = (lo + hi) / 2
		}
		return sy(t)
	}
}

/** Reads time, easing, length, color and font tokens from an element's computed style. */
export function readTokens(el: Element): Tokens {
	const css = getComputedStyle(el)
	const v = (name: string) => css.getPropertyValue(name).trim()
	return {
		ms: (name, fallback) => {
			const raw = v(name)
			const n = parseFloat(raw)
			if (!Number.isFinite(n)) return fallback
			return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
		},
		ease: (name, fallback) => {
			const m = v(name).match(/cubic-bezier\(([^)]+)\)/)
			const nums = m?.[1].split(',').map(Number)
			return bezier(nums && nums.length === 4 && nums.every(Number.isFinite) ? (nums as Bezier) : fallback)
		},
		px: (name, fallback) => {
			const n = parseFloat(v(name))
			return Number.isFinite(n) ? n : fallback
		},
		color: (name) => v(name),
		font: (name) => v(name) || 'monospace',
	}
}

export const span = (t: number, a: number, b: number) => (b <= a ? (t >= b ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / (b - a))))
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k

export interface SceneOptions {
	/** Draw this time and stay there (a still for a screenshot). */
	freeze?: number
	/** Play whenever any of it is on screen, not only from half. */
	playWhileVisible?: boolean
}

/** Runs a scene on `root`; returns the function that stops it. */
export function startScene<T extends HTMLElement>(root: T, build: (root: T, tokens: Tokens) => Scene | Promise<Scene>, { freeze, playWhileVisible = false }: SceneOptions = {}): () => void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
	let scene: Scene | null = null
	let time = -1
	let last = 0
	let raf = 0
	let inView = false
	let near = false
	let alive = true
	let width = root.clientWidth
	let generation = 0

	const playing = () => scene && inView && !document.hidden && !reduce.matches && freeze === undefined

	const tick = (now: number) => {
		if (!scene) return
		const dt = last ? Math.min(now - last, 64) : 0
		last = now
		time += dt
		scene.draw(((time % scene.loop) + scene.loop) % scene.loop)
		raf = requestAnimationFrame(tick)
	}

	const sync = () => {
		cancelAnimationFrame(raf)
		last = 0
		if (!scene) return
		if (freeze !== undefined) scene.draw(freeze % scene.loop)
		else if (reduce.matches) scene.draw(scene.rest)
		else if (playing()) raf = requestAnimationFrame(tick)
		else scene.draw(((time % scene.loop) + scene.loop) % scene.loop)
	}

	const setup = async () => {
		if (!near) return
		const mine = ++generation
		const next = await build(root, readTokens(root))
		if (!alive || mine !== generation) {
			next.dispose?.()
			return
		}
		scene?.dispose?.()
		scene = next
		if (time < 0) time = next.rest
		sync()
	}

	const io = new IntersectionObserver(([entry]) => {
		inView = playWhileVisible ? entry.isIntersecting : entry.intersectionRatio >= 0.5
		sync()
	}, { threshold: [0, 0.5] })
	const approach = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return
		approach.disconnect()
		near = true
		void setup()
	}, { rootMargin: '100% 0px' })
	let frame = 0
	const ro = new ResizeObserver(() => {
		if (root.clientWidth === width) return
		width = root.clientWidth
		cancelAnimationFrame(frame)
		frame = requestAnimationFrame(() => void setup())
	})

	approach.observe(root)
	io.observe(root)
	ro.observe(root)
	document.addEventListener('visibilitychange', sync)
	reduce.addEventListener('change', sync)
	return () => {
		alive = false
		approach.disconnect()
		io.disconnect()
		ro.disconnect()
		cancelAnimationFrame(raf)
		cancelAnimationFrame(frame)
		document.removeEventListener('visibilitychange', sync)
		reduce.removeEventListener('change', sync)
		scene?.dispose?.()
	}
}

export function setData(el: Element | null | undefined, name: string, value: string | null) {
	if (!el) return
	const attr = `data-${name}`
	if (value === null) {
		if (el.hasAttribute(attr)) el.removeAttribute(attr)
	} else if (el.getAttribute(attr) !== value) el.setAttribute(attr, value)
}

export function setStyle(el: HTMLElement | SVGElement | null | undefined, prop: string, value: string) {
	if (!el) return
	if (el.style.getPropertyValue(prop) !== value) el.style.setProperty(prop, value)
}

export function setText(el: Element | null | undefined, value: string) {
	if (el && el.textContent !== value) el.textContent = value
}
