import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// BrowserFrame.tsx as <spyglass-browser-frame>: the site's browser window, the `url` in the bar's pill, the default
// slot as the page and the `footer` slot as a row under it.

/**
 * @summary The site's browser window around a screenshot or part of a page.
 * @slot - The page.
 * @slot footer - A row under the page.
 */
export class BrowserFrame extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="browser-frame"]'))
	static properties = { url: {} }
	/** The address in the bar. */
	url = ''

	render() {
		return html`<div data-ds="browser-frame" class="flex size-full flex-col overflow-hidden rounded-panel border border-edge-surface bg-surface-raised text-fg"><div class="grid h-7 shrink-0 grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 border-b border-edge-surface px-2"><span class="flex gap-1" aria-hidden="true"><span class="size-2 rounded-full bg-edge-strong"></span><span class="size-2 rounded-full bg-edge-strong"></span><span class="size-2 rounded-full bg-edge-strong"></span></span><span class="flex h-5 w-full max-w-50 min-w-0 items-center justify-center gap-1 justify-self-center rounded-ds-sm bg-surface-inset px-2 type-caption text-fg-soft"><svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" class="size-2 shrink-0 text-fg-muted"><path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" stroke-width="1.2"></path><rect x="2.5" y="5" width="7" height="5.5" rx="1" fill="currentColor"></rect></svg><span class="truncate">${this.url}</span></span><span></span></div><div class="relative min-h-0 flex-1 overflow-hidden"><slot></slot></div>${this.hasSlot('footer') ? html`<div class="flex shrink-0 items-center gap-2 border-t border-edge-surface px-3 py-2 type-ui"><slot name="footer"></slot></div>` : nothing}</div>`
	}
}

define('browser-frame', BrowserFrame)
