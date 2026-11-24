import { html, LitElement, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Input.tsx as <spyglass-input>: a text field on Black, a #666666 hairline that turns White on focus, DM Sans at 14px
// (16px on phones), a #A3A3A3 placeholder and the brand corner. Sizes sm, md and lg; `invalid` turns the hairline red.
// It is form-associated (its `name` and `value` go with its form) and its value is `value` with the native `input`
// and `change` events. aria-label, aria-description and aria-describedby's text pass to the inner <input>.

const SIZES = { sm: 'h-control-sm px-2.5', md: 'h-control-md px-3', lg: 'h-control-lg px-4' } as const
export type InputSize = keyof typeof SIZES

/**
 * @summary A text field.
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 */
export class Input extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('input'))
	static properties = {
		value: {},
		type: {},
		name: {},
		placeholder: {},
		autocomplete: {},
		size: { reflect: true },
		disabled: { type: Boolean, reflect: true },
		readonly: { type: Boolean },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	value = ''
	type = 'text'
	name?: string
	placeholder?: string
	autocomplete?: string
	/** sm (32px), md (40px) or lg (48px). */
	size: InputSize = 'md'
	disabled = false
	readonly = false
	required = false
	/** A red hairline (with the message beside it). */
	invalid = false
	/** The name for assistive tech, passed to the inner input. */
	label?: string
	/** The hint or error, passed to the inner input. */
	description?: string

	connectedCallback() {
		super.connectedCallback()
		// The initial value from the attribute, as an <input value> gives it.
		if (!this.value && this.getAttribute('value')) this.value = this.getAttribute('value')!
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLInputElement>('input')
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLInputElement).value
	}
	// Enter submits its form, as Enter in a native field does.
	private onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.isComposing && this.form) {
			event.preventDefault()
			this.form.requestSubmit()
		}
	}
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const size = SIZES[this.size] ? this.size : 'md'
		const classes = ['w-full min-w-0 rounded-control border border-edge-strong bg-surface-subtle type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard placeholder:text-fg-muted hover:not-disabled:not-focus-visible:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size]].join(' ')
		return html`<input data-ds="input" .value=${live(this.value)} type=${this.type} name=${ifDefined(this.name)} placeholder=${ifDefined(this.placeholder)} autocomplete=${ifDefined(this.autocomplete as never)} ?disabled=${this.inactive} ?readonly=${this.readonly} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class=${classes} @input=${this.onInput} @change=${this.onChange} @keydown=${this.onKeyDown}>`
	}
}

define('input', Input)
