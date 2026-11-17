import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Kbd.tsx as <spyglass-kbd>: a key, DM Sans 12px in the soft neutral, in a 20px #1A1A1A box with a hairline and the
// small corner. Put a shortcut's keys in <spyglass-kbd-group>.

/**
 * @summary A key.
 * @slot - The key's name or symbol.
 */
export class Kbd extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('kbd'))

	render() {
		return html`<kbd data-ds="kbd" class="inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-1 rounded-ds-sm border border-edge-strong bg-surface-subtle px-1 type-caption whitespace-nowrap text-fg-soft select-none"><slot></slot></kbd>`
	}
}

define('kbd', Kbd)
