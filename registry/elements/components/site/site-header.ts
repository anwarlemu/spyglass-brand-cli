import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Menu, X } from 'lucide'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// SiteHeader.tsx as <spyglass-site-header>: the lockup, the page links (`links`, a list of { label, href, current }),
// a `secondary` in the links' style and the White 36px `cta` ({ label, href } each), as the site's header: 64px, 72px
// from 1024, the links shown from 1024 and centered from 1280. Below 1024px the links fold behind a menu button whose
// panel opens in place without motion; Escape closes it and returns focus to the button.
export interface HeaderLink { label: string; href: string; current?: boolean }
export interface HeaderAction { label: string; href: string }

// The bar's links take h-control-xs and their padding; the folded panel's take the touch height.
const BAR = 'h-control-xs px-4'
const LINK = 'flex items-center rounded-control type-ui text-fg-soft transition-[color,background-color] duration-160 ease-standard hover:bg-surface-raised hover:text-fg aria-[current=page]:text-fg'

/**
 * @summary A website header: lockup, links, sign-in and the White button; a menu on phones.
 */
export class SiteHeader extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="site-header"]'))
	static properties = { links: { type: Array }, cta: { type: Object }, secondary: { type: Object }, homeHref: { attribute: 'home-href' }, label: { attribute: 'logo-label' }, open: { state: true } }
	links: HeaderLink[] = []
	/** The White button on the right ({ label, href }). */
	cta?: HeaderAction
	/** A ghost link before it ({ label, href }). */
	secondary?: HeaderAction
	/** Where the lockup links. */
	homeHref = '/'
	/** The lockup's accessible name. */
	label = 'Spyglass'
	private open = false
	private panelId = uid('site-menu')

	private onKey = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !this.open) return
		this.open = false
		this.renderRoot.querySelector<HTMLElement>('[data-menu-toggle]')?.shadowRoot?.querySelector<HTMLElement>('button')?.focus()
	}
	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this.onKey)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('keydown', this.onKey)
	}

	render() {
		const links = this.links ?? []
		const folded = links.length > 0 || !!this.secondary
		const link = (l: HeaderLink, extra = '') => html`<li><a href=${l.href} aria-current=${ifDefined(l.current ? 'page' : undefined)} class=${extra ? `${LINK} ${extra}` : LINK}>${l.label}</a></li>`
		return html`<header data-ds="site-header" class="relative flex h-16 items-center gap-8 text-fg lg:h-header xl:grid xl:grid-cols-[1fr_auto_1fr] xl:gap-4"><a href=${this.homeHref} aria-label=${this.label} class="shrink-0 justify-self-start rounded-control"><spyglass-logo height="20" aria-label=${this.label}></spyglass-logo></a>${links.length ? html`<nav aria-label="Main" class="max-lg:hidden"><ul class="flex items-center gap-1">${links.map((l) => link(l, BAR))}</ul></nav>` : nothing}<div class="ml-auto flex items-center gap-2 justify-self-end">${this.secondary ? html`<div class="flex max-lg:hidden"><a href=${this.secondary.href} class=${`${LINK} h-control-xs px-3`}>${this.secondary.label}</a></div>` : nothing}${this.cta ? html`<spyglass-button href=${this.cta.href} size="xs">${this.cta.label}</spyglass-button>` : nothing}${folded ? html`<div class="flex lg:hidden"><spyglass-button data-menu-toggle variant="ghost" size="xs" icon aria-label=${this.open ? 'Close the menu' : 'Open the menu'} .expanded=${String(this.open)} .controls=${this.panelId} @click=${() => (this.open = !this.open)}>${this.open ? icon(X, 'x', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } }) : icon(Menu, 'menu', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</spyglass-button></div>` : nothing}</div>${folded ? html`<div id=${this.panelId} ?hidden=${!this.open} class="absolute inset-x-0 top-full z-20 border-b border-edge bg-surface pt-2 pb-6 lg:hidden"><ul class="grid gap-1">${links.map((l) => link(l, 'h-control-touch px-3'))}${this.secondary ? link({ label: this.secondary.label, href: this.secondary.href }, 'h-control-touch px-3') : nothing}</ul></div>` : nothing}</header>`
	}
}

define('site-header', SiteHeader)
