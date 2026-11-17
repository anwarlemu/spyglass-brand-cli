import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Checkbox.tsx as <spyglass-checkbox>: a yes or no that is part of a form. A 16px box with a 4px corner in a #363636
// hairline on Black that lifts to #4D4D4D under the pointer; checked, it fills White and a Black check draws its
// stroke; `indeterminate` shows a bar for a group partly on. Focus is the White ring. The label sits right of it in
// DM Sans 14px, the whole row pressable, 32px tall (44px on phones). The host is the row (React's root label), so a
// class on the element lands on it. `checked` (the attribute is the starting state, as a native checkbox's) with the
// native `input` and `change` events and `checked-change`. Form-associated: its `name` goes with the form as `value`
// (or "on") while checked.

/**
 * @summary A yes or no that is part of a form.
 * @slot - The label (or set `label`).
 * @fires input - It was turned (read `checked`).
 * @fires change - It was turned (read `checked`).
 * @fires checked-change - It was turned; detail.value is the new state.
 */
export class Checkbox extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		checked: { type: Boolean },
		label: {},
		hint: {},
		indeterminate: { type: Boolean },
		disabled: { type: Boolean, reflect: true },
		invalid: { type: Boolean, reflect: true },
		required: { type: Boolean },
		name: {},
		value: {},
	}

	checked = false
	label?: string
	/** A muted line under the label. */
	hint?: string
	/** A bar in place of the check, for a group partly on. */
	indeterminate = false
	disabled = false
	invalid = false
	/** It must be checked for its form to send. */
	required = false
	name?: string
	/** What the form gets while it is checked ("on" when unset). */
	value?: string
	private inputId = uid('checkbox')

	constructor() {
		super()
		// The whole row is pressable, its padding too (React's root is the <label>).
		this.addEventListener('click', (event) => {
			if (event.composedPath()[0] === this) this.renderRoot.querySelector('input')?.click()
		})
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('checked') || changed.has('value')) this.internals.setFormValue(this.checked ? (this.value ?? 'on') : null)
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLInputElement>('input')
	}
	formResetCallback() {
		this.checked = this.hasAttribute('checked')
	}
	private onInput(event: Event) {
		this.checked = (event.target as HTMLInputElement).checked
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
		this.emit('checked-change', { value: this.checked })
	}

	render() {
		const id = this.inputId
		const text = this.label || this.hasSlot() || this.hint
		return html`<label for=${id} class="contents">
			<span class="ds-checkbox">
				<input id=${id} type="checkbox" .checked=${live(this.checked)} .indeterminate=${this.indeterminate} name=${ifDefined(this.name)} value=${ifDefined(this.value)} ?disabled=${this.inactive} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-describedby=${ifDefined(this.hint ? `${id}-hint` : undefined)} @input=${this.onInput} @change=${this.onChange}>
				${this.indeterminate
					? html`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8"></path></svg>`
					: html`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength="1"></path></svg>`}
			</span>
			${text
				? html`<span class="flex min-w-0 flex-col">
						<span><slot>${this.label}</slot></span>
						${this.hint ? html`<span id=${`${id}-hint`} class="type-caption text-fg-muted">${this.hint}</span>` : nothing}
					</span>`
				: html`<slot></slot>`}
		</label>`
	}
}

define('checkbox', Checkbox)
