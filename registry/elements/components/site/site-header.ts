import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { BAR, menuSheetStyles } from '@/elements/components/site/menu-sheet'
import { GLYPH, menuPanelsStyles } from '@/elements/components/site/menu-panels'
import { NAV_LINK, navMenusStyles } from '@/elements/components/site/nav-menus'
import { navIcon, navIconStyles } from '@/elements/components/site/nav-icon'
import { SHEET_LINK, sheetDisclosureStyles } from '@/elements/components/site/sheet-disclosure'
import { headerLabels, headerMenus, headerNav, type HeaderLabels, type HeaderMenus, type NavEntry } from '@/lib/site-header'
import '@/elements/components/site/menu-sheet'
import '@/elements/components/site/nav-menus'
import '@/elements/components/site/sheet-disclosure'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'
import { homeLinkClick } from '@/lib/home-link'

// SiteHeader.tsx as <spyglass-site-header>: the site's header, 64px (72 from 1024) in the page's container: the lockup,
// from 1280 the links and their menus (<spyglass-nav-menus>), the sign-in beside the White key; below 1280 the phone
// sheet (<spyglass-menu-sheet>) with the menus as disclosures. The bar takes a Black ground and a hairline once the page
// scrolls 8px. `hide-key-until` (a selector) keeps the key hidden until that element passes under the bar. `links`,
// `menus`, `cta`, `secondary`, `labels` (JSON); `home-href`, `logo-label`, `variant` (default, centered, minimal),
// `sticky` (sticky="false" to scroll away).
export type HeaderLink = NavEntry
export interface HeaderAction { label: string; href: string; short?: string }

const GRID = { default: 'xl:grid xl:grid-cols-[1fr_auto_1fr]', centered: 'lg:grid lg:grid-cols-[1fr_auto_1fr]', minimal: '' }
const SIGN_IN = { default: 'hidden xl:flex', centered: 'hidden lg:flex', minimal: 'hidden' }
const FROM = { default: 1280, centered: 1024, minimal: 1280 }

/** @summary The website header: lockup, links with their dropdown menus, sign-in and the key; the phone sheet. */
export class SiteHeader extends DsElement {
	static styles = [DsElement.styles, navIconStyles, menuPanelsStyles, navMenusStyles, sheetDisclosureStyles, menuSheetStyles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="site-header"]'))
	static properties = {
		links: { type: Array },
		menus: { type: Object },
		cta: { type: Object },
		secondary: { type: Object },
		homeHref: { attribute: 'home-href' },
		label: { attribute: 'logo-label' },
		variant: {},
		hideKeyUntil: { attribute: 'hide-key-until' },
		sticky: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		labels: { type: Object },
		scrolled: { state: true },
		shown: { state: true },
		instant: { state: true },
	}
	/** The links; entries with `menu` (products, useCases, resources) open that menu. */
	links: HeaderLink[] = headerNav
	menus: HeaderMenus = headerMenus
	/** The White key ({ label, href, short? }). */
	cta?: HeaderAction = { label: 'Get a free API key', href: '#start', short: 'Get API key' }
	/** The sign-in before it ({ label, href }). */
	secondary?: HeaderAction = { label: 'Sign in', href: '#sign-in' }
	homeHref = '/'
	/** The lockup's accessible name. */
	label = 'Spyglass'
	/** default (links and menus from 1280), centered (from 1024) or minimal (the lockup and the key only). */
	variant: 'default' | 'centered' | 'minimal' = 'default'
	/** Keep the key hidden until the element this selector finds has passed under the bar. */
	hideKeyUntil?: string
	sticky = true
	labels: HeaderLabels = headerLabels
	private scrolled = false
	private shown: 'shown' | 'hidden' = 'shown'
	private instant = true
	private observer?: IntersectionObserver
	private frame = 0
	private top = -1

