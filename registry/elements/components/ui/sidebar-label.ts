import { html } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SidebarLabel.tsx as <spyglass-sidebar-label>: a group's name in the sidebar, DM Sans Medium in capitals at 6%,
// muted, 16px over it. Folded to icons, a hairline takes its place and the name stays for assistive tech.

/**
 * @summary A group's name in the sidebar.
 * @slot - The name.
 */
export class SidebarLabel extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		const collapsed = !!(this.closest(tagName('sidebar')) as (Element & { collapsed?: boolean }) | null)?.collapsed
		// The first in the sidebar's body (the head and foot slots' content aside), as :first-child is in React's.
		let prev = this.previousElementSibling
		while (prev?.hasAttribute('slot')) prev = prev.previousElementSibling
		const first = !prev
		return html`<div data-ds="sidebar-label" class=${first ? 'pt-1 pb-2' : 'pt-4 pb-2'}>${collapsed ? html`<div class="mx-2 border-t border-edge" aria-hidden="true"></div>` : ''}<p class=${collapsed ? 'sr-only' : 'px-3 type-label text-fg-muted'}><slot></slot></p></div>`
	}
}

define('sidebar-label', SidebarLabel)
