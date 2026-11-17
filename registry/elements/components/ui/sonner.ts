import { html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define } from '@/elements/lib/element'
import '@/elements/components/ui/toast'
import { getToasts, subscribeToasts, toast, TOAST_MOST, type ToastData } from '@/lib/sonner'
import styles from 'virtual:tw'

export { toast } from '@/lib/sonner'

// Sonner.tsx as <spyglass-sonner>: the corner where notes from toast() show: the bottom right, full width on a phone.
// The newest is in front; the two before it peek out above, 12px apart and a little smaller. Pointing at the stack (or
// tabbing into it) spreads it out and stops every note's time, as does a hidden tab. A note rises in from below over
// 300ms and leaves faster, 150ms, fading as it drops. Each has a close button; an action closes it after it runs. Put
// one on the page; show a note with `toast(title, { description, action })` from this module, or the element's
// toast() method.

const STEP = 100
const PEEK = 12
const GAP = 12

type Item = ToastData & { mounted: boolean, removed: boolean }

/**
 * @summary The corner where notes from toast() show, stacked.
 */
export class Sonner extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, items: { state: true }, hovered: { state: true }, focused: { state: true }, heights: { state: true } }

	/** The region's name for assistive tech. */
	label = 'Notifications'
	private items: Item[] = []
	// Spread while pointed at or while focus is inside: two reasons, kept apart so losing one keeps the other.
	private hovered = false
	private focused = false
	private get expanded() {
		return this.hovered || this.focused
	}
	private heights: Record<number, number> = {}
	private left = new Map<number, { left: number, shown: number }>()
	private last = new Map<number, string>()
	private exits = new Map<number, ReturnType<typeof setTimeout>>()
	private timer?: ReturnType<typeof setInterval>
	private frame = 0
	private unsubscribe?: () => void

	/** Shows a note (the module's toast()). */
	toast(title: string, options?: Parameters<typeof toast>[1]) {
		return toast(title, options)
	}

	// The store's notes, with those still leaving kept in their places.
	private sync = () => {
		const store = getToasts()
		const next: Item[] = this.items.map((p) => {
			const t = store.find((s) => s.id === p.id)
			return t ? { ...t, mounted: p.mounted, removed: false } : { ...p, removed: true }
		})
		for (const t of store) if (!this.items.some((p) => p.id === t.id)) next.push({ ...t, mounted: false, removed: false })
		this.items = next
		this.clock()
	}

	// One clock for every note, only while there are any; it stops while the stack is pointed at or the tab is hidden.
	private clock() {
		const count = getToasts().length
		if (count && !this.timer) {
			// ds-latency: the notes' own clock, off the input path; nothing waits on it.
			this.timer = setInterval(() => {
				if (this.expanded || document.hidden) return
				for (const t of getToasts()) {
					const l = this.left.get(t.id)
					const now = !l || l.shown !== t.shown ? t.duration : l.left - STEP
					if (now <= 0) {
						this.left.delete(t.id)
						toast.dismiss(t.id)
					} else this.left.set(t.id, { left: now, shown: t.shown })
				}
			}, STEP)
		}
		if (!count && this.timer) {
			clearInterval(this.timer)
			this.timer = undefined
			this.hovered = false
			this.focused = false
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.unsubscribe = subscribeToasts(this.sync)
		this.sync()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.unsubscribe?.()
		clearInterval(this.timer)
		this.timer = undefined
		cancelAnimationFrame(this.frame)
		for (const t of this.exits.values()) clearTimeout(t)
		this.exits.clear()
	}

	protected updated() {
		// A note that leaves with focus in it takes the focus away: the stack is no longer focused then.
		if (this.focused && !(this.renderRoot as ShadowRoot).activeElement) this.focused = false
		// Each note's own height, for spreading the stack out.
		const next: Record<number, number> = {}
		for (const li of this.renderRoot.querySelectorAll<HTMLElement>('.ds-sonner-toast')) {
			const box = li.firstElementChild?.shadowRoot?.querySelector<HTMLElement>('[data-ds="toast"]')
			next[Number(li.dataset.id)] = box?.offsetHeight ?? 0
		}
		if (Object.keys(next).length !== Object.keys(this.heights).length || Object.entries(next).some(([id, h]) => this.heights[Number(id)] !== h)) this.heights = next
		// A new note starts below, out of sight, for one frame, then rises; a leaving one goes once its exit has played.
		if (this.items.some((i) => !i.mounted && !i.removed)) {
			cancelAnimationFrame(this.frame)
			this.frame = requestAnimationFrame(() => {
				this.frame = requestAnimationFrame(() => {
					this.items = this.items.map((i) => (i.removed ? i : { ...i, mounted: true }))
				})
			})
		}
		for (const i of this.items) {
			if (!i.removed || this.exits.has(i.id)) continue
			// ds-latency: the note stays in the page until its exit has played.
			this.exits.set(i.id, setTimeout(() => {
				this.exits.delete(i.id)
				this.items = this.items.filter((x) => x.id !== i.id)
			}, 150))
		}
	}

	private onFocusOut = (event: FocusEvent) => {
		const next = event.relatedTarget as Node | null
		if (!next || !this.renderRoot.contains(next)) this.focused = false
	}

	render() {
		const showing = this.items.filter((i) => !i.removed).reverse()
		const h = this.heights
		const front = showing[0] ? h[showing[0].id] ?? 0 : 0
		const spread = showing.reduce((sum, i) => sum + (h[i.id] ?? 0), 0) + Math.max(0, showing.length - 1) * GAP
		const height = !showing.length ? 0 : this.expanded ? spread : front + (Math.min(showing.length, TOAST_MOST) - 1) * PEEK
		const style = (item: Item): Record<string, string | undefined> => {
			const i = showing.indexOf(item)
			if (item.removed || i < 0) return { transform: `${this.last.get(item.id) ?? 'translateY(0)'} translateY(50%)`, opacity: '0', zIndex: '0' }
			if (!item.mounted) return { transform: 'translateY(100%)', opacity: '0', zIndex: String(showing.length - i) }
			const y = this.expanded ? -(showing.slice(0, i).reduce((sum, x) => sum + (h[x.id] ?? 0), 0) + i * GAP) : -i * PEEK
			const transform = `translateY(${y}px) scale(${this.expanded ? 1 : 1 - i * 0.05})`
			this.last.set(item.id, transform)
			return { transform, opacity: i < TOAST_MOST ? '1' : '0', zIndex: String(showing.length - i), height: !this.expanded && i > 0 && front ? `${front}px` : undefined }
		}
		return html`<section data-ds="sonner" aria-label=${this.label} aria-live="polite"><ol class="ds-sonner" style=${styleMap({ height: `${height}px` })} @pointerenter=${() => { this.hovered = true }} @pointerleave=${() => { this.hovered = false }} @focusin=${() => { this.focused = true }} @focusout=${this.onFocusOut}>${repeat(
			this.items,
			(item) => item.id,
			(item) => html`<li class="ds-sonner-toast" data-id=${item.id} ?data-removed=${item.removed} style=${styleMap(style(item))}><spyglass-toast heading=${item.title} description=${item.description ?? ''} action-label=${item.action?.label ?? ''} dismissable @action=${() => { item.action?.onClick?.(); toast.dismiss(item.id) }} @dismiss=${() => toast.dismiss(item.id)}></spyglass-toast></li>`,
		)}</ol></section>`
	}
}

define('sonner', Sonner)
