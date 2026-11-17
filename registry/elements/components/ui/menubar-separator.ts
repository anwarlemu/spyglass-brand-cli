import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenubarSeparator.tsx as <spyglass-menubar-separator>: a hairline between groups of rows in a menubar menu.

/**
 * @summary A hairline between groups of rows.
 */
export class MenubarSeparator extends DsElement {
	static styles = [DsElement.styles, styles]
	render() {
		return html`<div data-ds="menubar-separator" role="separator" class="-mx-1 my-1 h-px shrink-0 bg-edge"></div>`
	}
}

define('menubar-separator', MenubarSeparator)
