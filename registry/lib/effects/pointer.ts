// When the site's pointer effects run (effect/finePointer): a mouse or a pen that hovers, on a screen 768 wide or more.
// Touch, a coarse pointer or a narrow screen gets the still picture.
export const FINE_POINTER = '(hover: hover) and (pointer: fine) and (min-width: 768px)'
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export const isFinePointer = () => !!globalThis.matchMedia && globalThis.matchMedia(FINE_POINTER).matches
export const prefersReducedMotion = () => !!globalThis.matchMedia && globalThis.matchMedia(REDUCED_MOTION).matches
/** Pointer effects run: a fine pointer and no reduced motion. */
export const pointerEffectsOn = () => isFinePointer() && !prefersReducedMotion()

type Stop = () => void
/**
 * Runs `start` while pointer effects are on and stops it when they go off, following the media queries as they change
 * (a window widened past 768, a mouse plugged in, reduced motion turned off), as the site's useFinePointer does.
 * `start` returns its stop, or a promise of it (a lazily loaded engine). Returns the unwatch, which also stops it.
 */
export function whilePointerEffects(start: () => Stop | Promise<Stop>): Stop {
	if (!globalThis.matchMedia) return () => {}
	const queries = [FINE_POINTER, REDUCED_MOTION].map((q) => globalThis.matchMedia(q))
	let run = 0
	let stop: Stop | null = null
	const halt = () => {
		run += 1
		stop?.()
		stop = null
	}
	const update = () => {
		halt()
		if (!pointerEffectsOn()) return
		const mine = run
		void Promise.resolve(start()).then((s) => {
			if (mine === run) stop = s
			else s()
		})
	}
	queries.forEach((q) => q.addEventListener('change', update))
	update()
	return () => {
		queries.forEach((q) => q.removeEventListener('change', update))
		halt()
	}
}
