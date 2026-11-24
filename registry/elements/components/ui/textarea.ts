import { html, LitElement, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Textarea.tsx as <spyglass-textarea>: several lines of text, drawn as the input is: a #666666 hairline on Black that
// turns White on focus, DM Sans at 14px (16px on phones), a #A3A3A3 placeholder and the brand corner. It grows by hand
// downward only; `invalid` turns the hairline red. Form-associated (its `name` and `value` go with its form); the value
// is `value` with the native `input` and `change` events. aria-label and aria-description pass to the inner textarea.

/**
 * @summary Several lines of text.
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 */
export class Textarea extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('textarea'))
	static properties = {
		value: {},
		rows: { type: Number },
		name: {},
		placeholder: {},
		maxlength: { type: Number },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	value = ''
	/** Visible lines before it scrolls. */
	rows = 4
	name?: string
	placeholder?: string
	maxlength?: number
	disabled = false
	readonly = false
	required = false
	/** A red hairline (with the message under it). */
	invalid = false
	/** The name for assistive tech, passed to the inner textarea. */
	label?: string
	/** The description or error, passed to the inner textarea (a field sets it). */
	description?: string

	connectedCallback() {
		super.connectedCallback()
		if (!this.value && this.getAttribute('value')) this.value = this.getAttribute('value')!
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	// Setting the value as a property puts the caret (and the scroll) at the end; a native textarea starts at the top.
	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		const area = this.validityControl()
		if (!area) return
		area.setSelectionRange(0, 0)
		area.scrollTop = 0
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLTextAreaElement>('textarea')
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLTextAreaElement).value
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const classes = 'block w-full min-w-0 resize-y rounded-control border border-edge-strong bg-surface-subtle px-3 py-2.5 type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard placeholder:text-fg-muted hover:not-disabled:not-focus-visible:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input'
		return html`<textarea data-ds="textarea" .value=${live(this.value)} rows=${this.rows} name=${ifDefined(this.name)} placeholder=${ifDefined(this.placeholder)} maxlength=${ifDefined(this.maxlength)} ?disabled=${this.inactive} ?readonly=${this.readonly} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class=${classes} @input=${this.onInput} @change=${this.onChange}></textarea>`
	}
}

define('textarea', Textarea)
