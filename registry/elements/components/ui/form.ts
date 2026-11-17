import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Form.tsx as <spyglass-form>: fields stacked 24px apart, each a <spyglass-field> with its label over it and its
// description or error under it; a `failure` from the server in a dark red box with the brand corner above the
// actions; the actions (slot="actions") at the end, the main one last. It never validates as the first value is typed:
// the page shows an error once its field is left or the form is sent, and on a send with errors focus moves to the
// first field that is wrong: marked `invalid` (or aria-invalid="true"), or failing its own validity. Like a novalidate
// form it never blocks a send or shows the browser's bubbles; checkValidity() and reportValidity() check its fields.
//
// A <form> in a shadow root does not own the fields the page puts in its slots, so the element is the form's behavior
// itself: a press on a submit button in it (a <button type="submit"> or an element with type="submit"), or Enter in a
// one-line field, fires `submit`; a press on a reset button fires `reset`. The host is the form's box (React's root
// <form>), so a class on the element lands on it.

type Validatable = HTMLElement & { checkValidity(): boolean, reportValidity(): boolean, validity: ValidityState, willValidate: boolean }

const TEXT_INPUT = /^(text|email|password|search|tel|url|number|date|datetime-local|month|time|week)$/

/**
 * @summary A form: fields, a failure, the actions.
 * @slot - The fields.
 * @slot actions - The buttons at the end, the main one last.
 * @fires submit - It was sent (a submit button or Enter in a field).
 * @fires reset - A reset button was pressed.
 */
export class Form extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { failure: {}, label: {} }

	/** A failure from the server, shown above the actions. */
	failure?: string
	/** The form's name for assistive tech. */
	label?: string

	constructor() {
		super()
		this.addEventListener('click', this.onClick)
		this.addEventListener('keydown', this.onKey)
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The host is the form, for assistive tech too.
		this.setAttribute('role', 'form')
		if (this.label) this.setAttribute('aria-label', this.label)
		else this.removeAttribute('aria-label')
	}

	/**
	 * What a control does when pressed: submit, reset or neither. An element's `type` is its attribute or its property
	 * (React sets it as a property); a page's own <button> submits unless its type says otherwise, as in a native form;
	 * a button inside an element's shadow root counts only for the type written on it.
	 */
	private typeOf(n: HTMLElement): string | null {
		if (n.localName.includes('-')) {
			const prop = (n as HTMLElement & { type?: unknown }).type
			return n.getAttribute('type') ?? (typeof prop === 'string' ? prop : null)
		}
		if (n.localName !== 'button') return null
		return n.getAttribute('type') ?? (n.getRootNode() === this.getRootNode() ? 'submit' : null)
	}
	/** The control in the event's path that submits or resets, if any. */
	private kind(event: Event): 'submit' | 'reset' | null {
		for (const n of event.composedPath()) {
			if (n === this) break
			if (!(n instanceof HTMLElement)) continue
			const type = this.typeOf(n)
			if (type === 'submit' || type === 'reset') return n.matches(':disabled, [disabled]') ? null : type
		}
		return null
	}
	private onClick = (event: MouseEvent) => {
		const kind = this.kind(event)
		if (kind === 'submit') this.send()
		else if (kind === 'reset') this.emit('reset')
	}
	// Enter in a one-line field sends it, as in a native form, unless its submit button is disabled.
	private onKey = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return
		const target = event.composedPath()[0]
		if (!(target instanceof HTMLInputElement) || !TEXT_INPUT.test(target.type)) return
		const button = [...this.querySelectorAll<HTMLElement>('*')].find((n) => (n.localName === 'button' || n.localName.includes('-')) && this.typeOf(n) === 'submit')
		if (button?.matches(':disabled, [disabled]')) return
		event.preventDefault()
		this.send()
	}

	/** Sends it, as a submit button does. */
	async send() {
		this.emit('submit')
		// Focus moves after the next render, once the errors the submit raised are drawn.
		await new Promise((resolve) => setTimeout(resolve))
		this.firstWrong()?.focus()
	}

	/** Its fields: the controls and form-associated elements in it that take part in validation. */
	get fields(): Validatable[] {
		return [...this.querySelectorAll<HTMLElement>('*')].filter((el): el is Validatable => typeof (el as Partial<Validatable>).checkValidity === 'function' && (el as Validatable).willValidate === true)
	}
	private firstWrong() {
		const fields = new Set<HTMLElement>(this.fields)
		return [...this.querySelectorAll<HTMLElement>('*')].find((el) => el.matches('[invalid], [aria-invalid="true"]') || (fields.has(el) && !(el as Validatable).validity.valid)) ?? null
	}
	/** Whether every field is valid (no events, no messages). */
	checkValidity() {
		return this.fields.every((f) => f.validity.valid)
	}
	/** Like checkValidity, and the first invalid field shows the browser's message and takes focus. */
	reportValidity() {
		const bad = this.fields.find((f) => !f.validity.valid)
		return bad ? bad.reportValidity() : true
	}

	render() {
		return html`<slot></slot>
			${this.failure
				? html`<p class="rounded-control bg-surface-danger px-4 py-3 type-ui text-fg-danger" role="alert">${this.failure}</p>`
				: nothing}
			${this.hasSlot('actions') ? html`<div class="flex flex-wrap items-center justify-end gap-2"><slot name="actions"></slot></div>` : nothing}`
	}
}

define('form', Form)
