import { html as staticHtml } from 'lit/static-html.js'
import { type PropertyValues } from 'lit'
import { ChevronLeft, ChevronRight } from 'lucide'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Calendar.tsx as <spyglass-calendar>: a month to pick a day from. 40px day cells (44px on phones) with the 4px
// corner, weekday heads in DM Sans 12px muted, the month in DM Sans Medium between two ghost arrow buttons. The picked
// day is a White fill with a Black figure; today carries a neutral hairline ring; the days of the months either side
// are faint; days that can't be picked are faint and struck through. Arrows move a day or a week, Home and End to the
// week's ends, Page Up and Page Down a month (with Shift a year), Enter or Space picks. Changing month doesn't
// animate. `value` (a Date, or an ISO date attribute) with `input` and `change`, and `select` fires on every pick.
// `min` and `max` are Dates (or ISO date attributes); `disabled` is a function of the day, set as a property.

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
function addMonths(d: Date, n: number) {
	const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
	return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}
const DAY = 'inline-flex size-control-md cursor-pointer items-center justify-center rounded-ds-sm border border-transparent type-ui tabular-nums text-fg outline-none transition-[background-color,color] duration-150 ease-standard hover:not-data-picked:not-aria-disabled:bg-ds-neutral-4 aria-[current=date]:border-fg-faint data-outside:text-fg-faint data-picked:bg-action-primary data-picked:font-medium data-picked:text-action-primary-fg aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint aria-disabled:line-through focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus data-picked:focus-visible:outline-fg-inverse max-md:size-control-touch'
// "2026-11-13" is that day where the page is, not midnight UTC.
const dateAttr = { fromAttribute: (v: string | null) => (v ? new Date(`${v}T00:00:00`) : null) }

/**
 * @summary A month to pick a day from.
 * @fires input - A day was picked (read `value`).
 * @fires change - A day was picked (read `value`).
 * @fires select - A day was picked; detail.value is the day.
 */
export class Calendar extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = {
		value: { converter: dateAttr },
		label: {},
		min: { converter: dateAttr },
		max: { converter: dateAttr },
		disabled: { attribute: false },
		weekStartsOn: { type: Number, attribute: 'week-starts-on' },
		locale: {},
		focused: { state: true },
	}

	value: Date | null = null
	/** The calendar's name for assistive tech. */
	label = 'Calendar'
	min?: Date | null
	max?: Date | null
	/** Days that can't be picked (a property: cal.disabled = (d) => d.getDay() === 0). */
	disabled?: (day: Date) => boolean
	/** 0 for Sunday, 1 for Monday. */
	weekStartsOn: 0 | 1 = 0
	locale = 'en-US'
	private focused = day0(new Date())
	private today = day0(new Date())
	private pendingFocus = false

	protected willUpdate(changed: PropertyValues) {
		super.willUpdate(changed)
		if (changed.has('value') && this.value && !same(this.value, this.focused)) this.focused = day0(this.value)
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The roving day takes focus once the move has rendered.
		if (this.pendingFocus) {
			this.pendingFocus = false
			this.renderRoot.querySelector<HTMLElement>('table [tabindex="0"]')?.focus()
		}
	}

	private blocked(d: Date) {
		return (!!this.min && d < day0(this.min)) || (!!this.max && d > day0(this.max)) || !!this.disabled?.(d)
	}
	private dayLabel(d: Date) {
		return d.toLocaleDateString(this.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
	}
	private moveTo(d: Date) {
		this.focused = d
		this.pendingFocus = true
	}
	private pick(d: Date) {
		if (this.blocked(d)) return
		this.focused = d
		this.commit(d)
		this.emit('select', { value: d })
	}
	private onKey(event: KeyboardEvent) {
		const d = this.focused
		const start = addDays(d, -((d.getDay() - this.weekStartsOn + 7) % 7))
		const moves: Record<string, () => Date> = {
			ArrowLeft: () => addDays(d, -1),
			ArrowRight: () => addDays(d, 1),
			ArrowUp: () => addDays(d, -7),
			ArrowDown: () => addDays(d, 7),
			Home: () => start,
			End: () => addDays(start, 6),
			PageUp: () => addMonths(d, event.shiftKey ? -12 : -1),
			PageDown: () => addMonths(d, event.shiftKey ? 12 : 1),
		}
		const move = moves[event.key]
		if (move) {
			event.preventDefault()
			this.moveTo(move())
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			this.pick(d)
		}
	}

	render() {
		const month = new Date(this.focused.getFullYear(), this.focused.getMonth(), 1)
		const caption = month.toLocaleDateString(this.locale, { month: 'long', year: 'numeric' })
		const weekdays = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(2026, 1, 1 + ((i + this.weekStartsOn) % 7)) // 1 February 2026 is a Sunday.
			return { short: d.toLocaleDateString(this.locale, { weekday: 'short' }).slice(0, 2), long: d.toLocaleDateString(this.locale, { weekday: 'long' }) }
		})
		// Whole weeks: the days of the months either side fill the first and last rows.
		const lead = (month.getDay() - this.weekStartsOn + 7) % 7
		const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
		const cells = Array.from({ length: Math.ceil((lead + count) / 7) * 7 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i - lead + 1))
		const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
		const button = tag('button')
		return staticHtml`<div data-ds="calendar" class="inline-flex flex-col gap-2 type-ui text-fg" role="group" aria-label=${this.label}>
			<div class="flex items-center gap-1">
				<${button} variant="ghost" size="sm" icon aria-label="Previous month" @click=${() => { this.focused = addMonths(this.focused, -1) }}>${icon(ChevronLeft, 'chevron-left', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>
				<p class="min-w-0 flex-1 text-center type-ui-strong" aria-live="polite">${caption}</p>
				<${button} variant="ghost" size="sm" icon aria-label="Next month" @click=${() => { this.focused = addMonths(this.focused, 1) }}>${icon(ChevronRight, 'chevron-right', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>
			</div>
			<table role="grid" aria-label=${caption} class="border-collapse" @keydown=${this.onKey}>
				<thead>
					<tr>${weekdays.map((w) => staticHtml`<th scope="col" abbr=${w.long} class="h-8 w-control-md p-0 text-center type-caption font-regular text-fg-muted max-md:w-control-touch">${w.short}</th>`)}</tr>
				</thead>
				<tbody>${weeks.map((week) => staticHtml`<tr>${week.map((d) => {
					const outside = d.getMonth() !== month.getMonth()
					return staticHtml`<td class="p-0" role="gridcell" aria-selected=${String(same(d, this.value))}><button
							type="button"
							class=${DAY}
							tabindex=${same(d, this.focused) ? '0' : '-1'}
							aria-label=${this.dayLabel(d)}
							aria-current=${ifDefined(same(d, this.today) ? 'date' : undefined)}
							aria-disabled=${ifDefined(this.blocked(d) ? 'true' : undefined)}
							data-picked=${ifDefined(same(d, this.value) ? 'true' : undefined)}
							data-outside=${ifDefined(outside ? 'true' : undefined)}
							@click=${() => this.pick(d)}
							@focus=${() => { if (!outside) this.focused = d }}
						>${d.getDate()}</button></td>`
				})}</tr>`)}</tbody>
			</table>
		</div>`
	}
}

define('calendar', Calendar)
