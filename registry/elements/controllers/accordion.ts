import { tagName } from '@/elements/lib/element'

// useAccordion for elements: what a <spyglass-accordion> gives its items (whether a value is open, and the press that
// opens or closes it). An item finds its accordion as its closest ancestor, so accordions nest.
export type AccordionContext = { isOpen: (v: string) => boolean, toggle: (v: string) => void }

/** The accordion around an item, or null outside one (or while it is not defined yet: it renders its items again once
 * it is). */
export function accordionOf(item: Element): AccordionContext | null {
	const a = item.parentElement?.closest(tagName('accordion')) as (Element & Partial<AccordionContext>) | null
	return a && typeof a.isOpen === 'function' ? (a as AccordionContext) : null
}
