import { html, nothing, type PropertyValues } from 'lit'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Dialog.tsx as <spyglass-dialog>: a native modal window on the #262626 overlay surface in a neutral hairline with the
// brand corner, over a Black scrim. A Funnel Display heading, an optional line under it, a ghost close button, the body
// (a short form) and the `foot` slot for buttons. Focus stays inside; Escape, the close button and the scrim close it
// (`locked`: the scrim does nothing). It starts in the first field; with none, focus rests on the window. It comes in
// over 360ms (a fade and a scale from 0.96) and leaves at once. React's `open` with `onOpenChange` is the `open`
// attribute with an `open-change` event, and `close` fires as it closes; React's `title` is `heading` (title is HTML's
// tooltip attribute).

/**
 * @summary A modal dialog for a short form.
 * @slot - The body (a form).
 * @slot foot - Buttons at the end, under the body.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 * @fires close - It closed (Escape, the scrim, the close button, or open set to false).
 */
export class Dialog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, wide: { type: Boolean }, locked: { type: Boolean }, open: { type: Boolean, reflect: true } }

	/** The title, and the window's name (React's `title`). */
	heading = ''
	/** A line under the heading. */
	description?: string
	/** 640px instead of 480px. */
	wide = false
	/** The scrim does nothing (the window holds what can't be shown again). */
	locked = false
	/** Whether it is showing. */
	open = false

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}

	private show() {
		const d = this.dialog
		if (!d || d.open) return
		d.showModal()
		// The first field in the body (a native field, or an element that declares itself a field), else the window.
		const field = [...this.querySelectorAll<HTMLElement>('*')].find((el) => (el.matches('input:not([type="hidden"], [type="file"]), textarea, select') || (el.constructor as { dsField?: boolean }).dsField) && !(el as HTMLInputElement).disabled && !el.closest('[slot="foot"]'))
		const box = field?.shadowRoot?.querySelector('input, textarea, select, button') ?? field
		;(field && box && box.getBoundingClientRect().bottom <= d.getBoundingClientRect().bottom ? field : d).focus()
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) this.show()
		else if (this.dialog?.open) this.dialog.close()
	}

	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
		if (!open) this.emit('close')
	}

	// A click on the scrim lands on the dialog element itself.
	private backdrop(event: MouseEvent) {
		if (event.target === this.dialog && !this.locked) this.setOpen(false)
	}

	render() {
		return html`<dialog data-ds="dialog" class="ds-dialog" ?data-wide=${this.wide} tabindex="-1" aria-label=${this.heading} @close=${() => this.setOpen(false)} @click=${this.backdrop}>
			<div class="flex items-start justify-between gap-4 pt-5 pr-4 pl-6">
				<div class="flex min-w-0 flex-1 flex-col gap-2 pt-1.5">
					<h2 class="type-heading-3">${this.heading}</h2>
					${this.description ? html`<p class="type-ui text-fg-muted">${this.description}</p>` : nothing}
				</div>
				<spyglass-button variant="ghost" size="sm" icon aria-label="Close" @click=${() => this.setOpen(false)}>${icon(X, 'x', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</spyglass-button>
			</div>
			<div class="ds-dialog-body px-6 pt-5 pb-6"><slot></slot></div>
			${this.hasSlot('foot') ? html`<div class="flex flex-wrap justify-end gap-2 px-6 pb-6"><slot name="foot"></slot></div>` : nothing}
		</dialog>`
	}
}

define('dialog', Dialog)
