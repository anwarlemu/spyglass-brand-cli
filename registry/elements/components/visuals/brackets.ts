import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Brackets.tsx as <spyglass-brackets>: four hairline corner brackets around the positioned box it sits in, `offset`
// outside its edges (4px), arms `arm` long (8px). Decoration: aria-hidden.

const ARM = 'absolute size-[var(--b-arm,var(--ds-space-sm))] border-0 border-solid border-fg'

/**
 * @summary Corner brackets around a target, like a viewfinder.
 */
export class Brackets extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { offset: { type: Number }, arm: { type: Number } }
	/** How far outside the target's edges, in px. */
	offset?: number
	/** Each arm's length, in px. */
	arm?: number

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		const style = [this.offset !== undefined ? `--b-off: ${this.offset}px` : '', this.arm !== undefined ? `--b-arm: ${this.arm}px` : ''].filter(Boolean).join('; ')
		return html`<span data-ds="brackets" data-brackets="" style=${style} class="pointer-events-none absolute inset-[calc(-1*var(--b-off,var(--ds-space-xs)))] z-2 origin-center"><i class=${`${ARM} top-0 left-0 border-t border-l`}></i><i class=${`${ARM} top-0 right-0 border-t border-r`}></i><i class=${`${ARM} bottom-0 left-0 border-b border-l`}></i><i class=${`${ARM} right-0 bottom-0 border-r border-b`}></i></span>`
	}
}

define('brackets', Brackets)
