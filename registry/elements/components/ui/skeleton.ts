import { html, nothing, type PropertyValues } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { imageFit, type ImageFit } from '@/lib/image'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Skeleton.tsx as <spyglass-skeleton>: a placeholder in the shape of what is loading, a #1A1A1A block with the brand
// corner (or a circle) that breathes between full and half opacity, never a shimmer; still with reduced motion. The
// host is the block, so size classes on the element (h-4 w-48) land on it. Hidden from assistive tech. With `src` (and
// `alt`, `fit`, `position`) it shows the picture that arrived, still, in the same shape; without, the host carries
// data-ds-placeholder.

/** @summary A placeholder block in the shape of what is loading. */
export class Skeleton extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { circle: { type: Boolean, reflect: true }, src: { reflect: true }, alt: {}, fit: {}, position: {} }

	/** A circle (an avatar or a logo) in place of the brand corner. */
	circle = false
	/** The picture that arrived. */
	src?: string
	/** What it shows. */
	alt = ''
	/** How it fills the block (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored (object-position). */
	position?: string

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (this.src) this.removeAttribute('aria-hidden')
		else this.setAttribute('aria-hidden', 'true')
		this.toggleAttribute('data-ds-placeholder', !this.src)
	}

	render() {
		return this.src ? html`<img src=${this.src} alt=${this.alt} decoding="async" class="block size-full object-cover" style=${styleMap(imageFit(this) ?? {})}>` : nothing
	}
}

define('skeleton', Skeleton)
