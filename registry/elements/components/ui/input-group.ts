import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// InputGroup.tsx as <spyglass-input-group>: a field with something at its start or end inside the same hairline: an
// icon, a unit or a prefix in the muted gray (slot="start", slot="end"), or a small button. Drawn and sized as the
// input is (sm 32px, md 40px, lg 48px); the hairline turns White while the field has focus and red when `invalid`.
// Form-associated (its `name` and `value` go with its form); the value is `value` with the native `input` and `change`
// events, and Enter submits its form. aria-label and aria-description pass to the inner input.

const SIZES = { sm: 'h-control-sm gap-1.5 px-2.5', md: 'h-control-md gap-2 px-3', lg: 'h-control-lg gap-2 px-4' } as const
// A button at the end comes 4px from the edge, whatever the group's padding. The slot is in the box, so the button
// it holds is read from the host.
const END = { sm: '-mr-1.5', md: '-mr-2', lg: '-mr-3' } as const
export type InputGroupSize = keyof typeof SIZES

/**
 * @summary A field with an icon, a unit or a button inside its hairline.
 * @slot start - What sits before the text: an icon, a prefix.
 * @slot end - What sits after the text: a unit, a count, a small button.
 * @fires input - On every keystroke (read `value`).
 * @fires change - When the value is committed.
 */
export class InputGroup extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static dsField = true
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="input-group"]'))
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
	size: InputGroupSize = 'md'
	disabled = false
	readonly = false
	required = false
	/** A red hairline (with the message beside it). */
	invalid = false
	/** The name for assistive tech, passed to the inner input. */
	label?: string
	/** The description or error, passed to the inner input. */
	description?: string

	// The start and end slots are drawn only when they have content, so the element follows its children: content that
	// lands after the first render (a parser still streaming, a framework filling it) gets its addon box.
	private observer = new MutationObserver(() => this.requestUpdate())
	connectedCallback() {
		super.connectedCallback()
		if (!this.value && this.getAttribute('value')) this.value = this.getAttribute('value')!
		this.observer.observe(this, { childList: true })
		this.requestUpdate()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.observer.disconnect()
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
		const button = !!this.querySelector(':scope > [slot="end"] button, :scope > button[slot="end"], :scope > [slot="end"][data-ds="button"]')
		const box = ['flex w-full min-w-0 items-center rounded-control border border-edge-strong bg-surface-subtle text-fg transition-[border-color] duration-160 ease-standard hover:not-has-[input:disabled]:border-action-secondary-edge-hover has-[input:focus-visible]:border-edge-focus data-invalid:border-action-danger has-[input:disabled]:cursor-not-allowed', SIZES[size]].join(' ')
		return html`<div data-ds="input-group" data-invalid=${ifDefined(this.invalid ? 'true' : undefined)} class=${box}>${this.hasSlot('start') ? html`<span class="flex shrink-0 items-center gap-1.5 type-ui text-fg-muted"><slot name="start"></slot></span>` : nothing}<input .value=${live(this.value)} type=${this.type} name=${ifDefined(this.name)} placeholder=${ifDefined(this.placeholder)} autocomplete=${ifDefined(this.autocomplete as never)} ?disabled=${this.inactive} ?readonly=${this.readonly} ?required=${this.required} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} class="h-full w-full min-w-0 flex-1 bg-transparent type-ui text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input" @input=${this.onInput} @change=${this.onChange} @keydown=${this.onKeyDown}>${this.hasSlot('end') ? html`<span class=${['flex shrink-0 items-center gap-1.5 type-ui text-fg-muted', button ? END[size] : ''].join(' ')}><slot name="end"></slot></span>` : nothing}</div>`
	}
}

define('input-group', InputGroup)
