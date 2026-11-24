import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, uid } from '@/elements/lib/element'
import { chevron, navIconStyles } from '@/elements/components/site/nav-icon'
import styles from 'virtual:tw'

// SheetDisclosure.tsx as <spyglass-sheet-disclosure label>: the phone sheet's 48px Funnel Display row whose list (the
// default slot) opens to its height and fades in; the chevron turns over. `open` reflects.
export const sheetDisclosureStyles = styles
export const SHEET_LINK = 'flex min-h-12 items-center rounded-control px-3 -mx-3 type-heading-3 text-fg transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-space-xs))] hover:text-fg-soft active:text-fg-soft'

/**
 * @summary A disclosure row in the phone menu.
 * @slot - The list it opens.
 */
export class SheetDisclosure extends DsElement {
	static styles = [DsElement.styles, navIconStyles, styles]
	static properties = { label: {}, open: { type: Boolean, reflect: true } }
	label = ''
	open = false
	private panelId = uid('disclosure')

	render() {
		return html`<div data-ds="sheet-disclosure" data-open=${ifDefined(this.open ? '' : undefined)} class="flex flex-col"><button type="button" aria-expanded=${String(this.open)} aria-controls=${this.panelId} @click=${() => (this.open = !this.open)} class=${`${SHEET_LINK} w-[calc(100%+2*var(--ds-space-md))] cursor-pointer justify-between text-start`}>${this.label}${chevron(16, 'ds-sheet-chevron size-4 text-fg-soft')}</button><div id=${this.panelId} ?inert=${!this.open} data-open=${String(this.open)} class="ds-sheet-collapse"><div><div class="ds-sheet-collapse-body"><slot></slot></div></div></div></div>`
	}
}

define('sheet-disclosure', SheetDisclosure)
