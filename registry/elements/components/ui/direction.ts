import { html, type PropertyValues } from 'lit'
import { DsElement, define, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Direction.tsx as <spyglass-direction>: sets the reading direction for what is inside it (the `dir` attribute, so
// logical utilities such as ps-, me- and text-start follow it), and elements inside read it through the direction
// controller (React's useDirection). Code stays left to right: pre, code and kbd inside it keep `ltr`. Set `dir` as on
// any element (the attribute or the property).

// The content is the page's (slotted), out of reach of the shadow root's styles: the rule for code goes to the
// document (or the shadow root the wrapper sits in) once.
const sheets = new WeakSet<Document | ShadowRoot>()
function adoptCodeRule(root: Node) {
	if (!(root instanceof Document || root instanceof ShadowRoot) || sheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(`${tagName('direction')} :is(pre, code, kbd) { direction: ltr; unicode-bidi: isolate; }`)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	sheets.add(root)
}

/**
 * @summary Sets the reading direction for what is inside it.
 * @slot - The content.
 * @fires direction-change - The direction changed (detail.value).
 */
export class Direction extends DsElement {
	static styles = [DsElement.styles, styles]
	// `dir` is HTML's own attribute; the element reads it into `direction` and draws it on its box.
	static properties = { direction: { attribute: 'dir' } }

	/** ltr or rtl (the `dir` attribute). */
	direction: 'ltr' | 'rtl' = 'ltr'

	connectedCallback() {
		super.connectedCallback()
		adoptCodeRule(this.getRootNode())
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		if (changed.has('direction') && changed.get('direction') !== undefined) this.emit('direction-change', { value: this.direction })
	}

	render() {
		return html`<div data-ds="direction" class="ds-dir" dir=${this.direction === 'rtl' ? 'rtl' : 'ltr'}><slot></slot></div>`
	}
}

define('direction', Direction)
