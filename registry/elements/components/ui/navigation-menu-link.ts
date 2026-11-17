import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// NavigationMenuLink.tsx as <spyglass-navigation-menu-link>: a link in a navigation menu's panel: its title (`heading`,
// React's `title`) in DM Sans Medium and a muted line under it, the small corner; the link under the pointer or focus
// takes the #262626 fill.

/**
 * @summary A link with a line under it, in a navigation menu's panel.
 */
export class NavigationMenuLink extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('a'))
	static properties = { href: {}, heading: {}, description: {} }

	href?: string
	/** The link's title (React's `title`). */
	heading = ''
	/** A line under it. */
	description?: string

	render() {
		return html`<a data-ds="navigation-menu-link" href=${ifDefined(this.href)} class="flex flex-col gap-1 rounded-ds-sm p-3 -outline-offset-2 transition-[background-color] duration-150 ease-standard hover:bg-action-secondary focus-visible:bg-action-secondary"><span class="type-ui-strong text-fg">${this.heading}</span>${this.description ? html`<span class="type-caption text-fg-muted">${this.description}</span>` : nothing}</a>`
	}
}

define('navigation-menu-link', NavigationMenuLink)
