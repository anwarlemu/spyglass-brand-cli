import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Resizable.tsx as <spyglass-resizable>: two panes and the hairline between them. The hairline is the handle (a 12px
// reach either side), White under the pointer, while dragged and when focused; `with-handle` adds a small grip.
// Drag it, or use the arrow keys (Shift for bigger steps, Home and End). The host is the split, so a class on the
// element lands on it. `value` (the first pane's share in percent) with the native `input` and `change` events.

/**
 * @summary Two panes and the hairline between them.
 * @slot first - The first pane (left, or top when vertical).
 * @slot second - The second pane.
 * @fires input - The split moved (read `value`).
 * @fires change - The split moved (read `value`).
 */
export class Resizable extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: { type: Number }, direction: { reflect: true }, min: { type: Number }, max: { type: Number }, label: {}, withHandle: { type: Boolean, attribute: 'with-handle' }, dragging: { state: true } }

	/** The first pane's share, in percent. */
	value = 50
	/** horizontal (side by side) or vertical. */
	direction: 'horizontal' | 'vertical' = 'horizontal'
	/** The first pane's smallest share, in percent. */
	min = 20
	/** The first pane's largest share, in percent. */
	max = 80
	/** The handle's name for assistive tech. */
	label = 'Resize panes'
	/** A small grip on the hairline. */
	withHandle = false
	private dragging = false
	private firstId = uid('pane')

	private get across() {
		return this.direction !== 'vertical'
	}
	private clamp(n: number) {
		return Math.min(this.max, Math.max(this.min, Math.round(n * 10) / 10))
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('dragging')) this.toggleAttribute('data-dragging', this.dragging)
	}

	private onDown(e: PointerEvent) {
		if (e.button !== 0) return
		;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		this.dragging = true
	}
	private onMove(e: PointerEvent) {
		if (!this.dragging) return
		const box = this.getBoundingClientRect()
		this.commit(this.clamp(this.across ? ((e.clientX - box.left) / box.width) * 100 : ((e.clientY - box.top) / box.height) * 100))
	}
	private onUp(e: PointerEvent) {
		this.dragging = false
		const el = e.currentTarget as HTMLElement
		if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
	}
	private onKey(e: KeyboardEvent) {
		const step = e.shiftKey ? 10 : 2
		const back = this.across ? 'ArrowLeft' : 'ArrowUp'
		const fwd = this.across ? 'ArrowRight' : 'ArrowDown'
		if (e.key === back) this.commit(this.clamp(this.value - step))
		else if (e.key === fwd) this.commit(this.clamp(this.value + step))
		else if (e.key === 'Home') this.commit(this.min)
		else if (e.key === 'End') this.commit(this.max)
		else return
		e.preventDefault()
	}

	render() {
		return html`<div id=${this.firstId} class="min-h-0 min-w-0 overflow-auto fade-xy" style=${styleMap({ flexBasis: `${this.value}%` })}><slot name="first"></slot></div>
			<div
				class="ds-resize-handle"
				data-direction=${this.across ? 'horizontal' : 'vertical'}
				data-dragging=${ifDefined(this.dragging ? 'true' : undefined)}
				role="separator"
				tabindex="0"
				aria-label=${this.label}
				aria-orientation=${this.across ? 'vertical' : 'horizontal'}
				aria-controls=${this.firstId}
				aria-valuenow=${this.value}
				aria-valuemin=${this.min}
				aria-valuemax=${this.max}
				@pointerdown=${this.onDown}
				@pointermove=${this.onMove}
				@pointerup=${this.onUp}
				@pointercancel=${this.onUp}
				@keydown=${this.onKey}
			>${this.withHandle ? html`<span class="ds-resize-grip" aria-hidden="true"></span>` : nothing}</div>
			<div class="min-h-0 min-w-0 flex-1 overflow-auto fade-xy"><slot name="second"></slot></div>`
	}
}

define('resizable', Resizable)
