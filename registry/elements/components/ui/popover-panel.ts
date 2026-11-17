import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { PopoverController, popoverStyles, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// PopoverPanel.tsx as <spyglass-popover-panel>: the floating panel every overlay draws, on its own, for overlays of
// your own: the card's #171717 fill with a hairline and the brand corner, no shadow, beside the element named by
// `anchor` (an id), flipped to the side with room and kept 8px inside the viewport, in the top layer. It grows from its
// anchor over 200ms and leaves in 150ms; opened or closed from the keyboard it does neither. `tip` is the tooltip's
// White fill. Set `open` (or call show() and hide()); a press outside, Escape and focus leaving close it. The library's
// own overlays draw the same panel inside their shadow roots (lib/popover.ts).

/**
 * @summary A floating panel beside an anchor.
 * @slot - The panel's content.
 * @fires open-change - It opened or closed (detail.value).
 */
export class PopoverPanel extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { anchor: {}, side: {}, align: {}, tip: { type: Boolean }, open: { type: Boolean, reflect: true }, sticky: { type: Boolean }, matchWidth: { type: Boolean, attribute: 'match-width' } }

	/** The id of the element it sits beside. */
	anchor = ''
	side: Side = 'bottom'
	align: Align = 'start'
	/** The tooltip's White fill, 2px over 150ms. */
	tip = false
	open = false
	/** A press outside or focus leaving keeps it open. */
	sticky = false
	/** At least as wide as its anchor. */
	matchWidth = false
	private pop = new PopoverController(this, {
		anchor: () => (this.anchor ? (this.getRootNode() as Document | ShadowRoot).getElementById(this.anchor) : null),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	show(keyboard = false) {
		return this.pop.show({ keyboard })
	}
	hide(refocus = false, keyboard = false) {
		this.pop.hide(refocus, keyboard)
	}
	protected willUpdate(changed: Map<PropertyKey, unknown>) {
		this.pop.configure({ side: this.side, align: this.align, sticky: this.sticky, matchWidth: this.matchWidth })
		if (changed.has('open') && this.open !== this.pop.open) {
			if (this.open) void this.pop.show()
			else this.pop.hide()
		}
	}
	protected updated() {
		if (this.open !== this.pop.open) {
			this.open = this.pop.open
			this.emit('open-change', { value: this.open })
		}
	}

	render() {
		return this.pop.rendered
			? html`<div data-ds="popover-panel" popover="manual" class="ds-pop" ?data-tip=${this.tip} data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style()} @focusout=${this.pop.onFocusOut}><slot></slot></div>`
			: nothing
	}
}

define('popover-panel', PopoverPanel)
