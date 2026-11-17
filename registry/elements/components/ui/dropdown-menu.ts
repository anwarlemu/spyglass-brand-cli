import { html, nothing, type PropertyValues } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, uid } from '@/elements/lib/element'
import { CloseOnSelect, menuRows } from '@/elements/lib/menu'
import styles from 'virtual:tw'

// DropdownMenu.tsx as <spyglass-dropdown-menu>: a button that opens a short list of actions or choices on the #171717
// overlay surface, a neutral hairline, the 8px corner, no shadow, 4px inside; rows are <spyglass-menu-item>, with
// <spyglass-menu-label> and <spyglass-menu-separator> between groups. It comes in over 200ms (a 4px drop and a touch
// of scale from the trigger's edge), leaves at once, and does not animate when opened from the keyboard. Arrows, Home,
// End, Escape, Tab and a click outside are handled. The trigger: a <button slot="trigger"> you style yourself (React's
// triggerClass), or any other content in the `trigger` slot, drawn as a small secondary button. `open` opens it;
// show() and close() are React's handle.

/**
 * @summary A button that opens a short list of choices or actions.
 * @slot - The rows: <spyglass-menu-item>, <spyglass-menu-label>, <spyglass-menu-separator>.
 * @slot trigger - A <button> to use as the trigger, or the default trigger's content.
 * @fires open-change - It opened or closed (detail.value).
 */
export class DropdownMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		label: {},
		up: { type: Boolean },
		// React's `align`; an `align` attribute is also HTML's old alignment hint, which the browser draws as text-align.
		placement: {},
		width: {},
		offset: {},
		triggerLabel: { attribute: 'trigger-label' },
		open: { type: Boolean, reflect: true },
		instant: { state: true },
	}

	/** The menu's name for assistive tech. */
	label = ''
	/** Opens upward. */
	up = false
	/** The panel's edge: start, or end to line up with the trigger's end (React's `align`). */
	placement: 'start' | 'end' = 'start'
	width = '240px'
	/** Moves the panel in from its edge. */
	offset = '0px'
	/** The default trigger's name, when its content has none. */
	triggerLabel?: string
	open = false
	private instant = false
	private panelId = uid('menu')
	private pending: 'first' | 'last' | 'none' | null = null

	/** A <button slot="trigger"> the page drew, or the default trigger in the shadow root. */
	constructor() {
		super()
		// A chosen row closes the menu and returns focus to the trigger.
		new CloseOnSelect(this, () => this.close(true))
	}

	private get trigger(): HTMLElement | null {
		const own = this.querySelector<HTMLElement>(':scope > button[slot="trigger"]')
		return own ?? this.renderRoot.querySelector<HTMLElement>('button[data-trigger]')
	}
	private items() {
		return menuRows(this)
	}

	show(focus: 'first' | 'last' | 'none' = 'first') {
		this.pending = focus
		this.instant = focus !== 'none'
		this.setOpen(true)
		// Already open (an arrow on the open menu's button), it still renders, and the row asked for takes focus.
		this.requestUpdate()
	}
	close(refocus = false) {
		this.setOpen(false)
		if (refocus) this.trigger?.focus()
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}
	private toggle = () => {
		if (this.open) this.close()
		else this.show('none')
	}
	private onTriggerKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			this.show(event.key === 'ArrowDown' ? 'first' : 'last')
		} else if (event.key === 'Escape' && this.open) {
			event.preventDefault()
			this.close(true)
		}
	}
	private onMenuKey = (event: KeyboardEvent) => {
		const list = this.items()
		const at = list.findIndex((i) => i.matches(':focus-within'))
		if (event.key === 'Escape') {
			event.preventDefault()
			this.close(true)
		} else if (event.key === 'Tab') {
			// React takes the panel out of the page before the browser moves focus, so Tab from a row lands on the
			// trigger; here the rows stay in the page (unslotted), so the element puts focus there itself.
			if (!event.shiftKey) {
				event.preventDefault()
				this.close(true)
			} else this.close()
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			const step = event.key === 'ArrowDown' ? 1 : -1
			list[(at + step + list.length) % list.length]?.focus()
		} else if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault()
			;(event.key === 'Home' ? list[0] : list.at(-1))?.focus()
		}
	}
	private outside = (event: PointerEvent) => {
		if (this.open && !event.composedPath().includes(this)) this.close()
	}

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('pointerdown', this.outside)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('pointerdown', this.outside)
		this.wire(null)
	}

	// The page's own trigger button gets the menu button's attributes and handlers.
	private wired: HTMLElement | null = null
	private wire(button: HTMLElement | null) {
		if (this.wired && this.wired !== button) {
			this.wired.removeEventListener('click', this.toggle)
			this.wired.removeEventListener('keydown', this.onTriggerKey)
		}
		if (button && this.wired !== button) {
			button.addEventListener('click', this.toggle)
			button.addEventListener('keydown', this.onTriggerKey)
			button.setAttribute('aria-haspopup', 'menu')
		}
		this.wired = button
		if (button) {
			button.setAttribute('aria-expanded', String(this.open))
			if (this.triggerLabel) button.setAttribute('aria-label', this.triggerLabel)
		}
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		this.wire(this.querySelector<HTMLElement>(':scope > button[slot="trigger"]'))
		if (changed.has('open') && !this.open) this.instant = false
		const focus = this.pending
		this.pending = null
		if (!this.open || !focus) return
		// Opened at the fold it would land out of sight, and the button would seem to do nothing.
		this.renderRoot.querySelector('[role="menu"]')?.scrollIntoView({ block: 'nearest' })
		if (focus === 'none') return
		const list = this.items()
		;(focus === 'last' ? list.at(-1) : list[0])?.focus()
	}

	render() {
		const own = !!this.querySelector(':scope > button[slot="trigger"]')
		const panel = this.open
			? html`<div id=${this.panelId} class="ds-menu" ?data-up=${this.up} data-align=${this.placement === 'end' ? 'end' : 'start'} ?data-instant=${this.instant} style=${styleMap({ width: this.width, [this.placement === 'end' ? 'right' : 'left']: this.offset, [this.up ? 'bottom' : 'top']: 'calc(100% + 4px)' })} role="menu" aria-label=${this.label} @keydown=${this.onMenuKey}><slot></slot></div>`
			: nothing
		const trigger = own
			? html`<slot name="trigger"></slot>`
			: html`<button data-trigger type="button" class="inline-flex h-control-sm cursor-pointer items-center gap-1.5 rounded-control bg-action-secondary px-3 type-ui-strong text-action-secondary-fg transition-[background-color] duration-150 ease-standard hover:bg-action-secondary-hover aria-expanded:bg-action-secondary-hover max-md:h-control-touch" aria-haspopup="menu" aria-expanded=${String(this.open)} aria-label=${this.triggerLabel ?? nothing} @click=${this.toggle} @keydown=${this.onTriggerKey}><slot name="trigger"></slot></button>`
		return html`${trigger}${panel}`
	}
}

define('dropdown-menu', DropdownMenu)
