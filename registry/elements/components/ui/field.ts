import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Field.tsx as <spyglass-field>: a label over one control, with a description or an error under it: the label in the
// brand's label voice in the soft gray, the description in the muted gray at caption size, the error in the danger red
// in its place. React's render function hands the control its ids; here the field wires the control it holds: the
// label names it (aria-label) and a press on the label focuses it, the description or error describes it
// (aria-description), and an error sets its `invalid`.

/**
 * @summary A label over one control, with a description or an error under it.
 * @slot - The control: <spyglass-input>, <spyglass-textarea>, <spyglass-native-select>, or any input.
 */
export class Field extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, description: {}, error: {} }

	/** The label over the control. */
	label = ''
	/** A line under the control: what to type, or what happens next. */
	description?: string
	/** What is wrong, in the description's place (the control turns red). */
	error?: string

	private control() {
		return [...this.children].find((c) => !c.hasAttribute('slot')) as (HTMLElement & { invalid?: boolean }) | undefined
	}
	protected updated() {
		const c = this.control()
		if (!c) return
		c.setAttribute('aria-label', this.label)
		const text = this.error || this.description
		if (text) c.setAttribute('aria-description', text)
		else c.removeAttribute('aria-description')
		if ('invalid' in c) c.invalid = !!this.error
	}

	render() {
		const text = this.error || this.description
		return html`<label class="type-label text-fg-soft" @click=${() => this.control()?.focus()}>${this.label}</label>
			<slot @slotchange=${() => this.updated()}></slot>
			${text ? html`<p class=${`type-caption ${this.error ? 'text-fg-danger' : 'text-fg-muted'}`} role=${ifDefined(this.error ? 'alert' : undefined)}>${text}</p>` : nothing}`
	}
}

define('field', Field)
