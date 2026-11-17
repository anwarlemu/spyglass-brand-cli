import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ToggleGroup.tsx as <spyglass-toggle-group>: buttons that stay pressed, side by side on one track: a #363636 hairline
// on Black with the brand corner, each pressed one a White block with Black text, the rest soft gray. sm (32px) or md
// (40px) tall in all. `multiple` lets several stay on (the value is an array); otherwise one at most, and pressing it
// again lets it go. `options` is a JSON attribute or a property; the value is `value` (a string, a JSON array with
// `multiple`, or null) with `input` and `change`.

export type ToggleGroupOption = string | { value: string, label: string, disabled?: boolean }
export type ToggleGroupValue = string | string[] | null
const ITEM = { sm: 'h-5.5 px-2', md: 'h-7.5 px-3' } as const
export type ToggleGroupSize = keyof typeof ITEM

const norm = (o: ToggleGroupOption) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })
// value="Video" or value='["Video","Image"]'.
const fromAttribute = (v: string | null): ToggleGroupValue => (v === null ? null : v.trim().startsWith('[') ? JSON.parse(v) as string[] : v)

/**
 * @summary Buttons that stay pressed, on one track.
 * @fires input - A button was pressed (read `value`).
 * @fires change - A button was pressed (read `value`).
 */
export class ToggleGroup extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="toggle-group"]'))
	static properties = { options: { type: Array }, label: {}, multiple: { type: Boolean }, size: { reflect: true }, value: { converter: { fromAttribute } } }

	/** The buttons: a label that is its own value, or { value, label, disabled }. */
	options: ToggleGroupOption[] = []
	/** The group's name for assistive tech. */
	label = ''
	/** Several can stay on (the value is an array). */
	multiple = false
	/** sm (32px) or md (40px) in all. */
	size: ToggleGroupSize = 'md'
	value: ToggleGroupValue = null

	private on(v: string) {
		return Array.isArray(this.value) ? this.value.includes(v) : this.value === v
	}
	private press(v: string) {
		if (this.multiple) {
			const list = Array.isArray(this.value) ? this.value : []
			this.commit(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
		} else this.commit(this.value === v ? null : v)
	}

	render() {
		const item = ITEM[this.size] ?? ITEM.md
		const classes = `inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-ds-sm whitespace-nowrap type-ui-strong text-fg-soft select-none transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100 not-aria-pressed:hover:not-disabled:text-fg aria-pressed:bg-action-primary aria-pressed:text-action-primary-fg disabled:cursor-not-allowed disabled:text-action-disabled-fg ${item}`
		return html`<div data-ds="toggle-group" role="group" aria-label=${this.label} class="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-control border border-edge-strong bg-surface p-1">${this.options.map(norm).map((o) => html`<button type="button" aria-pressed=${String(this.on(o.value))} ?disabled=${o.disabled} class=${classes} @click=${() => this.press(o.value)}>${o.label}</button>`)}</div>`
	}
}

define('toggle-group', ToggleGroup)
