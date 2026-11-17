import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenubarLabel.tsx as <spyglass-menubar-label>: a group's name in a menubar menu, DM Sans Medium in capitals at 6%,
// muted.

/**
 * @summary A group's name in a menubar menu.
 * @slot - The name.
 */
export class MenubarLabel extends DsElement {
	static styles = [DsElement.styles, styles]
	render() {
		return html`<p data-ds="menubar-label" class="px-2 pt-2 pb-1 type-label text-fg-muted"><slot></slot></p>`
	}
}

define('menubar-label', MenubarLabel)
