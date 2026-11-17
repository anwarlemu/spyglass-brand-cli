import { html, nothing, type PropertyValues } from 'lit'
import { PanelLeftClose, PanelLeftOpen } from 'lucide'
import { DsElement, define, HostLayoutController, tagName } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Sidebar.tsx as <spyglass-sidebar>: the app's rail, Black with a hairline at its edge, 256px wide. The `head` slot
// holds the logo or the workspace (56px, over a hairline), <spyglass-sidebar-label> names each group, a
// <spyglass-sidebar-link> per page (the page you are on in White), and the `foot` slot the account. `collapsible` adds a
// button that folds it to 64px of icons, at once; `collapsed` (reflected) with `collapsed-change`.

/**
 * @summary The app's navigation rail, with groups of links.
 * @slot - Labels and links.
 * @slot head - The logo or the workspace.
 * @slot foot - The account.
 * @fires collapsed-change - It folded or unfolded (detail.value).
 */
export class Sidebar extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('nav'))
	static properties = { label: {}, collapsible: { type: Boolean }, collapsed: { type: Boolean, reflect: true } }

	/** The navigation's name for assistive tech. */
	label = 'Main'
	/** Shows the button that folds it to icons. */
	collapsible = false
	/** Folded to icons. */
	collapsed = false

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		// The links and labels draw themselves from the sidebar's state.
		if (changed.has('collapsed')) for (const el of this.querySelectorAll<DsElement>(`${tagName('sidebar-link')}, ${tagName('sidebar-label')}`)) el.requestUpdate()
	}

	render() {
		const head = this.hasSlot('head')
		const Icon = this.collapsed ? PanelLeftOpen : PanelLeftClose
		return html`<nav data-ds="sidebar" aria-label=${this.label} ?data-collapsed=${this.collapsed} class=${`flex h-full shrink-0 flex-col border-r border-edge bg-surface ${this.collapsed ? 'w-16' : 'w-rail'}`}>
			${head || this.collapsible
				? html`<div class=${`flex h-14 shrink-0 items-center gap-2 border-b border-edge px-3 ${this.collapsed ? 'justify-center' : 'justify-between'}`}>
					${head && !this.collapsed ? html`<div class="flex min-w-0 flex-1 items-center pl-1"><slot name="head"></slot></div>` : nothing}
					${this.collapsible ? html`<button type="button" class="inline-flex size-control-md shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg" aria-label=${this.collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded=${String(!this.collapsed)} @click=${() => this.commit(!this.collapsed, 'collapsed')}>${icon(Icon, this.collapsed ? 'panel-left-open' : 'panel-left-close', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button>` : nothing}
				</div>`
				: nothing}
			<div class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3"><slot></slot></div>
			${this.hasSlot('foot') ? html`<div class=${`shrink-0 border-t border-edge p-3 ${this.collapsed ? 'hidden' : ''}`}><slot name="foot"></slot></div>` : nothing}
		</nav>`
	}
}

define('sidebar', Sidebar)
