import { html } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ItemGroup.tsx as <spyglass-item-group>: rows of one list, a #363636 hairline between each. The host is the list's
// box, so a class on the element lands on it; the <ul> inside keeps the list's meaning and lays out nothing. The rows
// are the page's <li>s, each holding a <spyglass-item>.

/**
 * @summary Rows of one list, a hairline between each.
 * @slot - <li> elements, each holding a <spyglass-item>.
 */
export class ItemGroup extends DsElement {
	static styles = [DsElement.styles, styles]

	render() {
		return html`<ul class="contents"><slot></slot></ul>`
	}
}

define('item-group', ItemGroup)
