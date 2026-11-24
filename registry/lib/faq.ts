// The site's FAQ rows (ui/FaqAccordion): when one answer closes and another opens, every answer slot has the height of
// the longest answer, so the rows between the two move by that height. They are drawn where they were and slid to
// their new place by transform only (added to any slide still running), over --faq-dur on the site's ease-out. Both
// flavors call it after the open row changes. With reduced motion nothing slides.
export interface FaqMove { from: number; to: number; distance: number }

export function slideFaqRows(list: HTMLElement, move: FaqMove) {
	if (!move.distance || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
	const css = getComputedStyle(list)
	const raw = css.getPropertyValue('--faq-dur').trim()
	const duration = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000
	const easing = css.getPropertyValue('--faq-ease').trim() || 'ease-out'
	const down = move.to > move.from
	const offset = down ? move.distance : -move.distance
	for (let i = Math.min(move.from, move.to) + 1; i <= Math.max(move.from, move.to); i++)
		list.children[i]?.animate([{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0)' }], { duration: duration || 320, easing, composite: 'add' })
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
