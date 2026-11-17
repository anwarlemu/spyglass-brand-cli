import { html, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Accordion.tsx as <spyglass-accordion>: a stack of disclosures on Black with neutral hairlines between the rows, a
// muted chevron that turns as a row opens, the row opening to its content's height over 250ms on the strong ease-out
// and closing in 150ms. One open at a time by default (a second press closes it); `multiple` lets several stay open.
// `value` is the open row's value (or a JSON list of them with `multiple`), with `input` and `change` events. Compose
// with <spyglass-accordion-item>.
export type AccordionValue = string | string[] | null

/**
 * @summary A stack of disclosures, one open at a time or several.
 * @slot - The rows: <spyglass-accordion-item>.
 * @fires input - A row opened or closed (read `value`).
 * @fires change - A row opened or closed (read `value`).
 */
export class Accordion extends DsElement {
	static styles = [DsElement.styles, styles]
	// Layout classes on the element (w-full, max-w-160) land on the stack, as on the React root.
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="accordion"]'))
	static properties = {
		multiple: { type: Boolean },
		value: { converter: { fromAttribute: (v: string | null) => (v?.trim().startsWith('[') ? JSON.parse(v) : v || null), toAttribute: (v: AccordionValue) => (Array.isArray(v) ? JSON.stringify(v) : v) } },
	}

	/** Several rows stay open. */
	multiple = false
	/** The open row's value, or the list of them with `multiple`. */
	value: AccordionValue = null

	private list() {
		return Array.isArray(this.value) ? this.value : this.value ? [this.value] : []
	}
	/** Whether the row with this value is open (read by the items). */
	isOpen(v: string) {
		return this.list().includes(v)
	}
	/** Opens or closes the row with this value (the items' press). */
	toggle(v: string) {
		const open = this.list()
		if (this.multiple) this.commit(open.includes(v) ? open.filter((x) => x !== v) : [...open, v])
		else this.commit(open.includes(v) ? null : v)
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (changed.has('value')) for (const item of this.querySelectorAll<HTMLElement & { requestUpdate(): void }>(tagName('accordion-item'))) item.requestUpdate()
	}

	render() {
		return html`<div data-ds="accordion" class="border-t border-edge"><slot></slot></div>`
	}
}

define('accordion', Accordion)
