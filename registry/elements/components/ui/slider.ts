import { html, LitElement, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsFormElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Slider.tsx as <spyglass-slider>: a value on a range: a 4px #363636 track, White up to the value, and a 16px White
// thumb with the small corner. It follows the pointer with no easing; arrows step it, Page Up and Down by tens, Home and
// End to the ends. The value is a numeric `value` with `input` (while it moves) and `change` (when it is let go), as a
// native range's. Form-associated: its `name` goes with the form.

/**
 * @summary A value on a range.
 * @fires input - While it moves (read `value`).
 * @fires change - When it is let go (read `value`).
 */
export class Slider extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	static properties = {
		value: { type: Number },
		label: {},
		min: { type: Number },
		max: { type: Number },
		step: { type: Number },
		disabled: { type: Boolean, reflect: true },
		valueText: { attribute: 'value-text' },
		name: {},
	}

	value = 0
	/** The name for assistive tech. */
	label = ''
	min = 0
	max = 100
	step = 1
	disabled = false
	/** What a screen reader says for the value ("$40 a day" for 40). */
	valueText?: string
	name?: string

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(String(this.value))
	}
	protected validityControl() {
		return this.renderRoot.querySelector<HTMLInputElement>('input')
	}
	formResetCallback() {
		this.value = Number(this.getAttribute('value') ?? 0)
	}
	private onInput(event: Event) {
		this.value = Number((event.target as HTMLInputElement).value)
	}
	// The inner change does not leave the shadow root: the element sends its own.
	private onChange() {
		this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
	}

	render() {
		const share = this.max > this.min ? ((this.value - this.min) / (this.max - this.min)) * 100 : 0
		return html`<span data-ds="slider" class="ds-slider" style=${styleMap({ '--p': `${share}%` })} data-disabled=${ifDefined(this.inactive ? 'true' : undefined)}>
			<span class="ds-slider-track" aria-hidden="true"><span></span></span>
			<input type="range" min=${this.min} max=${this.max} step=${this.step} .value=${live(String(this.value))} ?disabled=${this.inactive} aria-label=${this.label} aria-valuetext=${ifDefined(this.valueText)} @input=${this.onInput} @change=${this.onChange}>
		</span>`
	}
}

define('slider', Slider)
