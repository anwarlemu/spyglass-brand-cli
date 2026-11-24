import { html, LitElement, type PropertyValues } from 'lit'
import { ChevronDown } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// NativeSelect.tsx as <spyglass-native-select>: the browser's own select, drawn as the input is: a #666666 hairline on
// Black that turns White on focus, DM Sans at 14px (16px on phones), the brand corner and its own 16px chevron in the
// muted gray. Sizes sm, md and lg. Options go inside as <option>s: a <select> takes only its own children, so the
// element draws a copy of them in its shadow root and follows changes to them. The host is the box (React's wrapper
// span), so a class on the element lands on it. Form-associated (its `name` and `value` go with its form); the value is
// `value` with the native `input` and `change` events. aria-label and aria-description pass to the inner select.

const SIZES = { sm: 'h-control-sm pr-8 pl-2.5', md: 'h-control-md pr-9 pl-3', lg: 'h-control-lg pr-10 pl-4' } as const
const CHEVRON = { sm: 'right-2.5', md: 'right-3', lg: 'right-4' } as const
export type NativeSelectSize = keyof typeof SIZES

/**
 * @summary The browser's own select, drawn as the input.
 * @slot - The <option>s (copied into the select).
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 */
export class NativeSelect extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		value: {},
		name: {},
		size: { reflect: true },
		disabled: { type: Boolean, reflect: true },
		required: { type: Boolean },
		invalid: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
	}

	/** The picked option's value (the first option's when unset, as a select's). */
	value?: string
	name?: string
	/** sm (32px), md (40px) or lg (48px). */
	size: NativeSelectSize = 'md'
	disabled = false
	required = false
	/** A red hairline (with the message beside it). */
	invalid = false
	/** The name for assistive tech, passed to the inner select. */
	label?: string
	/** The description or error, passed to the inner select (a field sets it). */
	description?: string
	private observer = new MutationObserver(() => this.requestUpdate())

	connectedCallback() {
		super.connectedCallback()
		this.observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true })
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.observer.disconnect()
	}

	private get select() {
		return this.renderRoot.querySelector('select')
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const select = this.select
		if (!select) return
		// The options render after the select's own bindings, so the value goes on once they are there.
		if (this.value === undefined) this.value = select.value
		else if (select.value !== this.value) select.value = this.value
		this.internals.setFormValue(this.value ?? null)
		this.syncValidity()
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLSelectElement>('select')
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? undefined
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLSelectElement).value
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const size = SIZES[this.size] ? this.size : 'md'
		const options = [...this.querySelectorAll('option')]
		const classes = ['w-full min-w-0 cursor-pointer appearance-none rounded-control border border-edge-strong bg-surface-subtle type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size]].join(' ')
		return html`<select name=${ifDefined(this.name)} ?disabled=${this.inactive} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class=${classes} @input=${this.onInput} @change=${this.onChange}>${options.map((o) => html`<option value=${o.value} ?disabled=${o.disabled}>${o.text}</option>`)}</select>${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: `pointer-events-none absolute text-fg-muted ${CHEVRON[size]}`, attrs: { 'aria-hidden': 'true' } })}`
	}
}

define('native-select', NativeSelect)
