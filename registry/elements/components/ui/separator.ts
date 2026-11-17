import { type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Separator.tsx as <spyglass-separator>: the hairline, 1px in the #262626 edge step, across or down. The host is the
// line (React's root div), so a class on the element (a margin) lands on it. Decorative by default; `semantic` makes it
// a separator for assistive tech.

/** @summary The hairline, across or down. */
export class Separator extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { orientation: { reflect: true }, semantic: { type: Boolean } }

	/** horizontal (across) or vertical (down). */
	orientation: 'horizontal' | 'vertical' = 'horizontal'
	/** A real separator for assistive tech, not only a line. */
	semantic = false

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.setAttribute('role', this.semantic ? 'separator' : 'none')
		if (this.semantic) this.setAttribute('aria-orientation', this.orientation)
		else this.removeAttribute('aria-orientation')
	}

	render() {
		return null
	}
}

define('separator', Separator)
