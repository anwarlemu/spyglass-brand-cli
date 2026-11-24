import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Sentences.tsx as <spyglass-sentences>: `text` split after each sentence, so below 768 each sentence wraps whole.

/**
 * @summary Copy that keeps each sentence whole on a phone.
 */
export class Sentences extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { text: {} }
	text = ''

	render() {
		const parts = (this.text ?? '').split(/(?<=[.!?])\s+/)
		return html`<span data-ds="sentences" class="contents">${parts.map((part, i) => html`${i > 0 ? ' ' : ''}<span class="max-md:inline-block">${part}</span>`)}</span>`
	}
}

define('sentences', Sentences)
