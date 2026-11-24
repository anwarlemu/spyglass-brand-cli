// The site's creative sequence (v2/V2Pricing PanelsMotion), framework-free so both flavors and any visual can run it.
// A stage holds sets of creatives stacked in slots: each picture carries data-set (its set, 0 first) and data-rank (its
// place in the stagger). Sets take turns: each creative fades in while settling from a smaller scale on the site's
// spring-like curve, holds, then fades and shrinks away while the next set arrives, one creative after another. An
// element with data-light dims a little between sets. Pictures with data-scatter drift with the page's scroll
// (--p, read as a parallax depth by the stage's CSS). It runs only while the stage is on screen and the tab is visible,
// once every picture has decoded; with reduced motion nothing moves and the first set stays.
// `reading` paces it for a reading visual (the products pages' records): each set holds for the reading time.

export interface PanelsMotionOptions {
	/** Pace each set to the reading hold (--ds-read-hold), the first one longer (--ds-read-first). */
	reading?: boolean
}

const ms = (value: string, fallback = 0) => {
	const v = value.trim()
	const n = parseFloat(v)
	if (!Number.isFinite(n)) return fallback
	return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n
}

// Every image under the stage, also inside web components' open shadow roots (the creative cards).
const images = (root: Element | ShadowRoot): HTMLImageElement[] => Array.from(root.querySelectorAll('*')).flatMap((el) => [...(el instanceof HTMLImageElement ? [el] : []), ...(el.shadowRoot ? images(el.shadowRoot) : [])])

/** Starts the sequence on `stage`; returns the function that stops it. */
export function startPanelsMotion(stage: HTMLElement, { reading = false }: PanelsMotionOptions = {}): () => void {
	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
	const token = (name: string) => getComputedStyle(stage).getPropertyValue(name).trim()
	const hold = () => ms(token('--ds-read-hold'), 2800)
	const holdFirst = () => ms(token('--ds-read-first'), 3800)
	let animations: Animation[] = []
	let onScreen = false
	let ready = false
	let gone = false
	let owed = reading ? Math.max(0, holdFirst() - hold()) : 0
	let owing = 0
	let since = 0

	const build = () => {
		const pictures = Array.from(stage.querySelectorAll<HTMLElement>('[data-set]'))
		if (!pictures.length) return
		const sets = new Set(pictures.map((p) => p.dataset.set)).size
		const slots = pictures.length / sets
		const enter = ms(token('--ds-seq-in'), 900)
		const leave = ms(token('--ds-seq-out'), 540)
		const stagger = ms(token('--ds-seq-stagger'), 180)
		const set = reading ? (slots - 1) * stagger + enter + hold() + leave : ms(token('--ds-seq-set'), 3800)
		const from = `scale(${token('--ds-seq-from-scale') || 0.85})`
		const easeIn = token('--ds-easing-loop')
		const easeOut = token('--ds-easing-in-out')
		const linear = token('--ds-easing-seq-settle')
		const settle = linear && CSS.supports('transition-timing-function', linear) ? linear : token('--ds-easing-seq-settle-fallback')
		const loop = set * sets
		const away = set - leave
		const at = (t: number) => t / loop
		const lead = (slots - 1) * stagger + enter
		const timing = (p: HTMLElement): KeyframeAnimationOptions => ({ duration: loop, iterations: Infinity, fill: 'both', delay: Number(p.dataset.set) * set + Number(p.dataset.rank ?? 0) * stagger - lead })
		animations = pictures.flatMap((p) => [
			p.animate([
				{ offset: 0, opacity: 0, easing: easeIn },
				{ offset: at(enter), opacity: 1 },
				{ offset: at(away), opacity: 1, easing: easeOut },
				{ offset: at(away + leave), opacity: 0 },
				{ offset: 1, opacity: 0 },
			], timing(p)),
			p.animate([
				{ offset: 0, transform: from, easing: settle },
				{ offset: at(away), transform: 'none', easing: easeOut },
				{ offset: at(away + leave), transform: from },
				{ offset: 1, transform: from },
			], timing(p)),
		])
		const light = stage.querySelector<HTMLElement>('[data-light]')
		if (light) {
			const low = Number(token('--ds-seq-light-low') || 0.88)
			animations.push(light.animate([
				{ offset: 0, opacity: low, easing: easeIn },
				{ offset: lead / set, opacity: 1 },
				{ offset: away / set, opacity: 1, easing: easeOut },
				{ offset: 1, opacity: low },
			], { duration: set, iterations: Infinity, fill: 'both', delay: -lead }))
		}
		animations.forEach((a) => a.pause())
	}

	let frame = 0
	const drift = () => {
		frame = 0
		const box = stage.getBoundingClientRect()
		stage.style.setProperty('--p', `${Math.round(box.top + box.height / 2 - window.innerHeight / 2)}px`)
	}
	const drifts = stage.querySelector('[data-scatter]') !== null
	const onScroll = () => {
		if (drifts && !frame && onScreen && !reduce.matches) frame = window.requestAnimationFrame(drift)
	}
	if (drifts) window.addEventListener('scroll', onScroll, { passive: true })

	const owe = (now: number) => {
		owed -= now - since
		since = now
		if (owed > 0) {
			owing = window.requestAnimationFrame(owe)
			return
		}
		owing = 0
		owed = 0
		sync()
	}

	const sync = () => {
		if (reduce.matches) {
			animations.forEach((a) => a.cancel())
			animations = []
			stage.style.removeProperty('--p')
			return
		}
		if (onScreen) onScroll()
		if (!animations.length) build()
		const run = onScreen && !document.hidden && ready
		if (owing && !run) {
			window.cancelAnimationFrame(owing)
			owing = 0
		}
		if (run && owed > 0) {
			if (!owing) {
				since = performance.now()
				owing = window.requestAnimationFrame(owe)
			}
			animations.forEach((a) => a.pause())
		} else animations.forEach((a) => (run ? a.play() : a.pause()))
		if (onScreen && !ready) whole()
	}

	let waiting = false
	const whole = () => {
		if (waiting) return
		waiting = true
		const pictures = images(stage)
		pictures.forEach((img) => {
			if (img.loading === 'lazy') img.loading = 'eager'
		})
		Promise.all(pictures.map((img) => img.decode().catch(() => undefined))).then(() => {
			if (gone) return
			ready = true
			sync()
		})
	}

	const io = new IntersectionObserver(([entry]) => {
		onScreen = entry.isIntersecting
		sync()
	})
	io.observe(stage)
	const near = new IntersectionObserver(([entry]) => {
		if (!entry.isIntersecting) return
		near.disconnect()
		whole()
	}, { rootMargin: '100% 0px' })
	near.observe(stage)
	document.addEventListener('visibilitychange', sync)
	reduce.addEventListener('change', sync)

	return () => {
		gone = true
		window.cancelAnimationFrame(owing)
		io.disconnect()
		near.disconnect()
		window.removeEventListener('scroll', onScroll)
		window.cancelAnimationFrame(frame)
		document.removeEventListener('visibilitychange', sync)
		reduce.removeEventListener('change', sync)
		animations.forEach((a) => a.cancel())
	}
}
