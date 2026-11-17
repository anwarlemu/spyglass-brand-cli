import { html, type LitElement, type PropertyValues } from 'lit'
import { DsElement, define, tag, uid } from '@/elements/lib/element'
import { html as staticHtml } from 'lit/static-html.js'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// The button's md shape with the danger fill (the seed button has no danger variant), as in AlertDialog.tsx.
const DANGER_BUTTON = 'inline-flex h-control-md shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control px-4 whitespace-nowrap select-none type-ui-strong bg-action-danger text-ds-neutral-15 transition-[background-color,scale] duration-150 ease-out hover:bg-action-danger-hover active:scale-97 motion-reduce:active:scale-100'

// AlertDialog.tsx as <spyglass-alert-dialog>: a question that needs an answer before anything else, on the #171717
// overlay surface in a neutral hairline with the brand corner, over a Black scrim. A Funnel Display heading, one line
// saying what happens, then Cancel (secondary) and the action: the red fill for what removes something (`danger`, the
// default), the White primary with danger="false". Focus starts on Cancel; the scrim does nothing, so only a choice
// closes it; Escape cancels and focus returns to what opened it. It comes in over 300ms (a fade and a scale from 0.96)
// and leaves at once. React's `open` with `onOpenChange` is the `open` attribute with `open-change`; React's `title`
// is `heading` (title is HTML's tooltip attribute); `cancel` is the Cancel button's label, and the `cancel` event fires
// when it is chosen (or on Escape).

/**
 * @summary A question that needs an answer before anything else.
 * @slot - More about what happens, under the line.
 * @fires confirm - The action was chosen.
 * @fires cancel - Cancel was chosen, or Escape pressed.
 * @fires open-change - It opened or closed (detail.value).
 */
export class AlertDialog extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, action: {}, cancel: {}, danger: { converter: { fromAttribute: (v: string | null) => v !== 'false' } }, open: { type: Boolean, reflect: true } }

	/** The question (React's `title`). */
	heading = ''
	/** One line saying what happens. */
	description = ''
	/** The action button's label. */
	action = ''
	/** The Cancel button's label. */
	cancel = 'Cancel'
	/** The red fill for the action; danger="false" draws the White primary. */
	danger = true
	open = false
	private dialogId = uid('alert')
	private returnTo: HTMLElement | null = null

	private get dialog() {
		return this.renderRoot.querySelector('dialog')
	}
	private async show() {
		const d = this.dialog
		if (!d || d.open) return
		let a = document.activeElement as Element | null
		while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
		this.returnTo = a instanceof HTMLElement ? a : null
		d.showModal()
		const cancel = d.querySelector<LitElement>('[data-cancel]')
		await cancel?.updateComplete
		;(cancel?.shadowRoot?.querySelector('button') ?? cancel)?.focus()
	}
	private close() {
		if (this.dialog?.open) this.dialog.close()
		this.returnTo?.focus({ preventScroll: true })
		this.returnTo = null
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) void this.show()
		else if (changed.get('open') !== undefined) this.close()
	}
	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}
	private onCancel = (event: Event) => {
		event.preventDefault()
		this.emit('cancel')
		this.setOpen(false)
	}
	private choose(confirmed: boolean) {
		this.emit(confirmed ? 'confirm' : 'cancel')
		this.setOpen(false)
	}

	render() {
		const button = tag('button')
		return html`<dialog data-ds="alert-dialog" class="ds-alert" role="alertdialog" aria-labelledby=${`${this.dialogId}-title`} aria-describedby=${`${this.dialogId}-text`} @cancel=${this.onCancel}>
			<h2 id=${`${this.dialogId}-title`} class="type-heading-3">${this.heading}</h2>
			<p id=${`${this.dialogId}-text`} class="mt-3 type-ui text-fg-muted">${this.description}</p>
			<slot></slot>
			<div class="mt-6 flex flex-wrap justify-end gap-2">
				${staticHtml`<${button} data-cancel variant="secondary" @click=${() => this.choose(false)}>${this.cancel}</${button}>`}${this.danger
					? html`<button type="button" class=${DANGER_BUTTON} @click=${() => this.choose(true)}>${this.action}</button>`
					: staticHtml`<${button} @click=${() => this.choose(true)}>${this.action}</${button}>`}
			</div>
		</dialog>`
	}
}

define('alert-dialog', AlertDialog)
