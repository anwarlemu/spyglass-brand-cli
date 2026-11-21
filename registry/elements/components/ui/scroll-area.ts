import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ScrollArea.tsx as <spyglass-scroll-area>: a region that scrolls on its own with thin scrollbars (a #363636 thumb on a
// clear track), native scrolling, overscroll kept inside. The host is the scrolling box, so size classes on the
// element land on it. With a `label` it is a named region a keyboard can reach.

/**
 * @summary A region that scrolls on its own, with thin scrollbars.
 * @slot - The content.
 */
export class ScrollArea extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, maxHeight: { attribute: 'max-height' }, axis: { reflect: true } }

	/** Names the region and lets a keyboard reach it. */
	label?: string
	/** A cap on its height, such as 288px. */
	maxHeight?: string
	/** y (down), x (across) or both. */
	axis: 'y' | 'x' | 'both' = 'y'

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('maxHeight')) this.style.maxHeight = this.maxHeight ?? ''
		// The host is the scroll box, so it takes the scroll fade by attribute (fade-y, fade-x or fade-xy in React).
		if (changed.has('axis')) this.dataset.fade = this.axis === 'both' ? 'xy' : this.axis === 'x' ? 'x' : 'y'
		if (changed.has('label')) {
			if (this.label) {
				this.setAttribute('role', 'region')
				this.setAttribute('aria-label', this.label)
				this.tabIndex = 0
			} else {
				for (const a of ['role', 'aria-label', 'tabindex']) this.removeAttribute(a)
			}
		}
	}

	render() {
		return html`<slot></slot>`
	}
}

define('scroll-area', ScrollArea)
