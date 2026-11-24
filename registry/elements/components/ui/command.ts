import { html, nothing, type PropertyValues } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { live } from 'lit/directives/live.js'
import { Search } from 'lucide'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Command.tsx as <spyglass-command>: a box to type in over a list of actions and places, on the #262626 overlay
// surface in a neutral hairline with the brand corner; the field on top over a hairline, groups with a capital label,
// the menus' rows with a #262626 fill on the row the arrows or the pointer are on. The field keeps focus: typing
// filters (label and keywords), arrows move the highlight and wrap, Home and End jump, Enter runs the row. Nothing
// animates. `groups` is a property or a JSON attribute ({ heading, items: [{ id, label, keywords, shortcut,
// disabled }] }); a row's icon is page content with slot="icon-<id>" (React's `icon`). `select` fires with the row.
export interface CommandItem { id: string, label: string, keywords?: string[], shortcut?: string, disabled?: boolean }
export interface CommandGroup { heading?: string, items: CommandItem[] }

const ROW = 'flex h-control-sm shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 type-ui text-fg transition-[background-color] duration-160 ease-standard data-active:bg-ds-neutral-4 aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint max-md:h-auto max-md:min-h-control-touch'

function matches(item: CommandItem, q: string) {
	if (!q) return true
	const t = q.toLowerCase()
	return item.label.toLowerCase().includes(t) || !!item.keywords?.some((k) => k.toLowerCase().includes(t))
}

/**
 * @summary A box to type in over a list of actions and places.
 * @slot icon-<id> - The icon of the row with that id (a 16px Lucide icon).
 * @fires select - A row was run (detail: the row).
 */
export class Command extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { groups: { type: Array }, label: {}, placeholder: {}, empty: {}, autoFocus: { type: Boolean, attribute: 'auto-focus' }, query: { state: true }, activeId: { state: true } }

	groups: CommandGroup[] = []
	/** The list's name for assistive tech. */
	label = 'Commands'
	/** The field's placeholder. */
	placeholder = 'Type a command or search'
	/** What the list says when nothing matches. */
	empty = 'No results.'
	/** Focus the field when it first renders (the auto-focus attribute). */
	autoFocus = false
	private query = ''
	private activeId = ''
	private listId = uid('command')
	private scrollPending = false

	/** Focuses the field. */
	focus(options?: FocusOptions) {
		this.renderRoot.querySelector<HTMLInputElement>('input')?.focus(options)
	}
	/** Empties the field. */
	reset() {
		this.query = ''
		this.activeId = ''
	}

	private get shown() {
		const q = this.query.trim()
		return (this.groups ?? []).map((g) => ({ ...g, items: g.items.filter((i) => matches(i, q)) })).filter((g) => g.items.length)
	}

	protected firstUpdated() {
		if (this.autoFocus) this.focus({ preventScroll: true })
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!this.scrollPending) return
		this.scrollPending = false
		this.renderRoot.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' })
	}

	render() {
		const shown = this.shown
		const rows = shown.flatMap((g) => g.items)
		const enabled = rows.filter((r) => !r.disabled)
		const active = enabled.find((r) => r.id === this.activeId) ?? enabled[0]
		const rowId = (item: CommandItem) => `${this.listId}-${rows.indexOf(item)}`
		const move = (to: number) => {
			const n = enabled.length
			if (!n) return
			this.activeId = enabled[(to % n + n) % n]!.id
			this.scrollPending = true
		}
		const run = (item: CommandItem | undefined) => {
			if (!item || item.disabled) return
			this.emit('select', item)
		}
		const onKey = (event: KeyboardEvent) => {
			const at = active ? enabled.indexOf(active) : -1
			if (event.key === 'ArrowDown') { event.preventDefault(); move(at + 1) }
			else if (event.key === 'ArrowUp') { event.preventDefault(); move(at - 1) }
			else if (event.key === 'Home' && !this.query) { event.preventDefault(); move(0) }
			else if (event.key === 'End' && !this.query) { event.preventDefault(); move(enabled.length - 1) }
			else if (event.key === 'Enter') { event.preventDefault(); run(active) }
		}
		return html`<div data-ds="command" class="flex w-full flex-col overflow-hidden rounded-container border border-edge bg-surface-raised text-fg">
			<label class="flex h-control-lg shrink-0 items-center gap-2 border-b border-edge px-3">
				${icon(Search, 'search', { size: 16, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}
				<input .value=${live(this.query)} class="h-full min-w-0 flex-1 bg-transparent type-ui text-fg outline-none placeholder:text-fg-muted max-md:text-input" role="combobox" aria-label=${this.placeholder} placeholder=${this.placeholder} aria-autocomplete="list" aria-expanded="true" aria-controls=${`${this.listId}-list`} aria-activedescendant=${active ? rowId(active) : nothing} autocomplete="off" spellcheck="false" @input=${(e: Event) => { this.query = (e.target as HTMLInputElement).value; this.activeId = '' }} @keydown=${onKey}>
			</label>
			<div id=${`${this.listId}-list`} role="listbox" aria-label=${this.label} class="max-h-96 overflow-y-auto overscroll-contain p-1 fade-y">
				${shown.map((g, gi) => html`<div role="group" aria-label=${g.heading ?? nothing} class=${gi ? '-mx-1 mt-1 border-t border-edge px-1 pt-1' : ''}>
					${g.heading ? html`<p class="px-2 pt-2 pb-1 type-label text-fg-muted" aria-hidden="true">${g.heading}</p>` : nothing}
					${repeat(g.items, (item) => item.id, (item) => html`<div id=${rowId(item)} role="option" class=${ROW} aria-selected=${String(item === active)} aria-disabled=${item.disabled ? 'true' : nothing} ?data-active=${item === active} @pointermove=${() => { if (!item.disabled && item !== active) this.activeId = item.id }} @mousedown=${(e: Event) => e.preventDefault()} @click=${() => run(item)}>${this.hasSlot(`icon-${item.id}`) ? html`<span class="flex shrink-0 text-fg-muted" aria-hidden="true"><slot name=${`icon-${item.id}`}></slot></span>` : nothing}<span class="min-w-0 flex-1 truncate">${item.label}</span>${item.shortcut ? html`<span class="shrink-0 type-caption text-fg-faint">${item.shortcut}</span>` : nothing}</div>`)}
				</div>`)}
				${!rows.length ? html`<p class="px-2 py-6 text-center type-ui text-fg-muted">${this.empty}</p>` : nothing}
			</div>
		</div>`
	}
}

define('command', Command)
