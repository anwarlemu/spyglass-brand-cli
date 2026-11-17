import { html, LitElement, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// MenubarItem.tsx as <spyglass-menubar-item>: one row of a menubar menu: 32px (44px on phones), DM Sans soft gray, the
// small corner; the row under the pointer or focus takes the #262626 fill and White type. Put a 16px Lucide icon first;
// `shortcut` shows muted at the end. `item-role` menuitemradio or menuitemcheckbox with `checked` makes a checked row.
// `danger` is a destructive row's red. Choosing it fires `select` and closes the menu, unless `keep-open`.

/**
 * @summary One row of a menubar menu.
 * @slot - The row: an icon and the label.
 * @fires select - The row was chosen.
 */
export class MenubarItem extends DsElement {
	static styles = [DsElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static properties = { shortcut: {}, danger: { type: Boolean }, disabled: { type: Boolean, reflect: true }, keepOpen: { type: Boolean, attribute: 'keep-open' }, checked: { type: Boolean }, itemRole: { attribute: 'item-role' } }

	/** A key or keys, shown muted at the end. */
	shortcut?: string
	/** A destructive row (red). */
	danger = false
	disabled = false
	/** Choosing it leaves the menu open. */
	keepOpen = false
	/** Checked, for a radio or checkbox row. */
	checked = false
	/** menuitem, menuitemradio or menuitemcheckbox. */
	itemRole: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem'

	// The row under the pointer takes focus, so the pointer and the keys share one highlight.
	private onPointerMove = (event: PointerEvent) => {
		const el = event.currentTarget as HTMLElement
		if (!this.disabled && (this.renderRoot as ShadowRoot).activeElement !== el) el.focus({ preventScroll: true })
	}

	render() {
		const role = this.itemRole
		return html`<button data-ds="menubar-item" type="button" role=${role} aria-checked=${ifDefined(role === 'menuitem' ? undefined : String(this.checked))} ?disabled=${this.disabled} ?data-danger=${this.danger} class="flex h-control-sm w-full shrink-0 cursor-pointer items-center gap-3 rounded-ds-sm px-2 text-left type-ui text-fg-soft outline-none transition-[background-color,color] duration-150 ease-standard focus:bg-action-secondary focus:text-fg disabled:cursor-not-allowed disabled:text-fg-faint data-danger:text-fg-danger max-md:h-control-touch" @pointermove=${this.onPointerMove} @click=${() => this.emit('select')}><span class="flex min-w-0 flex-1 items-center gap-3"><slot></slot></span>${this.shortcut ? html`<span class="type-caption text-fg-muted">${this.shortcut}</span>` : nothing}${role !== 'menuitem' && this.checked ? icon(Check, 'check', { size: 16, strokeWidth: 1.5, class: 'shrink-0', attrs: { 'aria-hidden': 'true' } }) : nothing}</button>`
	}
}

define('menubar-item', MenubarItem)
