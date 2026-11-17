import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// FooterRow.tsx as <spyglass-footer-row>: the lockup on the left, the domain on the right (`caps` for capitals), and
// `links` (a list of { label, href }) between them for a website footer.
export interface FooterLink { label: string; href: string }

const LINK = 'rounded-control text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg'

/**
 * @summary The footer row: lockup left, domain right, links between.
 */
export class FooterRow extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="footer-row"]'))
	static properties = { domain: {}, domainHref: { attribute: 'domain-href' }, homeHref: { attribute: 'home-href' }, caps: { type: Boolean }, links: { type: Array }, label: { attribute: 'logo-label' } }
	/** The domain on the right. */
	domain = ''
	/** Where the domain links (https://<domain> by default). */
	domainHref?: string
	/** Where the lockup links. */
	homeHref?: string
	/** The domain in capitals. */
	caps = false
	/** Links between the lockup and the domain. */
	links: FooterLink[] = []
	/** The lockup's accessible name. */
	label = 'Spyglass'

	render() {
		const links = this.links ?? []
		const logo = html`<spyglass-logo height="20" aria-label=${this.label}></spyglass-logo>`
		return html`<div data-ds="footer-row" class="flex flex-wrap items-center justify-between gap-x-8 gap-y-6 text-fg">${this.homeHref ? html`<a href=${this.homeHref} aria-label=${this.label} class="rounded-control">${logo}</a>` : logo}${links.length ? html`<nav aria-label="Footer" class="max-sm:order-last max-sm:w-full"><ul class="flex flex-wrap gap-x-6 gap-y-2 type-ui">${links.map((l) => html`<li><a href=${l.href} class=${LINK}>${l.label}</a></li>`)}</ul></nav>` : nothing}<a href=${this.domainHref ?? `https://${this.domain}`} class=${['rounded-control text-fg', this.caps ? 'type-label' : 'type-ui'].join(' ')}>${this.domain}</a></div>`
	}
}

define('footer-row', FooterRow)
