import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { Check, ChevronsUpDown, Search } from 'lucide'
import { DsFormElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { PopoverController, popoverStyles, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Combobox.tsx as <spyglass-combobox>: a field-like trigger that opens a list to pick one option from, with a filter
// over it, on the #171717 overlay panel; rows are the menus' rows with a #262626 fill on the row the arrows or the
// pointer are on, the pick checked at the end. `filter="auto"` shows the filter past six options, `filter="false"`
// makes it a plain listbox. `pinned` options stay above a hairline and are never filtered. Arrows, Home and End move,
// Enter picks, typing filters (or, with no filter, jumps to the option it starts), Escape closes and returns focus to
// the trigger. The panel opens in the top layer, flips and stays inside the viewport. The value is `value` with
// `input` and `change`; `select` fires with the option. Form-associated. React's `trigger` and `option` render props
// are methods a subclass overrides (renderTrigger, renderOption).
export interface ComboOption { value: string | number, label: string, hint?: string, disabled?: boolean, pinned?: boolean }

/**
 * @summary A list to pick one option from, with a filter over it.
 * @fires input - The pick changed (read `value`).
 * @fires change - The pick changed (read `value`).
 * @fires select - An option was picked (detail: the option).
 */
export class Combobox extends DsFormElement {
	static styles = [DsFormElement.styles, popoverStyles, styles]
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true }
	static properties = {
		value: {},
		options: { type: Array },
		label: {},
		placeholder: {},
		filter: { converter: (v: string | null) => (v === 'auto' ? 'auto' : v !== 'false') },
		filterLabel: { attribute: 'filter-label' },
		width: {},
		side: {},
		align: {},
		matchWidth: { type: Boolean, attribute: 'match-width' },
		disabled: { type: Boolean, reflect: true },
		name: {},
		required: { type: Boolean },
		description: { attribute: 'aria-description' },
		query: { state: true },
		active: { state: true },
	}

	value: string | number = ''
	/** { value, label, hint, disabled, pinned } (a JSON attribute or the property). */
	options: ComboOption[] = []
	/** The list's name for assistive tech, on the trigger. */
	label = ''
	placeholder = 'Choose'
	/** true, false (a plain listbox) or "auto" (past six options). */
	filter: boolean | 'auto' = true
	filterLabel = 'Filter'
	/** The panel's width (it is at least the trigger's with match-width). */
	width?: string
	side: Side = 'bottom'
	align: Align = 'start'
	matchWidth = false
	disabled = false
	name?: string
	/** An option must be picked for its form to send. */
	required = false
	/** A hint or error for the trigger (a field sets it). */
	description?: string
	protected query = ''
	protected active = 0
	protected uidBase = uid('combobox')
	protected pop = new PopoverController(this, {
		anchor: () => this.renderRoot.querySelector<HTMLElement>('button[data-trigger]'),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
		gap: 4,
	})

	/** The trigger button's classes (React's triggerClass); a subclass returns its own. */
	protected triggerClasses() {
		return 'group inline-flex h-control-md w-full min-w-0 cursor-pointer items-center gap-2 rounded-control border border-edge-strong bg-surface px-3 text-left type-ui text-fg outline-none transition-[border-color] duration-150 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-expanded:border-edge-focus disabled:cursor-not-allowed disabled:text-fg-faint max-md:h-control-touch max-md:text-input pointer-coarse:h-control-touch'
	}
	/** The trigger's content (React's `trigger`). */
	protected renderTrigger(selected: ComboOption | undefined, _open: boolean): TemplateResult {
		return html`<span class=${selected ? 'min-w-0 flex-1 truncate' : 'min-w-0 flex-1 truncate text-fg-muted'}>${selected?.label ?? this.placeholder}</span>${icon(ChevronsUpDown, 'chevrons-up-down', { size: 16, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}`
	}
	/** One row's content (React's `option`). */
	protected renderOption(o: ComboOption, selected: boolean): TemplateResult {
		return html`<span class="min-w-0 flex-1 truncate">${o.label}</span>${o.hint ? html`<span class="min-w-10 text-right type-caption text-fg-muted tabular-nums">${o.hint}</span>` : nothing}${icon(Check, 'check', { size: 16, strokeWidth: 1.5, class: selected ? 'shrink-0' : 'shrink-0 invisible', attrs: { 'aria-hidden': 'true' } })}`
	}
	/** What shows when nothing matches (React's `empty`). */
	protected renderEmpty(query: string): TemplateResult | string {
		return `Nothing matches "${query}".`
	}
	/** The data-ds of the trigger (a subclass's own name, as React's data-ds prop gives it). */
	protected triggerName() {
		return (this.constructor as typeof Combobox).dsName
	}

	protected get filtering() {
		return this.filter === 'auto' ? this.options.filter((o) => !o.pinned).length > 6 : this.filter
	}
	protected get selected() {
		return this.options.find((o) => o.value === this.value)
	}
	private get pinned() {
		return this.options.filter((o) => o.pinned)
	}
	private get rest() {
		const q = this.query.trim().toLowerCase()
		const all = this.options.filter((o) => !o.pinned)
		return q ? all.filter((o) => o.label.toLowerCase().includes(q)) : all
	}
	private get visible() {
		return [...this.pinned, ...this.rest]
	}
	private optionId = (i: number) => `${this.uidBase}-${i}`

	private move(to: number, step = 1) {
		const list = this.visible
		const n = list.length
		if (!n) return
		for (let k = 0; k < n; k++) {
			const i = (((to + k * step) % n) + n) % n
			if (!list[i]?.disabled) {
				this.active = i
				void this.updateComplete.then(() => this.renderRoot.querySelector(`#${this.optionId(i)}`)?.scrollIntoView({ block: 'nearest' }))
				return
			}
		}
	}

	private async openList(keyboard: boolean) {
		this.query = ''
		this.pop.configure({ side: this.side, align: this.align, matchWidth: this.matchWidth })
		await this.pop.show({ keyboard })
		const at = this.visible.findIndex((o) => o.value === this.value)
		this.move(at >= 0 ? at : 0)
		await this.updateComplete
		this.renderRoot.querySelector<HTMLElement>(this.filtering ? 'input[role="combobox"]' : '[role="listbox"]')?.focus({ preventScroll: true })
	}
	private pick(o: ComboOption | undefined, keyboard: boolean) {
		if (!o || o.disabled) return
		this.commit(o.value)
		this.emit('select', o)
		this.pop.hide(true, keyboard)
	}
	private onTrigger = (event: MouseEvent) => {
		if (this.pop.open) this.pop.hide(false, event.detail === 0)
		else void this.openList(event.detail === 0)
	}
	private onTriggerKey = (event: KeyboardEvent) => {
		if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !this.pop.open) {
			event.preventDefault()
			void this.openList(true)
		}
	}
	// With no filter, typing jumps to the option that starts with what was typed in the last half second.
	private typed = ''
	private typedAt = 0
	private onKey = (event: KeyboardEvent) => {
		const k = event.key
		const list = this.visible
		if (k === 'ArrowDown' || k === 'ArrowUp') {
			event.preventDefault()
			this.move(this.active + (k === 'ArrowDown' ? 1 : -1), k === 'ArrowDown' ? 1 : -1)
		} else if ((k === 'Home' || k === 'End') && !this.filtering) {
			event.preventDefault()
			this.move(k === 'Home' ? 0 : list.length - 1, k === 'Home' ? 1 : -1)
		} else if (k === 'Enter' || (k === ' ' && !this.filtering)) {
			event.preventDefault()
			this.pick(list[this.active], true)
		} else if (!this.filtering && k.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
			const now = Date.now()
			this.typed = now - this.typedAt > 500 ? k.toLowerCase() : this.typed + k.toLowerCase()
			this.typedAt = now
			const i = list.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(this.typed))
			if (i >= 0) this.move(i)
		}
	}
	private onQuery = (event: Event) => {
		this.query = (event.target as HTMLInputElement).value
		this.move(0)
	}

	// No native control: a required list with no pick is missing its value, as a required select is.
	syncValidity() {
		this.setMissing(this.required && (this.value === '' || this.value === null || this.value === undefined), 'select', this.renderRoot.querySelector<HTMLElement>('button[data-trigger]'))
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(String(this.value ?? ''))
	}
	render() {
		const open = this.pop.open
		const list = this.visible
		const pinned = this.pinned
		const rest = this.rest
		const activeId = open && list.length ? this.optionId(this.active) : undefined
		const listId = `${this.uidBase}-list`
		const filtering = this.filtering
		return html`<button data-ds=${this.triggerName()} data-trigger type="button" class=${this.triggerClasses()} aria-haspopup="listbox" aria-expanded=${String(open)} aria-controls=${open ? listId : nothing} aria-label=${this.label} aria-description=${this.description ?? nothing} ?disabled=${this.inactive} @click=${this.onTrigger} @keydown=${this.onTriggerKey}>${this.renderTrigger(this.selected, open)}</button>${this.pop.rendered
			? html`<div data-ds="combobox" popover="manual" class="ds-pop flex flex-col p-1 fade-y" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(this.width ? `width: ${this.width}` : '')} @focusout=${this.pop.onFocusOut}>
				${filtering
					? html`<label class="-mx-1 -mt-1 mb-1 flex h-control-md items-center gap-2 border-b border-edge px-3">${icon(Search, 'search', { size: 16, strokeWidth: 1.5, class: 'pointer-events-none shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}<input .value=${this.query} class="h-full min-w-0 flex-1 bg-transparent type-ui text-fg outline-none placeholder:text-fg-muted max-md:text-input" role="combobox" aria-label=${this.filterLabel} placeholder=${this.filterLabel} aria-autocomplete="list" aria-expanded="true" aria-controls=${listId} aria-activedescendant=${activeId ?? nothing} autocomplete="off" spellcheck="false" @input=${this.onQuery} @keydown=${this.onKey}></label>`
					: nothing}
				<div id=${listId} role="listbox" aria-label=${this.label} tabindex=${filtering ? '-1' : '0'} aria-activedescendant=${!filtering && activeId ? activeId : nothing} class="flex max-h-65 flex-col overflow-y-auto outline-none fade-y" @keydown=${this.onKey}>
					${repeat(list, (o) => `${o.pinned ? 'p' : 'o'}-${o.value}`, (o, i) => html`${i === pinned.length && pinned.length && rest.length ? html`<div class="-mx-1 my-1 h-px shrink-0 bg-edge" role="separator"></div>` : nothing}<div id=${this.optionId(i)} role="option" class="flex h-control-sm shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 type-ui text-fg transition-[background-color] duration-150 ease-standard data-active:bg-ds-neutral-4 aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint max-md:h-auto max-md:min-h-control-touch" aria-selected=${String(o.value === this.value)} aria-disabled=${o.disabled ? 'true' : nothing} ?data-active=${i === this.active} @pointermove=${() => { if (!o.disabled) this.active = i }} @mousedown=${(e: Event) => e.preventDefault()} @click=${() => this.pick(o, false)}>${this.renderOption(o, o.value === this.value)}</div>`)}
					${!rest.length && this.query ? html`<p class="px-2 py-2 type-ui text-fg-muted">${this.renderEmpty(this.query)}</p>` : nothing}
				</div>
			</div>`
			: nothing}`
	}
}

define('combobox', Combobox)
