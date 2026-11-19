import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/footer-row'
import styles from 'virtual:tw'

// FooterBlock.tsx as <spyglass-footer-block>: the hairline, the footer row (`domain`, `links`, `home-href`) inside the
// page width and an optional `note` under it.
export interface FooterLink { label: string; href: string }

/**
 * @summary A website's footer band.
 */
export class FooterBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="footer-block"]'))
	static properties = { domain: {}, links: { type: Array }, homeHref: { attribute: 'home-href' }, note: {} }
	/** The domain on the right. */
	domain = ''
	links: FooterLink[] = []
	/** Where the lockup links. */
	homeHref = '/'
	/** A line under the row. */
	note?: string

	render() {
		return html`<footer data-ds="footer-block" class="border-t border-edge bg-surface text-fg"><div class="mx-auto grid w-full max-w-page-wide gap-8 px-12 py-10 max-sm:px-4"><spyglass-footer-row domain=${this.domain} home-href=${this.homeHref} .links=${this.links ?? []}></spyglass-footer-row>${this.note ? html`<p class="type-caption text-fg-muted">${this.note}</p>` : nothing}</div></footer>`
	}
}

define('footer-block', FooterBlock)