	private onScroll = () => {
		const next = window.scrollY > 8
		if (next !== this.scrolled) this.scrolled = next
	}
	private bar() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(window.matchMedia('(min-width: 1024px)').matches ? '--ds-size-header' : '--ds-header-bar-phone')) || 0 }
	private state(rect: DOMRectReadOnly | null, top: number): 'shown' | 'hidden' { return !rect || (!rect.width && !rect.height) || rect.top < top ? 'shown' : 'hidden' }
	private watch = () => {
		const hero = this.hideKeyUntil ? document.querySelector(this.hideKeyUntil) : null
		if (!hero) return
		const next = this.bar()
		if (next === this.top) return
		this.top = next
		this.observer?.disconnect()
		this.observer = new IntersectionObserver(([entry]) => {
			if (!entry) return
			this.shown = this.state(entry.boundingClientRect, this.top)
			if (!this.frame) this.frame = requestAnimationFrame(() => (this.instant = false))
		}, { rootMargin: `-${this.top}px 0px 0px 0px`, threshold: [0, 1] })
		this.observer.observe(hero)
	}

	connectedCallback() {
		super.connectedCallback()
		this.onScroll()
		window.addEventListener('scroll', this.onScroll, { passive: true })
		window.addEventListener('resize', this.watch)
		const hero = this.hideKeyUntil ? document.querySelector(this.hideKeyUntil) : null
		this.shown = this.state(hero?.getBoundingClientRect() ?? null, this.bar())
		this.instant = true
		this.frame = requestAnimationFrame(() => (this.instant = false))
		this.top = -1
		this.watch()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		window.removeEventListener('scroll', this.onScroll)
		window.removeEventListener('resize', this.watch)
		this.observer?.disconnect()
		cancelAnimationFrame(this.frame)
	}

	private sheetRows(entry: NavEntry) {
		const menus = this.menus ?? headerMenus
		if (entry.menu === 'products') { const m = menus.products ?? headerMenus.products; return [...m.offers, ...(m.soon ? [m.soon] : [])].map((r) => ({ key: r.key, name: r.name, href: r.href, icon: r.icon })) }
		if (entry.menu === 'useCases') return (menus.useCases ?? headerMenus.useCases).rows.map((r) => ({ key: r.key, name: r.name, href: r.href, icon: r.icon }))
		return []
	}

	render() {
		const variant = this.variant in GRID ? this.variant : 'default'
		const links = this.links ?? headerNav
		const menus = this.menus ?? headerMenus
		const labels = this.labels ?? headerLabels
		const hidden = this.shown === 'hidden'
		const cta = this.cta
		const secondary = this.secondary
		const brand = (slot?: string) => html`<a slot=${ifDefined(slot)} href=${this.homeHref} aria-label=${this.label} data-home-link @click=${homeLinkClick} class="-ms-2 block flex-none rounded-ds-sm px-2 py-3 text-fg md:-ms-3 md:px-3 md:py-2 lg:py-3 xl:justify-self-start"><spyglass-logo height="20" aria-label=${this.label}></spyglass-logo></a>`
		const key = () => (cta ? html`<spyglass-button href=${cta.href} size="xs" class="ds-key"><span class="ds-key-full truncate">${cta.label}</span><span class="ds-key-short truncate">${cta.short ?? cta.label}</span></spyglass-button>` : nothing)
		return html`<header data-ds="site-header" data-variant=${variant} class=${`ds-site-header z-20 text-fg ${this.sticky ? 'sticky top-0' : 'relative'}`}><span aria-hidden="true" data-on=${ifDefined(this.scrolled ? '' : undefined)} class="pointer-events-none absolute inset-0 border-b border-edge bg-surface opacity-0 transition-opacity duration-160 ease-out data-on:opacity-100"></span><div class=${`${BAR} ${GRID[variant]}`.trim()}>${brand()}${variant !== 'minimal' ? html`<spyglass-nav-menus .links=${links} .menus=${menus} label=${labels.nav} from=${FROM[variant]}></spyglass-nav-menus>` : nothing}<div class="ds-actions flex min-w-0 flex-[0_1_auto] items-center gap-1 md:gap-2 xl:min-w-auto xl:justify-self-end xl:gap-3"><div data-key=${this.shown} data-instant=${ifDefined(this.instant ? '' : undefined)} class="ds-key-slot relative flex min-w-0 flex-[0_1_auto]"><div class="ds-key-room pointer-events-none absolute inset-0">${secondary ? html`<a href=${secondary.href} class=${`${NAV_LINK} ${SIGN_IN[variant]} pointer-events-auto absolute inset-y-0 right-[calc(100%+var(--ds-space-md))] my-auto px-3 whitespace-nowrap`}>${secondary.label}</a>` : nothing}</div><div ?inert=${hidden} aria-hidden=${ifDefined(hidden ? 'true' : undefined)} class="ds-key-box flex min-w-0">${key()}</div></div>${variant !== 'minimal' ? html`<spyglass-menu-sheet label=${labels.menu} close-label=${labels.close} until=${FROM[variant]}>${brand('brand')}<div slot="action" class="flex min-w-0 flex-[0_1_auto]">${key()}</div><nav aria-label=${labels.nav} class="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)"><ul>${links.map((entry) => html`<li class="flex flex-col border-t border-edge first:border-t-0 last:border-b">${entry.menu && entry.menu !== 'resources' ? html`<spyglass-sheet-disclosure label=${entry.label}><ul class="grid gap-x-4 pb-2 md:grid-cols-2">${this.sheetRows(entry).map((row) => html`<li><a href=${row.href} class="-mx-2 flex min-h-12 items-center gap-3 rounded-control px-2 type-body text-fg transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-space-xs))] hover:text-fg-soft active:text-fg-soft"><span class=${`${GLYPH} size-8 rounded-ds-sm`}>${navIcon(row.icon)}</span>${row.name}</a></li>`)}</ul></spyglass-sheet-disclosure>` : html`<a href=${ifDefined(entry.menu === 'resources' ? (menus.resources ?? headerMenus.resources).all.href : entry.href)} aria-current=${ifDefined(entry.current ? 'page' : undefined)} class=${SHEET_LINK}>${entry.label}</a>`}</li>`)}</ul></nav>${secondary ? html`<spyglass-button slot="foot" href=${secondary.href} variant="secondary" class="w-full">${secondary.label}</spyglass-button>` : nothing}${cta ? html`<div slot="foot" class="contents md:hidden"><spyglass-button href=${cta.href} class="w-full">${cta.label}</spyglass-button></div>` : nothing}</spyglass-menu-sheet>` : nothing}</div></div></header>`
	}
}

define('site-header', SiteHeader)
