import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// RadioGroup.tsx as <spyglass-radio-group>: one of a few, all in view: 16px circles in the #363636 hairline, the picked
// one edged in White with a White 8px dot that settles in from 0.6 over 150ms (reduced motion fades it), rows 32px (44px
// on phones) with a DM Sans label and an optional muted hint. Arrows move the pick, as native radios do. `options` is a
// JSON attribute or a property; the value is `value` with the native `input` and `change` events. Form-associated: its
// `name` goes with the form as the picked value.

export interface RadioOption { value: string, label: string, hint?: string, disabled?: boolean }

/**
 * @summary One of a few, all in view.
 * @fires input - The pick moved (read `value`).
 * @fires change - The pick moved (read `value`).
 */
export class RadioGroup extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = { options: { type: Array }, label: {}, name: {}, inline: { type: Boolean }, disabled: { type: Boolean, reflect: true }, required: { type: Boolean }, value: {} }

	options: RadioOption[] = []
	/** The group's name for assistive tech. */
	label = ''
	/** The form field's name (also the radios' group). */
	name?: string
	/** The options in a row. */
	inline = false
	disabled = false
	value?: string
	/** One must be picked for its form to send. */
	required = false
	private group = uid('radio')

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value ?? null)
	}
	// A group's missing pick is on every radio in it: the first one that can be picked reports it.
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLInputElement>('input:not(:disabled)')
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? undefined
	}
	// The inner input event crosses the shadow root on its own (the value is set by then); change does not.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const name = this.name ?? this.group
		return html`<div data-ds="radio-group" role="radiogroup" aria-label=${this.label} class="ds-radios" data-inline=${ifDefined(this.inline ? 'true' : undefined)}>${this.options.map((o) => html`<label class="ds-radiorow" data-disabled=${ifDefined(this.inactive || o.disabled ? 'true' : undefined)}>
				<span class="ds-radio"><input type="radio" name=${name} .value=${o.value} .checked=${live(this.value === o.value)} ?disabled=${this.inactive || !!o.disabled} ?required=${this.required} aria-describedby=${ifDefined(o.hint ? `${name}-${o.value}` : undefined)} @input=${() => { this.value = o.value }} @change=${this.onChange}><i aria-hidden="true"></i></span>
				<span class="flex min-w-0 flex-col">
					<span>${o.label}</span>
					${o.hint ? html`<span id=${`${name}-${o.value}`} class="type-caption text-fg-muted">${o.hint}</span>` : nothing}
				</span>
			</label>`)}</div>`
	}
}

define('radio-group', RadioGroup)
