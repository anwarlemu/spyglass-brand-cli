import { html, LitElement } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenuItem.tsx as <spyglass-menu-item>: one row of a dropdown or context menu: 32px (44px on phones), DM Sans 14px, a
// 4px corner; the row under the pointer or focus takes a #262626 fill. `current` sets it in Medium; `danger` is the
// red for leaving or deleting. Put a 16px Lucide icon first, a shortcut or a check last. Choosing it fires `select`
// and closes the menu around it (any element with lib/menu's CloseOnSelect), unless `keep-open`. `role` and
// `aria-checked` on the element move to its button (role="menuitemradio" aria-checked="true" for a radio row), or set
// the `itemRole` and `checked` properties.

/**
 * @summary One row of a menu.
 * @slot - The row: an icon, the label, a count or a check.
 * @fires select - The row was chosen.
 */
export class MenuItem extends DsElement {
	static styles = [DsElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static properties = { href: {}, current: { type: Boolean }, danger: { type: Boolean }, disabled: { type: Boolean, reflect: true }, keepOpen: { type: Boolean, attribute: 'keep-open' }, itemRole: { attribute: false }, checked: { attribute: false } }
	// role and aria-checked are read here and moved to the button, so the row is named once (a menuitemradio, checked or
	// not) and not twice.
	static get observedAttributes() {
		return [...super.observedAttributes, 'role', 'aria-checked']
	}

	href?: string
	/** The current choice, in Medium. */
	current = false
	/** The red for leaving or deleting. */
	danger = false
	disabled = false
	/** Choosing it leaves the menu open. */
	keepOpen = false
	/** The button's role: menuitem, or menuitemradio and menuitemcheckbox (the `role` attribute). */
	itemRole = 'menuitem'
	/** A radio or checkbox row's state (the `aria-checked` attribute). */
	checked?: boolean

	attributeChangedCallback(name: string, old: string | null, value: string | null) {
		if (name === 'role' || name === 'aria-checked') {
			if (value === null) return
			if (name === 'role') this.itemRole = value
			else this.checked = value === 'true'
			this.removeAttribute(name)
			return
		}
		super.attributeChangedCallback(name, old, value)
	}

	private choose = () => {
		this.emit('select')
	}

	render() {
		const current = this.current ? 'true' : undefined
		const checked = this.checked === undefined ? undefined : String(this.checked)
		return this.href
			? html`<a data-ds="menu-item" href=${this.href} role=${this.itemRole} class="flex h-control-sm w-full shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 text-left type-ui text-fg outline-none transition-[background-color] duration-160 ease-standard hover:bg-ds-neutral-4 focus-visible:bg-ds-neutral-4 aria-[current=true]:font-medium disabled:cursor-not-allowed disabled:text-fg-faint disabled:hover:bg-transparent data-danger:text-fg-danger data-danger:hover:bg-surface-danger data-danger:focus-visible:bg-surface-danger max-md:h-auto max-md:min-h-control-touch" aria-current=${ifDefined(current)} aria-checked=${ifDefined(checked)} ?data-danger=${this.danger} @click=${this.choose}><slot></slot></a>`
			: html`<button data-ds="menu-item" type="button" role=${this.itemRole} class="flex h-control-sm w-full shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 text-left type-ui text-fg outline-none transition-[background-color] duration-160 ease-standard hover:bg-ds-neutral-4 focus-visible:bg-ds-neutral-4 aria-[current=true]:font-medium disabled:cursor-not-allowed disabled:text-fg-faint disabled:hover:bg-transparent data-danger:text-fg-danger data-danger:hover:bg-surface-danger data-danger:focus-visible:bg-surface-danger max-md:h-auto max-md:min-h-control-touch" aria-current=${ifDefined(current)} aria-checked=${ifDefined(checked)} ?data-danger=${this.danger} ?disabled=${this.disabled} @click=${this.choose}><slot></slot></button>`
	}
}

define('menu-item', MenuItem)
