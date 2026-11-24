// The site's feature demo player (v2/V2Features Demo.tsx and timeline.ts), framework-free: a timeline is a list of
// tracks, each an element with its resting style and the keyframes it passes through at given times; the player turns
// them into looping Web Animations that run only while a quarter of the demo is on screen and the tab is visible, and
// rebuilds them when the demo's width changes. With reduced motion nothing animates and each element keeps its rest.

export type Frame = { at: number; style: Keyframe; ease?: string }
export type Track = { el: Element | null | undefined; rest: Keyframe; frames: Frame[] }
export type Timeline = { duration: number; tracks: Track[] }

/** The brand's motion, read from the tokens. */
export type Motion = {
	/** The loop's step: how long a state holds (site --dur-loop-step). */
	step: number
	/** A change between states (site --dur-loop-change). */
	change: number
	/** A row fading in (site --dur-loop-badge). */
	fade: number
	/** A quick switch (site --dur-loop-pill). */
	swap: number
	/** Between items (site --dur-seq-stagger). */
	stagger: number
	/** A flick from the last state home (site --dur-loop-flick). */
	flick: number
	/** The site's --dur-fast, --dur, --dur-move and --dur-slow. */
	fast: number
	dur: number
	move: number
	slow: number
	ease: string
	out: string
	inOut: string
}

const ms = (raw: string) => {
	const n = parseFloat(raw) || 0
	return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
}

export function readMotion(el: Element = document.documentElement): Motion {
	const css = getComputedStyle(el)
	const v = (name: string) => css.getPropertyValue(name).trim()
	return {
		step: ms(v('--ds-loop-step')) || 2600,
		change: ms(v('--ds-loop-change')) || 700,
		fade: ms(v('--ds-loop-badge')) || 500,
		swap: ms(v('--ds-loop-pill')) || 150,
		stagger: ms(v('--ds-seq-stagger')) || 180,
		flick: ms(v('--ds-loop-flick')) || 1400,
		fast: ms(v('--ds-duration-micro')) || 160,
		dur: ms(v('--ds-duration-enter')) || 240,
		move: ms(v('--ds-duration-glide')) || 320,
		slow: ms(v('--ds-duration-slow')) || 480,
		ease: v('--ds-easing-loop') || 'ease-in-out',
		out: v('--ds-easing-out') || 'ease-out',
		inOut: v('--ds-easing-in-out') || 'ease-in-out',
	}
}

/** A move from one style to another between two times. */
export const move = (from: number, to: number, a: Keyframe, b: Keyframe, ease: string): Frame[] => [{ at: from, style: a, ease }, { at: to, style: b }]

/** A cut from one style to another at a time. */
export const snap = (at: number, a: Keyframe, b: Keyframe): Frame[] => [{ at, style: a }, { at: at + 1, style: b }]

const RHYTHM = [64, 88, 56, 80, 72, 96, 60] as const
/** Characters appearing one by one at a typist's uneven rhythm. */
export function typing(chars: Element[], hideAt: number, startAt: number): { tracks: Track[]; end: number } {
	let t = startAt
	const tracks = chars.map((el, i) => {
		t += RHYTHM[i % RHYTHM.length]
		return { el, rest: { opacity: 1 }, frames: [...snap(hideAt, { opacity: 1 }, { opacity: 0 }), ...snap(t, { opacity: 0 }, { opacity: 1 })] }
	})
	return { tracks, end: t }
}

function build({ duration, tracks }: Timeline): Animation[] {
	const out: Animation[] = []
	for (const { el, rest, frames } of tracks) {
		if (!el) continue
		const sorted = [...frames].sort((a, b) => a.at - b.at)
		const keyframes: Keyframe[] = [
			{ ...rest, offset: 0, easing: 'linear' },
			...sorted.map((f) => ({ ...f.style, offset: Math.min(Math.max(f.at / duration, 0), 1), easing: f.ease ?? 'linear' })),
			{ ...rest, offset: 1 },
		]
		const animation = el.animate(keyframes, { duration, iterations: Infinity, fill: 'both' })
		animation.pause()
		out.push(animation)
	}
	return out
}

/** Plays `timeline` on `root` from `start` ms; returns the function that stops it. */
export function startDemo(root: HTMLElement, timeline: (root: HTMLElement, motion: Motion) => Timeline, start = 0): () => void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
	let animations: Animation[] = []
	let onScreen = false
	let time = start
	const playing = () => onScreen && document.visibilityState === 'visible'
	const sync = () => {
		for (const a of animations) {
			if (playing()) a.play()
			else a.pause()
		}
	}
	const clear = () => {
		const current = animations[0]?.currentTime
		if (typeof current === 'number') time = current
		for (const a of animations) a.cancel()
		animations = []
	}
	let near = false
	const setup = () => {
		if (!near) return
		clear()
		const loop = timeline(root, readMotion(root))
		if (reduce.matches) return
		animations = build(loop)
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
	let width = root.clientWidth
	let frame = 0
	const ro = new ResizeObserver(() => {
		if (root.clientWidth === width) return
		width = root.clientWidth
		cancelAnimationFrame(frame)
		frame = requestAnimationFrame(setup)
	})
	approach.observe(root)
	io.observe(root)
	ro.observe(root)
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
