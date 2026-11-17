import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// SidebarLink.tsx as <spyglass-sidebar-link>: one page in the sidebar, a 40px row (44px on phones) with its icon (an
// <i data-lucide> in the `icon` slot), the label and a count (`status`) at the end. The page you are on (`active`) is
// White with Black type; the others are soft gray and fill on hover. Folded to icons, the row is a 40px square.

/**
 * @summary One page in the sidebar.
 * @slot - The label.
 * @slot icon - A Lucide icon.
 */
export class SidebarLink extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('a'))
	static properties = { href: {}, active: { type: Boolean, reflect: true }, status: {} }

	href?: string
	/** The page you are on. */
	active = false
	/** A count at the end of the row. */
	status?: string

	render() {
		const collapsed = !!(this.closest(tagName('sidebar')) as (Element & { collapsed?: boolean }) | null)?.collapsed
		const classes = [
			'flex h-row shrink-0 cursor-pointer items-center gap-3 rounded-control type-ui -outline-offset-2 transition-[background-color,color] duration-150 ease-standard max-md:h-control-touch',
			collapsed ? 'w-row justify-center px-0' : 'px-3',
			this.active ? 'bg-action-primary text-action-primary-fg' : 'text-fg-soft hover:bg-action-ghost-hover hover:text-fg',
		].join(' ')
		return html`<a data-ds="sidebar-link" href=${ifDefined(this.href)} aria-current=${ifDefined(this.active ? 'page' : undefined)} class=${classes}>${this.hasSlot('icon') ? html`<span class=${`flex shrink-0 ${this.active ? 'text-action-primary-fg' : 'text-fg-muted'}`}><slot name="icon"></slot></span>` : nothing}<span class=${collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate'}><slot></slot></span>${this.status && !collapsed ? html`<span class=${`type-caption tabular-nums ${this.active ? 'text-action-primary-fg' : 'text-fg-muted'}`}>${this.status}</span>` : nothing}</a>`
	}
}

define('sidebar-link', SidebarLink)
