import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { CloseOnSelect, menuRows, onMenuRows } from '@/elements/lib/menu'
import { PopoverController, popoverStyles } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// ContextMenu.tsx as <spyglass-context-menu>: the dropdown menu's rows (<spyglass-menu-item>, <spyglass-menu-label>,
// <spyglass-menu-separator>, each with slot="menu") on the #262626 overlay panel, opened at the pointer: a right-click
// (or a long press on Android) on the default slot opens the `menu` slot where it landed, flipped and kept inside the
// viewport, in the top layer. From the keyboard, Shift+F10 or the context menu key opens it under the focused element,
// at once, on its first row. Arrows, Home and End move; Escape closes and returns focus; choosing a row closes it.
// `open` fires with what was clicked (detail.context: the closest [data-context] value), so one menu serves a list.

/**
 * @summary A menu opened at the pointer by a right-click or Shift+F10.
 * @slot - What the menu is for (a list whose rows carry data-context).
 * @slot menu - The rows: <spyglass-menu-item slot="menu">, labels and separators.
 * @fires open - It is opening (detail.context: the closest [data-context] value).
 */
export class ContextMenu extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, width: {} }

	/** The menu's name for assistive tech. */
	label = ''
	width?: string
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		gap: 0,
		anchor: () => null,
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	constructor() {
		super()
		// A chosen row closes the menu, focus back where it was.
		new CloseOnSelect(this, () => this.pop.hide(true))
	}

	private rows() {
		return menuRows(this, 'menu')
	}
	private context(event: Event) {
		return (event.composedPath()[0] as HTMLElement | null)?.closest?.<HTMLElement>('[data-context]')?.dataset.context
	}
	private onContextMenu = async (event: MouseEvent) => {
		event.preventDefault()
		this.emit('open', { context: this.context(event) })
		await this.pop.show({ at: { x: event.clientX, y: event.clientY } })
		this.renderRoot.querySelector<HTMLElement>('.ds-pop')?.focus({ preventScroll: true })
	}
	private onKey = async (event: KeyboardEvent) => {
		if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return
		event.preventDefault()
		const r = (event.composedPath()[0] as HTMLElement).getBoundingClientRect()
		this.emit('open', { context: this.context(event) })
		await this.pop.show({ keyboard: true, at: { x: r.left + 8, y: r.bottom } })
		await this.updateComplete
		this.rows()[0]?.focus()
	}
	private onMenuKey = (event: KeyboardEvent) => {
		onMenuRows(event, this.rows(), (refocus) => this.pop.hide(refocus))
	}

	render() {
		const panel = this.pop.rendered
			? html`<div data-ds="context-menu" popover="manual" class="ds-pop flex flex-col p-1 fade-y" role="menu" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width ?? '224px'}`)} @keydown=${this.onMenuKey} @focusout=${this.pop.onFocusOut}><slot name="menu"></slot></div>`
			: nothing
		return html`<div data-ds="context-menu" @contextmenu=${this.onContextMenu} @keydown=${this.onKey}><slot></slot></div>${panel}`
	}
}

define('context-menu', ContextMenu)
