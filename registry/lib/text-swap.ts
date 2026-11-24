// The site's value swap (pages/Pricing/Swap): when the text changes, the old value rises 12px and fades out while the
// new one rises in from 12px below, both in one grid cell, over --ds-duration-slow on the loop curve. Both flavors keep
// their list of values with this, and share the CSS. With reduced motion the new value replaces the old at once.
export type SwapState = 'enter' | 'in' | 'out'
export interface SwapValue { text: string, unit?: string, tag?: string }
export interface SwapItem extends SwapValue { id: number, state: SwapState }

const same = (a: SwapValue | undefined, b: SwapValue) => !!a && a.text === b.text && a.unit === b.unit && a.tag === b.tag

/** The list after the value changes to `next`: the shown value leaves and `next` enters (or replaces it, reduced). */
export function swapTo(items: SwapItem[], next: SwapValue, reduced: boolean): SwapItem[] {
	if (same(items.find((i) => i.state !== 'out'), next)) return items
	const id = items.reduce((max, i) => Math.max(max, i.id), 0) + 1
	if (reduced) return [{ id, ...next, state: 'in' }]
	return [...items.map((i) => (i.state === 'out' ? i : { ...i, state: 'out' as const })), { id, ...next, state: 'enter' as const }]
}

export const prefersReduced = () => !!globalThis.matchMedia && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

/** How long a leaving value stays: the swap's duration token, in ms. */
export function swapLeaveMs(el: Element): number {
	const v = getComputedStyle(el).getPropertyValue('--ds-duration-slow').trim()
	const n = parseFloat(v)
	return Number.isFinite(n) && n > 0 ? n * (v.endsWith('ms') ? 1 : 1000) : 480
}

export const SWAP_CSS = `
.ds-swap-item { grid-area: 1 / 1; white-space: nowrap; transition: opacity var(--ds-duration-slow) var(--ds-easing-loop), translate var(--ds-duration-slow) var(--ds-easing-loop); }
.ds-swap-item[data-state="enter"] { opacity: 0; translate: 0 var(--ds-space-md); transition: none; }
.ds-swap-item[data-state="out"] { opacity: 0; translate: 0 calc(-1 * var(--ds-space-md)); }
@media (prefers-reduced-motion: reduce) { .ds-swap-item { transition: none; } }
`
