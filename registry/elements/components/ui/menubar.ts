import { html, type PropertyValues } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Menubar.tsx as <spyglass-menubar>: menu triggers in a row: a Black strip in a hairline with the brand corner, 32px
// triggers in DM Sans Medium, each opening a panel of rows in the card's #262626 fill (<spyglass-menubar-menu> with
// <spyglass-menubar-item>, -label and -separator). One trigger is in the tab order; Left and Right move along the row,
// Down, Enter or Space open, and with a menu open Left and Right open the next one. While one is open, pointing at
// another trigger switches to it at once.

/** What a <spyglass-menubar-menu> offers its bar. */
export interface MenubarEntry extends HTMLElement { focusTrigger(): void, openMenu(focus?: 'first' | 'last' | 'none'): Promise<void> }

/**
 * @summary Menu triggers in a row.
 * @slot - The menus: <spyglass-menubar-menu>.
 */
export class Menubar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {} }

	/** The bar's name for assistive tech. */
	label = ''
	/** The open menu, if any. */
	active: Element | null = null
	/** The trigger in the tab order (the first until another takes focus). */
	focused: Element | null = null

	/** The menus, in the order they sit. */
	entries() {
		return [...this.querySelectorAll<MenubarEntry>(tagName('menubar-menu'))]
	}
	/** The trigger in the tab order. */
	current() {
		return this.focused ?? this.entries()[0] ?? null
	}
	private refresh() {
		for (const m of this.entries()) (m as unknown as { requestUpdate(): void }).requestUpdate?.()
	}
	setActive(menu: Element | null) {
		if (this.active === menu) return
		this.active = menu
		this.refresh()
	}
	setFocused(menu: Element) {
		if (this.focused === menu) return
		this.focused = menu
		this.refresh()
	}
	move(from: Element, step: number, open: boolean) {
		const list = this.entries()
		const at = list.indexOf(from as MenubarEntry)
		const next = list[(at + step + list.length) % list.length]
		if (!next) return
		this.setFocused(next)
		next.focusTrigger()
		if (open) void next.openMenu('first')
	}

	protected firstUpdated(changed: PropertyValues<this>) {
		super.firstUpdated(changed)
		// Menus that drew before the bar was defined learn which trigger is in the tab order.
		this.refresh()
	}

	render() {
		return html`<div data-ds="menubar" role="menubar" aria-label=${this.label} class="inline-flex items-center gap-1 rounded-control border border-edge bg-surface p-1"><slot></slot></div>`
	}
}

define('menubar', Menubar)
