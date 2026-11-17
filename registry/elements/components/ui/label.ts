import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Label.tsx as <spyglass-label>: a field's label on its own, DM Sans Medium in capitals with 6% tracking at 12px in the
// soft gray, over or beside the control it names; `hint` adds a muted note after it, such as "Optional". A <label for>
// in a shadow root cannot reach a control outside it, so `for` names the control's id in the same document (or shadow
// root) and the element does what the label would: it gives that control its text as aria-label (an element such as
// <spyglass-input> passes it to its inner field) and a press on it focuses and presses the control.

/**
 * @summary A label for one control.
 * @slot - The label's text.
 */
export class Label extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { htmlFor: { attribute: 'for' }, hint: {} }

	/** The id of the control it names (the `for` attribute). */
	htmlFor?: string
	/** A muted note after the label, such as "Optional". */
	hint?: string

	private target() {
		if (!this.htmlFor) return null
		const root = this.getRootNode() as Document | ShadowRoot
		return root.getElementById?.(this.htmlFor) ?? null
	}
	private name() {
		return [this.textContent?.replace(/\s+/g, ' ').trim(), this.hint].filter(Boolean).join(' ')
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.target()?.setAttribute('aria-label', this.name())
	}
	connectedCallback() {
		super.connectedCallback()
		// The control may come after the label in the page: name it once the page around is in place.
		queueMicrotask(() => this.requestUpdate())
	}
	private onClick() {
		const t = this.target()
		if (!t) return
		// A press on a label is a pointer focus: no keyboard ring, as a native label gives its field.
		t.focus({ focusVisible: false } as FocusOptions)
		t.click()
	}

	render() {
		return html`<label data-ds="label" class="inline-flex items-baseline gap-1.5 type-label text-fg-soft" @click=${this.onClick}><slot @slotchange=${() => this.requestUpdate()}></slot>${this.hint ? html`<span class="text-fg-muted">${this.hint}</span>` : nothing}</label>`
	}
}

define('label', Label)
