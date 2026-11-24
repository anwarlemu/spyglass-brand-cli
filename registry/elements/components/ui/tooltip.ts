import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { boxOf, PopoverController, popoverStyles, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Tooltip.tsx as <spyglass-tooltip>: a control's name, for icon buttons: a White fill with Black caption text and the
// small corner, 4px from its trigger. Under the pointer it waits 300ms, then fades and moves 2px in over 160ms; on
// keyboard focus it shows at once, without motion; a press, Escape or leaving hides it. Right after another tooltip it
// shows at once. It never shows on touch (a tap presses the button). Wrap one focusable trigger; it gets
// aria-description (an id cannot reach into the element's shadow root, as React's aria-describedby does).

// When the last tooltip closed: one opened right after it shows at once, so moving along a toolbar reads fast.
let lastClosed = 0
const WAIT = 300

/**
 * @summary A control's name, shown under it after a short wait.
 * @slot - One focusable trigger.
 */
export class Tooltip extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { text: {}, side: {}, align: {} }

	/** The control's name. */
	text = ''
	side: Side = 'bottom'
	align: Align = 'center'
	private timer?: ReturnType<typeof setTimeout>
	private wasOpen = false
	private pop = new PopoverController(this, {
		gap: 4,
		sticky: true,
		anchor: () => boxOf(this.firstElementChild),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private enter = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse' || this.pop.open) return
		clearTimeout(this.timer)
		if (Date.now() - lastClosed < WAIT) return void this.pop.show({ keyboard: true })
		// ds-latency: the wait is the point; a pass of the pointer shows nothing.
		this.timer = setTimeout(() => void this.pop.show(), WAIT)
	}
	private leave = () => {
		clearTimeout(this.timer)
		this.pop.hide()
	}
	private onFocusIn = (event: FocusEvent) => {
		if ((event.composedPath()[0] as Element).matches(':focus-visible')) void this.pop.show({ keyboard: true })
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
	}
	protected willUpdate() {
		this.pop.configure({ side: this.side, align: this.align })
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (this.wasOpen && !this.pop.open) lastClosed = Date.now()
		this.wasOpen = this.pop.open
		this.firstElementChild?.setAttribute('aria-description', this.text)
	}

	render() {
		const panel = this.pop.rendered
			? html`<div data-ds="tooltip" popover="manual" class="ds-pop" data-tip role="tooltip" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style()}>${this.text}</div>`
			: nothing
		return html`<span data-ds="tooltip" class="inline-flex" @pointerenter=${this.enter} @pointerleave=${this.leave} @pointerdown=${this.leave} @focusin=${this.onFocusIn} @focusout=${this.leave}><slot></slot></span>${panel}`
	}
}

define('tooltip', Tooltip)
