import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Empty.tsx as <spyglass-empty>: what shows where a list has nothing in it yet. A dashed #666666 hairline with the
// brand corner on Black, a 20px Lucide icon in a #262626 tile (the `icon` slot), a Funnel Display title (`heading`,
// React's `title`), one muted line on what is missing and the actions that fill it (the default slot).

/**
 * @summary What shows where a list is empty: an icon, a title, a line and the actions that fill it.
 * @slot - The actions (buttons).
 * @slot icon - A 20px Lucide icon.
 */
export class Empty extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="empty"]'))
	static properties = { heading: {}, description: {} }

	/** What is missing (React's `title`; `title` is HTML's tooltip attribute). */
	heading = ''
	/** One muted line on how to fill it. */
	description?: string

	render() {
		return html`<div data-ds="empty" class="flex w-full flex-col items-center gap-2 rounded-container border border-dashed border-edge-strong px-6 py-12 text-center">${this.hasSlot('icon') ? html`<span class="mb-2 flex size-10 items-center justify-center rounded-control bg-surface-raised text-fg" aria-hidden="true"><slot name="icon"></slot></span>` : nothing}<p class="type-heading-4 text-fg">${this.heading}</p>${this.description ? html`<p class="max-w-sm type-ui text-fg-muted">${this.description}</p>` : nothing}${this.hasSlot() ? html`<div class="mt-4 flex flex-wrap justify-center gap-3"><slot></slot></div>` : nothing}</div>`
	}
}

define('empty', Empty)
