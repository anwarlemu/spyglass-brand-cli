import { type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Skeleton.tsx as <spyglass-skeleton>: a placeholder in the shape of what is loading, a #1A1A1A block with the brand
// corner (or a circle) that breathes between full and half opacity, never a shimmer; still with reduced motion. The
// host is the block, so size classes on the element (h-4 w-48) land on it. Hidden from assistive tech.

/** @summary A placeholder block in the shape of what is loading. */
export class Skeleton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { circle: { type: Boolean, reflect: true } }

	/** A circle (an avatar or a logo) in place of the brand corner. */
	circle = false

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		return null
	}
}

define('skeleton', Skeleton)
