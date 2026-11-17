import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Spinner.tsx as <spyglass-spinner>: a quarter arc in the color around it turning on a #363636 ring, one turn every
// 750ms at a constant speed; with reduced motion it breathes instead. sm 16px, md 20px. A status with `label`.

const SIZES = { sm: 'size-icon-sm', md: 'size-icon-md' } as const

/** @summary Work in progress with no known end. */
export class Spinner extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('svg') as unknown as HTMLElement)
	static properties = { size: { reflect: true }, label: {} }

	/** sm (16px) or md (20px). */
	size: keyof typeof SIZES = 'sm'
	/** What is loading, for assistive tech. */
	label = 'Loading'

	render() {
		return html`<svg data-ds="spinner" role="status" aria-label=${this.label} viewBox="0 0 24 24" fill="none" class=${`ds-spinner shrink-0 ${SIZES[this.size] ?? SIZES.sm}`}><circle cx="12" cy="12" r="9" stroke-width="2.5" class="stroke-edge-strong"></circle><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg>`
	}
}

define('spinner', Spinner)
