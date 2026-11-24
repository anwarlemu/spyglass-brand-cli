import { html, nothing, type TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { chevron, navIconStyles } from '@/elements/components/site/nav-icon'
import { menuPanelsStyles, resourcesPanel, useCasesPanel } from '@/elements/components/site/menu-panels'
import { LiveState, productsLivePanelStyles, productsPanel } from '@/elements/components/site/products-live-panel'
import { headerMenus, headerNav, MENU_GRACE_MS, MENU_INTENT_MS, type HeaderMenus, type MenuKey, type NavEntry } from '@/lib/site-header'
import styles from 'virtual:tw'

// NavMenus.tsx as <spyglass-nav-menus>: the header's links and their three menus, in one shadow root. Under a mouse a
// menu opens after 80ms and swaps at once once one is open; leaving closes it after 240ms; a click opens and keeps it;
// Enter, Space or ArrowDown open it with focus on its first link (ArrowUp its last); arrows, Home and End move through
// it; Escape closes it and gives focus back; a click or focus outside closes it. From the keyboard or when swapping the
// panel appears at once. `links` and `menus` (JSON), `label`, `from` (the width it shows from).
export const navMenusStyles = styles
export const NAV_LINK = 'relative flex h-control-xs items-center rounded-control px-4 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out after:absolute after:inset-x-0 after:-inset-y-1 hover:bg-surface-raised hover:text-fg focus-visible:text-fg active:text-fg aria-[current=page]:text-fg'

const WIDTH: Record<MenuKey, string> = {
	products: 'w-[min(var(--ds-header-menu-products-w),calc(100vw-2*var(--ds-layout-gutter)))]',
	useCases: 'w-[min(var(--ds-header-menu-cases-w),calc(100vw-2*var(--ds-layout-gutter)))]',
	resources: 'w-[min(var(--ds-header-menu-resources-w),calc(100vw-2*var(--ds-layout-gutter)))]',
}

type Via = 'hover' | 'click'

/** @summary The header's links and dropdown menus. */
export class NavMenus extends DsElement {
	static styles = [DsElement.styles, navIconStyles, menuPanelsStyles, productsLivePanelStyles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="nav-menus"]'))
	static properties = { links: { type: Array }, menus: { type: Object }, label: {}, from: { type: Number }, open: { state: true }, instant: { state: true }, cases: { state: true } }
	/** The links; entries with `menu` open that menu. */
	links: NavEntry[] = headerNav
	menus: HeaderMenus = headerMenus
	/** The nav's accessible name. */
	label = 'Main'
	/** The width the menus show from. */
	from = 1280
	private open: MenuKey | null = null
	private instant = false
	private cases = 0
	private live = new LiveState(() => this.requestUpdate())
	private via: Via = 'click'
	private timer: number | undefined
	private pendingFocus: 'first' | 'last' | null = null
	private navId = uid('nav')
	private wide?: MediaQueryList

	private get nav() { return this.renderRoot.querySelector<HTMLElement>('nav') }
	private panelEl(key: MenuKey) { return this.renderRoot.querySelector<HTMLElement>(`#${this.navId}-${key}`) }
	private trigger(key: MenuKey) { return this.renderRoot.querySelector<HTMLButtonElement>(`[aria-controls="${this.navId}-${key}"]`) }
	private deepActive() { return (this.renderRoot as ShadowRoot).activeElement as HTMLElement | null }
	private items(key: MenuKey) {
		const panel = this.panelEl(key)
		return panel ? [...panel.querySelectorAll<HTMLElement>('a[href]:not([tabindex="-1"])')].filter((a) => a.getClientRects().length > 0) : []
	}

	private onKey = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !this.open) return
		const key = this.open
		const hadFocus = Boolean(this.deepActive())
		this.hide()
		if (hadFocus) this.trigger(key)?.focus()
	}
	private onDown = (e: PointerEvent) => { if (this.open && this.nav && !e.composedPath().includes(this.nav)) this.hide() }
	private onNarrow = () => { if (this.wide && !this.wide.matches && this.open) this.hide() }

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('keydown', this.onKey)
		document.addEventListener('pointerdown', this.onDown)
		this.wide = window.matchMedia(`(min-width: ${this.from}px)`)
		this.wide.addEventListener('change', this.onNarrow)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('keydown', this.onKey)
		document.removeEventListener('pointerdown', this.onDown)
		this.wide?.removeEventListener('change', this.onNarrow)
		clearTimeout(this.timer)
		this.live.stop()
	}

	protected updated(changed: Map<string, unknown>) {
		super.updated(changed as never)
		if (changed.has('open') && this.open && this.pendingFocus) {
			const items = this.items(this.open)
			const target = this.pendingFocus === 'first' ? items[0] : items[items.length - 1]
			this.pendingFocus = null
			target?.focus()
		}
	}

	private clearTimer() {
		clearTimeout(this.timer)
		this.timer = undefined
	}
	private show(key: MenuKey, how: Via, keyboard = false) {
		this.clearTimer()
		this.via = how
		this.instant = keyboard || (this.open !== null && this.open !== key)
		this.open = key
	}
	private hide() {
		this.clearTimer()
		this.instant = false
		this.open = null
	}

	private onTriggerClick(key: MenuKey, e: MouseEvent) {
		this.clearTimer()
		const keyboard = e.detail === 0
		if (this.open === key) {
			if (this.via === 'hover' && !keyboard) {
				this.via = 'click'
				return
			}
			this.hide()
			return
		}
		if (keyboard) this.pendingFocus = 'first'
		this.show(key, 'click', keyboard)
	}
	private onTriggerKeyDown(key: MenuKey, e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
		e.preventDefault()
		if (this.open === key) {
			const items = this.items(key)
			;(e.key === 'ArrowDown' ? items[0] : items[items.length - 1])?.focus()
			return
		}
		this.pendingFocus = e.key === 'ArrowDown' ? 'first' : 'last'
		this.show(key, 'click', true)
	}
	private onTriggerEnter(key: MenuKey, e: PointerEvent) {
		if (e.pointerType !== 'mouse') return
		this.clearTimer()
		if (this.open) {
			if (this.open !== key) this.show(key, 'hover')
			return
		}
		this.timer = window.setTimeout(() => this.show(key, 'hover'), MENU_INTENT_MS)
	}
	private onTriggerLeave(e: PointerEvent) { if (e.pointerType === 'mouse' && !this.open) this.clearTimer() }
	private onNavEnter(e: PointerEvent) { if (e.pointerType === 'mouse' && this.open) this.clearTimer() }
	private onNavLeave(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return
		this.clearTimer()
		if (this.open && this.via === 'hover') this.timer = window.setTimeout(() => this.hide(), MENU_GRACE_MS)
	}
	private onNavBlur(e: FocusEvent) { if (this.open && !this.nav?.contains(e.relatedTarget as Node | null)) this.hide() }
	private onPanelKeyDown(key: MenuKey, e: KeyboardEvent) {
		const items = this.items(key)
		const at = items.indexOf(this.deepActive() as HTMLElement)
		if (at < 0) return
		let next = -1
		if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(at + 1, items.length - 1)
		else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(at - 1, 0)
		else if (e.key === 'Home') next = 0
		else if (e.key === 'End') next = items.length - 1
		if (next < 0) return
		e.preventDefault()
		items[next]?.focus()
	}

	private panel(key: MenuKey, body: TemplateResult) {
		return html`<div id=${`${this.navId}-${key}`} data-open=${ifDefined(this.open === key ? '' : undefined)} ?inert=${this.open !== key} @keydown=${(e: KeyboardEvent) => this.onPanelKeyDown(key, e)} @click=${(e: MouseEvent) => { if (e.composedPath().some((n) => n instanceof HTMLAnchorElement)) this.hide() }} class=${`ds-menu-panel absolute top-[calc(100%+var(--ds-header-menu-gap))] left-1/2 z-20 rounded-control border border-edge bg-surface-subtle text-fg before:absolute before:inset-x-0 before:bottom-full before:h-(--ds-header-menu-gap) ${WIDTH[key]}`}>${body}</div>`
	}

	render() {
		const entries = this.links ?? headerNav
		const menus = this.menus ?? headerMenus
		const has = (key: MenuKey) => entries.some((e) => e.menu === key) && Boolean(menus[key] ?? headerMenus[key])
		return html`<nav data-ds="nav-menus" aria-label=${this.label} data-instant=${ifDefined(this.instant ? '' : undefined)} @pointerenter=${this.onNavEnter} @pointerleave=${this.onNavLeave} @focusout=${this.onNavBlur} class=${`ds-nav-menus relative ${this.from === 1024 ? 'hidden lg:block' : 'hidden xl:block'}`}><ul class="flex gap-1">${entries.map((item) => item.menu ? html`<li class=${ifDefined(item.menu === 'resources' ? 'relative' : undefined)}><button type="button" aria-expanded=${String(this.open === item.menu)} aria-controls=${`${this.navId}-${item.menu}`} @click=${(e: MouseEvent) => this.onTriggerClick(item.menu!, e)} @keydown=${(e: KeyboardEvent) => this.onTriggerKeyDown(item.menu!, e)} @pointerenter=${(e: PointerEvent) => this.onTriggerEnter(item.menu!, e)} @pointerleave=${this.onTriggerLeave} class=${`${NAV_LINK} cursor-pointer gap-1 aria-expanded:bg-surface-raised aria-expanded:text-fg`}>${item.label}${chevron(12, 'ds-nav-chevron')}</button>${item.menu === 'resources' && has('resources') ? this.panel('resources', resourcesPanel(menus.resources ?? headerMenus.resources)) : nothing}</li>` : html`<li><a class=${NAV_LINK} href=${ifDefined(item.href)} aria-current=${ifDefined(item.current ? 'page' : undefined)}>${item.label}</a></li>`)}</ul>${has('products') ? this.panel('products', productsPanel(menus.products ?? headerMenus.products, this.live.active, this.live.leaving, (i) => this.live.show(i))) : nothing}${has('useCases') ? this.panel('useCases', useCasesPanel(menus.useCases ?? headerMenus.useCases, this.cases, (i) => (this.cases = i))) : nothing}</nav>`
	}
}

define('nav-menus', NavMenus)
