import { html } from 'lit'
import { live } from 'lit/directives/live.js'
import { DsFormElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// SearchBar.tsx as <spyglass-search-bar>: the ad's search bar, a Black field with the brand corner (56px), the prompt
// in White DM Sans and a White Search button inside it, 8px in. A #363636 hairline turns White while the field has
// focus. Enter or the button fires `search` with the query in event.detail.query; the value is `value` with the native
// `input` and `change` events, and it goes with a surrounding form under `name`.

/**
 * @summary The search bar: a Black field with a White Search button inside.
 * @fires search - Enter or the button: detail.query is the text.
 * @fires input - On every keystroke (read `value`).
 */
export class SearchBar extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('form'))
	static properties = {
		value: {},
		placeholder: {},
		buttonLabel: { attribute: 'button-label' },
		label: { attribute: 'aria-label' },
		name: {},
		disabled: { type: Boolean, reflect: true },
	}
	value = ''
	placeholder = 'Search creatives'
	/** The button's label. */
	buttonLabel = 'Search'
	/** The field's accessible name (aria-label on the element). */
	label = 'Search'
	name = 'q'
	disabled = false

	connectedCallback() {
		super.connectedCallback()
		if (!this.value && this.getAttribute('value')) this.value = this.getAttribute('value')!
	}
	protected updated(changed: Map<PropertyKey, unknown>) {
		super.updated(changed)
		if (changed.has('value')) this.internals.setFormValue(this.value)
	}
	formResetCallback() {
		this.value = this.getAttribute('value') ?? ''
	}
	private onInput(event: Event) {
		this.value = (event.target as HTMLInputElement).value
	}
	private onSubmit(event: Event) {
		event.preventDefault()
		if (!this.inactive) this.emit('search', { query: this.value })
	}

	render() {
		return html`<form data-ds="search-bar" role="search" class="flex h-search w-full items-center gap-2 rounded-control border border-edge-strong bg-surface pr-2 pl-4 transition-[border-color] duration-150 ease-standard has-[input:focus-visible]:border-edge-focus" @submit=${this.onSubmit}><input type="search" name=${this.name} .value=${live(this.value)} placeholder=${this.placeholder} aria-label=${this.label} ?disabled=${this.inactive} autocomplete="off" class="h-full min-w-0 flex-1 bg-transparent type-body text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden" @input=${this.onInput}><spyglass-button type="submit" ?disabled=${this.inactive}>${this.buttonLabel}</spyglass-button></form>`
	}
}

define('search-bar', SearchBar)
