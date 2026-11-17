import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// KbdGroup.tsx as <spyglass-kbd-group>: the keys of one shortcut, 4px apart.

/**
 * @summary The keys of one shortcut.
 * @slot - <spyglass-kbd> elements.
 */
export class KbdGroup extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('kbd'))

	render() {
		return html`<kbd data-ds="kbd-group" class="inline-flex items-center gap-1"><slot></slot></kbd>`
	}
}

define('kbd-group', KbdGroup)
