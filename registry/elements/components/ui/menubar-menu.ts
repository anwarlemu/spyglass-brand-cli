import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import { onMenuRows } from '@/elements/lib/menu'
import { PopoverController, popoverStyles } from '@/elements/lib/popover'
import type { Menubar } from '@/elements/components/ui/menubar'
import styles from 'virtual:tw'

// MenubarMenu.tsx as <spyglass-menubar-menu>: one menu of a <spyglass-menubar>: its trigger and a panel of rows
// (<spyglass-menubar-item>, -label, -separator) under it, in the top layer. The open trigger takes the #262626 fill.

type Row = HTMLElement & { disabled?: boolean, keepOpen?: boolean }

/**
 * @summary One menu of a menubar.
 * @slot - The rows.
 */
export class MenubarMenu extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, width: {} }

	/** The trigger's text and the menu's name. */
	label = ''
	/** The panel's width (a CSS length). */
	width = '224px'
	private wasOpen = false
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		gap: 8,
		anchor: () => this.renderRoot.querySelector<HTMLElement>('button[role="menuitem"]'),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private get bar() {
		const b = this.closest(tagName('menubar')) as Menubar | null
		return b && typeof b.setActive === 'function' ? b : null
	}

	// A chosen row closes the menu, focus back on the trigger, unless the row keeps it open.
	private onSelect = (event: Event) => {
		const row = event.composedPath()[0] as Row
		if (row?.localName !== tagName('menubar-item')) return
		if (!row.keepOpen) this.pop.hide(true)
	}
	connectedCallback() {
		super.connectedCallback()
		this.addEventListener('select', this.onSelect)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.removeEventListener('select', this.onSelect)
	}

	private rows() {
		return [...this.querySelectorAll<Row>(tagName('menubar-item'))].filter((r) => !r.disabled)
	}
	/** Focuses the trigger (the bar's arrows). */
	focusTrigger() {
		this.renderRoot.querySelector<HTMLElement>('button[role="menuitem"]')?.focus()
	}
	/** Opens the menu, focusing its first or last row, or the panel. */
	async openMenu(focus: 'first' | 'last' | 'none' = 'first', keyboard = true) {
		await this.pop.show({ keyboard })
		await this.updateComplete
		if (focus === 'none') return this.renderRoot.querySelector<HTMLElement>('.ds-pop')?.focus({ preventScroll: true })
		const rows = this.rows()
		;(focus === 'last' ? rows.at(-1) : rows[0])?.focus()
	}

	private onClick = (event: MouseEvent) => {
		if (this.pop.open) return this.pop.hide(event.detail === 0, event.detail === 0)
		void this.openMenu(event.detail === 0 ? 'first' : 'none', event.detail === 0)
	}
	private onEnter = () => {
		const bar = this.bar
		if (bar?.active && bar.active !== this) void this.openMenu('none', true)
	}
	private onTriggerKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault()
			this.bar?.move(this, event.key === 'ArrowRight' ? 1 : -1, false)
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			void this.openMenu(event.key === 'ArrowDown' ? 'first' : 'last')
		}
	}
	// The rows' keys, after Left and Right, which open the next menu.
	private onPanelKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault()
			this.pop.hide(false, true)
			this.bar?.move(this, event.key === 'ArrowRight' ? 1 : -1, true)
			return
		}
		onMenuRows(event, this.rows(), (refocus) => this.pop.hide(refocus))
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const bar = this.bar
		if (!bar) return
		if (this.pop.open !== this.wasOpen) {
			this.wasOpen = this.pop.open
			if (this.pop.open) bar.setActive(this)
			else if (bar.active === this) bar.setActive(null)
		}
		if (bar.active !== this && this.pop.open) this.pop.hide(false, true)
	}

	render() {
		const bar = this.bar
		const tabbable = !bar || bar.current() === this
		const panel = this.pop.rendered
			? html`<div data-ds="menubar-menu" popover="manual" class="ds-pop flex flex-col p-1" role="menu" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width}`)} @keydown=${this.onPanelKey} @focusout=${this.pop.onFocusOut}><slot></slot></div>`
			: nothing
		return html`<button data-ds="menubar-menu" type="button" role="menuitem" aria-haspopup="menu" aria-expanded=${String(this.pop.open)} tabindex=${tabbable ? 0 : -1} class="inline-flex h-control-sm cursor-pointer items-center rounded-ds-sm px-3 type-ui-strong text-fg-soft -outline-offset-2 transition-[background-color,color] duration-150 ease-standard hover:not-aria-expanded:bg-action-ghost-hover hover:text-fg aria-expanded:bg-action-secondary aria-expanded:text-fg max-md:h-control-touch" @click=${this.onClick} @pointerenter=${this.onEnter} @focus=${() => this.bar?.setFocused(this)} @keydown=${this.onTriggerKey}>${this.label}</button>${panel}`
	}
}

define('menubar-menu', MenubarMenu)
