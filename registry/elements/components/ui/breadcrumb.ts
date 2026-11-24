import { html } from 'lit'
import { ChevronRight } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Breadcrumb.tsx as <spyglass-breadcrumb>: where you are, in DM Sans 14px. Each step back is a muted link that turns
// White under the pointer, a small chevron between them, and the page itself in White, the only step that truncates.
// `items` is a JSON attribute or the property. A click on a step back fires `navigate` (detail.crumb, detail.event:
// call detail.event.preventDefault() to route it yourself).
export interface Crumb { label: string, href?: string }

/**
 * @summary Where you are: each step back a link, the page in White.
 * @fires navigate - A step back was clicked (detail.crumb, detail.event).
 */
export class Breadcrumb extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="breadcrumb"]'))
	static properties = { items: { type: Array }, label: {} }

	/** The steps, the page last: { label, href? }. */
	items: Crumb[] = []
	/** The trail's name for assistive tech. */
	label = 'Breadcrumb'

	render() {
		const last = this.items.length - 1
		return html`<nav data-ds="breadcrumb" class="flex min-w-0 items-center gap-1.5 overflow-hidden type-ui" aria-label=${this.label}>${this.items.map((crumb, i) => html`${i > 0 ? icon(ChevronRight, 'chevron-right', { size: 14, strokeWidth: 1.5, class: 'shrink-0 text-fg-faint rtl:-scale-x-100', attrs: { 'aria-hidden': 'true' } }) : ''}${i < last
			? html`<a href=${crumb.href ?? '#'} class="shrink-0 rounded-ds-sm text-fg-muted transition-[color] duration-160 ease-standard hover:text-fg" @click=${(event: MouseEvent) => this.emit('navigate', { crumb, event })}>${crumb.label}</a>`
			: html`<span class="min-w-0 truncate text-fg" aria-current="page">${crumb.label}</span>`}`)}</nav>`
	}
}

define('breadcrumb', Breadcrumb)
