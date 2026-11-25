import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { faqShift, faqSlotHeight, slideFaqRows, type FaqMove } from '@/lib/faq'
import styles from 'virtual:tw'

// FaqAccordion.tsx as <spyglass-faq-accordion>: the site's FAQ rows, one answer open at a time, every open slot as tall
// as the longest answer so the rows between slide by that height (transform only); the plus turns to a minus. Arrows,
// Home and End move between questions. `items` (JSON: { q, a, id? }), `default-open` (-1 for none), `edge` (top or
// bottom), `narrow`.
export interface FaqAccordionItem { q: string; a: string; id?: string }

const ROW = 'relative border-t border-edge bg-surface first:border-t-0'

/** @summary Questions that open one at a time, the rows sliding to make room. */
export class FaqAccordion extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="faq-accordion"]'))
	static properties = { items: { type: Array }, defaultOpen: { type: Number, attribute: 'default-open' }, edge: {}, narrow: { type: Boolean }, open: { state: true } }
	items: FaqAccordionItem[] = []
	/** The row open at first; -1 for none. */
	defaultOpen = 0
	/** The hairline above the list (top) or under it (bottom). */
	edge: 'top' | 'bottom' = 'top'
	/** Centered and no wider than the measure plus 80px. */
	narrow = false
	private open?: number
	private move: FaqMove | null = null
	private rowId = uid('faq')

	private get list() { return this.renderRoot.querySelector<HTMLElement>('[data-ds="faq-accordion"]') }

	private select(clicked: number, current: number, closed: number) {
		const next = clicked === current ? closed : clicked
		const distance = faqSlotHeight(this.list)
		this.move = { from: current, to: next, distance, shift: faqShift(this.list, current, next, distance, closed) }
		this.open = next
	}

	protected updated(changed: Map<string, unknown>) {
		super.updated(changed as never)
		const pending = this.move
		this.move = null
		if (pending && this.list) slideFaqRows(this.list, pending)
	}

	private onKeyDown(e: KeyboardEvent) {
		const triggers = [...this.renderRoot.querySelectorAll<HTMLButtonElement>('[data-trigger]')]
		const at = triggers.indexOf((this.renderRoot as ShadowRoot).activeElement as HTMLButtonElement)
		if (at < 0) return
		const target = ({ ArrowDown: (at + 1) % triggers.length, ArrowUp: (at - 1 + triggers.length) % triggers.length, Home: 0, End: triggers.length - 1 } as Record<string, number>)[e.key]
		if (target === undefined) return
		e.preventDefault()
		triggers[target].focus()
	}

	render() {
		const items = this.items ?? []
		const closed = items.length
		const open = this.open ?? (this.defaultOpen < 0 ? closed : this.defaultOpen)
		const id = this.rowId
		const sizers = (skip: number) => items.map((other, j) => (j === skip ? nothing : html`<span aria-hidden="true" data-text=${other.a} class="invisible block type-body text-pretty text-fg-soft [grid-area:1/1] before:content-[attr(data-text)]"></span>`))
		return html`<div data-ds="faq-accordion" @keydown=${this.onKeyDown} class=${['ds-faq min-w-0 overflow-y-clip border-edge [overflow-anchor:none]', this.edge === 'bottom' ? 'border-b' : 'border-t', this.narrow ? 'mx-auto max-w-[calc(var(--ds-layout-measure)+var(--ds-space-5xl))]' : ''].filter(Boolean).join(' ')}>${items.map((item, i) => {
			const isOpen = i === open
			return html`<div id=${ifDefined(item.id)} data-open=${String(isOpen)} class=${ROW}><h3 class="[font:inherit]"><button type="button" id=${`${id}-q-${i}`} data-trigger aria-expanded=${String(isOpen)} aria-controls=${`${id}-a-${i}`} @click=${() => this.select(i, open, closed)} class="group/faq -mx-2 flex min-h-control-lg w-[calc(100%+2*var(--ds-space-sm))] cursor-pointer items-start justify-between gap-6 rounded-ds-sm px-2 py-5 text-left text-fg-soft transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:text-fg active:text-fg aria-expanded:text-fg md:py-6"><span class="min-w-0 type-body-lg text-balance">${item.q}</span><span aria-hidden="true" class="ds-faq-icon relative h-7 w-3 flex-none"></span></button></h3><div data-slot class=${isOpen ? 'h-auto' : 'h-0'}><div class="grid grid-cols-[minmax(0,var(--ds-layout-measure))] bg-surface pb-6 md:pb-8"><div id=${`${id}-a-${i}`} role="region" aria-labelledby=${`${id}-q-${i}`} class="ds-faq-panel [grid-area:1/1]"><p class="block type-body text-pretty text-fg-soft">${item.a}</p></div>${sizers(i)}</div></div></div>`
		})}<div data-open=${String(open === closed)} aria-hidden="true" class=${ROW}><div data-slot class=${open === closed ? 'h-auto' : 'h-0'}><div class="grid grid-cols-[minmax(0,var(--ds-layout-measure))] bg-surface pb-6 md:pb-8">${sizers(-1)}</div></div></div></div>`
	}
}

define('faq-accordion', FaqAccordion)
