import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { prefersReduced, SWAP_CSS, swapLeaveMs, swapTo, type SwapItem } from '@/lib/text-swap'
import styles from 'virtual:tw'

// TextSwap.tsx as <spyglass-text-swap>: a value that changes in place, the old one rising out as the new one rises in
// (480ms, the loop curve; at once with reduced motion). `text`, `unit` (small muted text after it) and `tag` (a badge).
// The type comes from the page: classes on the host reach the value by inheritance.

/**
 * @summary A value that swaps in place when it changes.
 */
export class TextSwap extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(SWAP_CSS)]
	static properties = { text: {}, unit: {}, tag: {}, items: { state: true } }
	text = ''
	/** Small muted text after the value ("/month"). */
	unit?: string
	/** A small badge after the value ("Save 20%"). */
	tag?: string
	private items: SwapItem[] = []
	private dropAt = new Map<number, number>()
	private frame = 0
	private timer = 0

	protected willUpdate(changed: PropertyValues) {
		const next = { text: this.text ?? '', unit: this.unit || undefined, tag: this.tag || undefined }
		if (!this.items.length) this.items = [{ id: 0, ...next, state: 'in' }]
		else if (changed.has('text') || changed.has('unit') || changed.has('tag')) this.items = swapTo(this.items, next, prefersReduced())
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('items')) return
		cancelAnimationFrame(this.frame)
		clearTimeout(this.timer)
		if (this.items.some((i) => i.state === 'enter')) {
			this.frame = requestAnimationFrame(() => {
				this.frame = requestAnimationFrame(() => (this.items = this.items.map((i) => (i.state === 'enter' ? { ...i, state: 'in' as const } : i))))
			})
		}
		const now = performance.now()
		const leaving = this.items.filter((i) => i.state === 'out')
		const live = new Set(leaving.map((i) => i.id))
		for (const id of this.dropAt.keys()) if (!live.has(id)) this.dropAt.delete(id)
		const ms = swapLeaveMs(this)
		for (const i of leaving) if (!this.dropAt.has(i.id)) this.dropAt.set(i.id, now + ms)
		if (leaving.length) {
			const due = Math.min(...leaving.map((i) => this.dropAt.get(i.id) ?? now))
			this.timer = window.setTimeout(() => {
				const t = performance.now()
				const done = new Set(leaving.filter((i) => (this.dropAt.get(i.id) ?? 0) <= t).map((i) => i.id))
				this.items = this.items.filter((c) => !done.has(c.id))
			}, Math.max(0, due - now))
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		cancelAnimationFrame(this.frame)
		clearTimeout(this.timer)
	}

	render() {
		return html`<span data-ds="text-swap" class="inline-grid overflow-clip align-top [overflow-clip-margin:var(--ds-space-xs)]">${this.items.map((item) => html`<span class="ds-swap-item" data-state=${item.state} aria-hidden=${item.state === 'out' ? 'true' : nothing}>${item.text}${item.unit ? html`<span class="ms-2 font-text text-ui/5 text-fg-muted">${item.unit}</span>` : nothing}${item.tag ? html`<span class="relative ms-2 inline-block rounded-ds-sm bg-white px-2 py-1 font-text text-caption/5 font-medium whitespace-nowrap text-black">${item.tag}</span>` : nothing}</span>`)}</span>`
	}
}

define('text-swap', TextSwap)
