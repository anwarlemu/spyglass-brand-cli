import { html, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// AspectRatio.tsx as <spyglass-aspect-ratio>: a box that keeps its shape as it grows (CSS aspect-ratio), for a creative
// or a frame that must not reflow: a 1:1 post, a 4:5 ad, a 16:9 deck slide. `ratio` is width over height; the content
// fills it. The host is the box (aspect-ratio.css), so a class on it (the corner, a ground, a width) lands as a class
// on <AspectRatio> does.

/**
 * @summary A box that keeps its shape as it grows.
 * @slot - What fills it (position it absolutely to fill the box).
 */
export class AspectRatio extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { ratio: { type: Number } }

	/** Width over height. */
	ratio = 1

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// As React's style on the root: the host is the root.
		if (changed.has('ratio')) this.style.aspectRatio = String(this.ratio)
	}

	render() {
		return html`<slot></slot>`
	}
}

define('aspect-ratio', AspectRatio)
