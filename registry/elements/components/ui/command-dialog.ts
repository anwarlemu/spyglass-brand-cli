import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define, tag, tagName } from '@/elements/lib/element'
import { html as staticHtml } from 'lit/static-html.js'
import '@/elements/components/ui/command'
import type { CommandGroup } from '@/elements/components/ui/command'
import styles from 'virtual:tw'

// CommandDialog.tsx as <spyglass-command-dialog>: the command menu in a window, 15vh from the top over a Black scrim.
// Cmd+K (Ctrl+K) opens and closes it from anywhere on the page (`shortcut`, "" for none), and so can the `open`
// attribute. It opens and closes at once, with no motion. Focus starts in the field; Escape or a press on the scrim
// closes it and focus returns to what opened it; running a row closes it (the row's `select` event reaches the page).
// The field is empty each time it opens. Row icons are page content with slot="icon-<id>", as on <spyglass-command>.

/**
 * @summary The command menu in a window opened with Cmd+K.
 * @slot icon-<id> - The icon of the row with that id.
 * @fires select - A row was run (detail: the row), from the inner command menu.
 * @fires open-change - It opened or closed (detail.value).
 */
export class CommandDialog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { groups: { type: Array }, label: {}, placeholder: {}, empty: {}, shortcut: {}, open: { type: Boolean, reflect: true } }

	groups: CommandGroup[] = []
	label = 'Commands'
	placeholder = 'Type a command or search'
	empty = 'No results.'
	/** The letter that opens it with Cmd or Ctrl; "" for no shortcut. */
	shortcut = 'k'
	open = false
	private returnTo: HTMLElement | null = null

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}
	private onKey = (event: KeyboardEvent) => {
		if (this.shortcut && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === this.shortcut) {
			event.preventDefault()
			this.setOpen(!this.open)
		}
	}
	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this.onKey)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('keydown', this.onKey)
	}

	protected async updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (!changed.has('open')) return
		const d = this.dialog
		if (!d) return
		if (this.open) {
			if (d.open) return
			let a = document.activeElement as Element | null
			while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
			this.returnTo = a instanceof HTMLElement ? a : null
			d.showModal()
			const command = d.querySelector(tagName('command')) as (HTMLElement & { updateComplete: Promise<unknown> }) | null
			await command?.updateComplete
			command?.focus()
		} else if (changed.get('open') !== undefined) {
			if (d.open) d.close()
			this.returnTo?.focus({ preventScroll: true })
			this.returnTo = null
		}
	}

	private onCancel = (event: Event) => {
		event.preventDefault()
		this.setOpen(false)
	}
	// A press on the scrim lands on the dialog element itself.
	private onDown = (event: MouseEvent) => {
		if (event.target === this.dialog) this.setOpen(false)
	}

	render() {
		const command = tag('command')
		// The page's row icons pass through to the inner command menu.
		const icons = [...this.children].map((c) => c.getAttribute('slot')).filter((s): s is string => !!s?.startsWith('icon-'))
		return html`<dialog data-ds="command-dialog" class="ds-cmd" aria-label=${this.label} @cancel=${this.onCancel} @mousedown=${this.onDown} @select=${() => this.setOpen(false)}>
			${this.open ? staticHtml`<${command} .groups=${this.groups} label=${this.label} placeholder=${this.placeholder} empty=${this.empty}>${icons.map((s) => html`<slot name=${s} slot=${s}></slot>`)}</${command}>` : nothing}
		</dialog>`
	}
}

define('command-dialog', CommandDialog)
