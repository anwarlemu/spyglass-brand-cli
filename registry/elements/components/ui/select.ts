import { html, LitElement, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'
import { Check, ChevronDown } from 'lucide'
import { DsFormElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { onMenuRows } from '@/elements/lib/menu'
import { PopoverController, popoverStyles } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Select.tsx as <spyglass-select>: one choice from a short list, drawn as the field is: a Black field with a hairline
// that turns White while open, the chosen label (or a muted placeholder) and a chevron. The list opens in the card's
// #262626 panel, as wide as the field, focus on the chosen row, which has a check. Arrow keys, Home, End and the first
// letter move through it, Enter or Space picks, Escape closes. Opened from the keyboard it shows at once. `options` is
// a JSON list of { value, label, disabled }; `value` with `input` and `change`; form-associated under `name`.
export type SelectSize = 'sm' | 'md' | 'lg'
export interface SelectOption { value: string, label: string, disabled?: boolean }

const SIZES: Record<SelectSize, string> = { sm: 'h-control-sm pr-2 pl-2.5', md: 'h-control-md pr-3 pl-3', lg: 'h-control-lg pr-4 pl-4' }

/**
 * @summary One choice from a short list, drawn as a field.
 * @fires input - A row was picked (read `value`).
 * @fires change - A row was picked (read `value`).
 */
export class Select extends DsFormElement {
	static styles = [DsFormElement.styles, popoverStyles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('button[role="combobox"]'))
	static properties = {
		options: { type: Array },
		value: {},
		placeholder: {},
		size: { reflect: true },
		label: { attribute: 'aria-label' },
		name: {},
		disabled: { type: Boolean, reflect: true },
		invalid: { type: Boolean, reflect: true },
	}

	/** The choices. */
	options: SelectOption[] = []
	value = ''
	/** Shown, muted, until something is chosen. */
	placeholder = 'Select'
	/** sm (32px), md (40px) or lg (48px), as Input. */
	size: SelectSize = 'md'
	/** The field's name for assistive tech. */
	label?: string
	name?: string
	disabled = false
	/** A red hairline (with the message beside it). */
	invalid = false
	private listId = uid('select')
	private typed = { text: '', at: 0 }
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		matchWidth: true,
		gap: 4,
		anchor: () => this.renderRoot.querySelector<HTMLElement>('button[role="combobox"]'),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	connectedCallback() {
		super.connectedCallback()
		if (!this.value && this.getAttribute('value')) this.value = this.getAttribute('value')!
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}

	private rows() {
		return [...this.renderRoot.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')]
	}
	private async open(keyboard: boolean, at: 'chosen' | 'first' | 'last' = 'chosen') {
		await this.pop.show({ keyboard })
		const all = this.rows()
		const target = at === 'first' ? all[0] : at === 'last' ? all.at(-1) : all.find((r) => r.dataset.value === this.value) ?? all[0]
		;(target ?? this.renderRoot.querySelector<HTMLElement>('.ds-pop'))?.focus({ preventScroll: true })
	}
	private pick(v: string, keyboard: boolean) {
		this.commit(v)
		this.pop.hide(true, keyboard)
	}
	// A click from the keyboard has no pointer detail: the list opens and closes at once.
	private onClick = (event: MouseEvent) => {
		const keyboard = event.detail === 0
		if (this.pop.open) this.pop.hide(keyboard, keyboard)
		else void this.open(keyboard)
	}
	private onTriggerKey = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			if (!this.pop.open) void this.open(true, this.value ? 'chosen' : event.key === 'ArrowDown' ? 'first' : 'last')
		}
	}
	// The first letters typed in a moment find the next row that starts with them.
	private typeahead(key: string) {
		const now = Date.now()
		this.typed = { text: now - this.typed.at < 500 ? this.typed.text + key.toLowerCase() : key.toLowerCase(), at: now }
		const all = this.rows()
		const from = all.indexOf((this.renderRoot as ShadowRoot).activeElement as HTMLElement)
		const order = [...all.slice(from + 1), ...all.slice(0, from + 1)]
		order.find((r) => r.textContent?.trim().toLowerCase().startsWith(this.typed.text))?.focus()
	}
	private onListKey = (event: KeyboardEvent) => {
		const row = (event.composedPath()[0] as HTMLElement).closest?.<HTMLElement>('[role="option"]')
		if ((event.key === 'Enter' || event.key === ' ') && row) {
			event.preventDefault()
			if (row.getAttribute('aria-disabled') !== 'true') this.pick(row.dataset.value ?? '', true)
		} else if (event.key.length === 1 && /\S/.test(event.key)) this.typeahead(event.key)
		else onMenuRows(event, this.rows(), (refocus) => this.pop.hide(refocus))
	}

	render() {
		const options = Array.isArray(this.options) ? this.options : []
		const chosen = options.find((o) => o.value === this.value)
		const size = SIZES[this.size] ? this.size : 'md'
		const classes = ['flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-control border border-edge-strong bg-surface-subtle type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size]].join(' ')
		const panel = this.pop.rendered
			? html`<div data-ds="select" id=${this.listId} popover="manual" class="ds-pop p-1 fade-y" role="listbox" aria-label=${ifDefined(this.label)} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style()} @focusout=${this.pop.onFocusOut} @keydown=${this.onListKey}>${repeat(
				options,
				(o) => o.value,
				(o) => html`<div role="option" tabindex="-1" data-value=${o.value} aria-selected=${String(o.value === this.value)} aria-disabled=${ifDefined(o.disabled ? 'true' : undefined)} class="flex h-control-sm cursor-pointer items-center justify-between gap-3 rounded-ds-sm px-2 type-ui text-fg-soft outline-none transition-[background-color,color] duration-160 ease-standard focus:bg-action-secondary focus:text-fg aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint aria-selected:text-fg max-md:h-control-touch" @pointermove=${(event: PointerEvent) => { const el = event.currentTarget as HTMLElement; if (!o.disabled && (this.renderRoot as ShadowRoot).activeElement !== el) el.focus({ preventScroll: true }) }} @click=${(event: MouseEvent) => { if (!o.disabled) this.pick(o.value, event.detail === 0) }}><span class="min-w-0 truncate">${o.label}</span>${o.value === this.value ? icon(Check, 'check', { size: 16, strokeWidth: 1.5, class: 'shrink-0', attrs: { 'aria-hidden': 'true' } }) : nothing}</div>`,
			)}</div>`
			: nothing
		return html`<button data-ds="select" type="button" role="combobox" aria-haspopup="listbox" aria-expanded=${String(this.pop.open)} aria-controls=${ifDefined(this.pop.open ? this.listId : undefined)} aria-label=${ifDefined(this.label)} aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)} ?disabled=${this.inactive} class=${classes} @click=${this.onClick} @keydown=${this.onTriggerKey}><span class=${`min-w-0 truncate text-left ${chosen ? 'text-fg' : 'text-fg-muted'}`}>${chosen ? chosen.label : this.placeholder}</span>${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>${panel}`
	}
}

define('select', Select)
