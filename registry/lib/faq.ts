// The site's FAQ rows (ui/FaqAccordion): when one answer closes and another opens, every answer slot has the height of
// the longest answer, so the rows between the two move by that height. They are drawn where they were and slid to
// their new place by transform only (added to any slide still running), over --faq-dur on the site's ease-out; when the
// row opened would slide out of view above, the page scrolls with it so it stays in view. Both flavors call it after
// the open row changes. With reduced motion nothing slides (the page just keeps the row in view).
export interface FaqMove { from: number; to: number; distance: number; /** How far the page scrolls up so the opened row stays in view. */ shift?: number }

// What a slide still owes the page's scroll, per list, so a second press during a slide measures from where the rows
// will land.
const owed = new WeakMap<HTMLElement, number>()

/** Opening a row below the open one moves it up by the closing answer's height; when that would take it above the
 * view (the page's scroll padding), the page scrolls back with the rows so the question stays where it was read. */
export function faqShift(list: HTMLElement | null, open: number, next: number, distance: number, closed: number): number {
	if (!list || next <= open || next === closed) return 0
	let rest = list.getBoundingClientRect().top - distance + (owed.get(list) ?? 0) + (list.children[next] as HTMLElement).clientTop
	for (let i = 0; i < next; i++) rest += list.children[i].getBoundingClientRect().height
	const inset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
	return Math.max(0, Math.round(inset - rest))
}

export function slideFaqRows(list: HTMLElement, move: FaqMove) {
	const shift = move.shift ?? 0
	if (!move.distance) return
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		if (shift) window.scrollBy({ top: -shift, behavior: 'instant' })
		return
	}
	const css = getComputedStyle(list)
	const raw = css.getPropertyValue('--faq-dur').trim()
	const duration = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000
	const easing = css.getPropertyValue('--faq-ease').trim() || 'ease-out'
	const down = move.to > move.from
	const offset = down ? move.distance : -move.distance
	let clock: Animation | undefined
	for (let i = Math.min(move.from, move.to) + 1; i <= Math.max(move.from, move.to); i++) {
		const a = list.children[i]?.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }], { duration: duration || 320, easing, composite: 'add' })
		clock ??= a
	}
	if (!clock || !shift) return
	// The scroll follows the slide frame by frame, so the opened question holds still on screen.
	const rows = clock
	let paid = 0
	owed.set(list, (owed.get(list) ?? 0) + shift)
	const tick = () => {
		const running = rows.playState === 'running' && list.isConnected
		const progress = running ? (rows.effect?.getComputedTiming().progress ?? 1) : 1
		const before = window.scrollY
		window.scrollBy({ top: paid - shift * (progress as number), behavior: 'instant' })
		const step = before - window.scrollY
		paid += step
		owed.set(list, (owed.get(list) ?? 0) - step)
		if (running) requestAnimationFrame(tick)
		else owed.set(list, (owed.get(list) ?? 0) - (shift - paid))
	}
	requestAnimationFrame(tick)
}

/** The height every open answer slot has (the open slot's), measured before the change. */
export function faqSlotHeight(list: HTMLElement | null): number {
	return list?.querySelector<HTMLElement>('[data-open="true"] [data-slot]')?.getBoundingClientRect().height ?? 0
}

export const faqExample = [
	{ q: 'What does the Creator plan cost?', a: '$10 for your first month, then $20/month.' },
	{ q: 'How many people can use it?', a: 'Unlimited team seats come with the plan, so everyone who makes or reviews creative can search.' },
	{ q: 'Which networks are in the index?', a: 'Meta, TikTok, Instagram, and YouTube creatives in one index.' },
	{ q: 'How long does it take to add a brand?', a: 'Add any brand or creator in under a minute.' },
]
