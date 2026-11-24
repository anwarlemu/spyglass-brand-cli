import { html } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// NavigationMenu.tsx as <spyglass-navigation-menu>: a site's top navigation, a row of triggers and links in DM Sans
// Medium (<spyglass-navigation-menu-item>), each trigger opening a panel of links in the card's #262626 fill. Under a
// pointer a panel opens after a short wait and closes a moment after the pointer leaves both; while one is open,
// pointing at another trigger switches at once. A click toggles it; Enter, Space or Down opens it at once with focus on
// its first link; Left and Right move along the row; Escape closes it.

/** What a <spyglass-navigation-menu-item> offers its menu. */
export interface NavigationMenuEntry extends HTMLElement { focusTrigger(): void }

/**
 * @summary A site's top navigation, with panels of links.
 * @slot - The entries: <spyglass-navigation-menu-item>.
 */
export class NavigationMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {} }

	/** The navigation's name for assistive tech. */
	label = 'Main'
	/** The open entry, if any. */
	active: Element | null = null

	entries() {
		return [...this.querySelectorAll<NavigationMenuEntry>(tagName('navigation-menu-item'))]
	}
	setActive(item: Element | null) {
		if (this.active === item) return
		this.active = item
		for (const e of this.entries()) (e as unknown as { requestUpdate(): void }).requestUpdate?.()
	}
	move(from: Element, step: number) {
		const list = this.entries()
		const at = list.indexOf(from as NavigationMenuEntry)
		list[(at + step + list.length) % list.length]?.focusTrigger()
	}

	render() {
		return html`<nav data-ds="navigation-menu" aria-label=${this.label}><ul class="flex flex-wrap items-center gap-1"><slot></slot></ul></nav>`
	}
}

define('navigation-menu', NavigationMenu)
