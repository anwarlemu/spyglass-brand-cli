import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronDown } from 'lucide'
import { DsElement, define, tagName } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { firstFocusable, PopoverController, popoverStyles, within } from '@/elements/lib/popover'
import type { NavigationMenu } from '@/elements/components/ui/navigation-menu'
import styles from 'virtual:tw'

// NavigationMenuItem.tsx as <spyglass-navigation-menu-item>: one entry of a navigation menu: with content, a trigger
// and its panel of links (<spyglass-navigation-menu-link>); with `href` and no content, a plain link in the row
// (`active` for the page you are on). The open trigger takes the #262626 fill.
const WAIT = 150
const GRACE = 150
const ROW = 'inline-flex h-control-md cursor-pointer items-center gap-1.5 rounded-control px-4 type-ui-strong -outline-offset-2 transition-[background-color,color] duration-150 ease-standard max-md:h-control-touch'

/**
 * @summary One entry of a navigation menu: a trigger with a panel, or a link.
 * @slot - The panel's links.
 */
export class NavigationMenuItem extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, href: {}, active: { type: Boolean }, width: {} }

	/** The trigger's or the link's text. */
	label = ''
	/** A plain link in the row, when it has no panel. */
	href?: string
	/** The page you are on (a plain link). */
	active = false
	/** The panel's width (a CSS length). */
	width = '400px'
	private timer?: ReturnType<typeof setTimeout>
	private hovered = 0
	private wasOpen = false
	private pop = new PopoverController(this, {
		side: 'bottom',
		align: 'start',
		gap: 8,
		anchor: () => this.renderRoot.querySelector<HTMLElement>('[data-nav-trigger]'),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private get nav() {
		const n = this.closest(tagName('navigation-menu')) as NavigationMenu | null
		return n && typeof n.setActive === 'function' ? n : null
	}
	/** Focuses the trigger or the link (the menu's arrows). */
	focusTrigger() {
		this.renderRoot.querySelector<HTMLElement>('[data-nav-trigger]')?.focus()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
	}

	private move = (event: KeyboardEvent) => {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return false
		event.preventDefault()
		this.nav?.move(this, event.key === 'ArrowRight' ? 1 : -1)
		return true
	}
	private async openAt(keyboard: boolean, focus: boolean) {
		clearTimeout(this.timer)
		await this.pop.show({ keyboard })
		if (!focus) return
		const panel = this.renderRoot.querySelector<HTMLElement>('.ds-pop')
		;(firstFocusable(panel) ?? panel)?.focus({ preventScroll: true })
	}
	private enter = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		clearTimeout(this.timer)
		if (this.pop.open) return
		// Another panel open: switch at once.
		const nav = this.nav
		if (nav?.active && nav.active !== this) {
			this.hovered = Date.now()
			return void this.openAt(true, false)
		}
		// ds-latency: the wait keeps a passing pointer from opening it.
		this.timer = setTimeout(() => {
			this.hovered = Date.now()
			void this.openAt(false, false)
		}, WAIT)
	}
	private leave = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		clearTimeout(this.timer)
		// ds-latency: a grace to cross the gap into the panel.
		this.timer = setTimeout(() => this.pop.hide(), GRACE)
	}
	// A click toggles it; a click right after the pointer opened it keeps it open.
	private onClick = (event: MouseEvent) => {
		const keyboard = event.detail === 0
		if (this.pop.open) {
			if (!keyboard && Date.now() - this.hovered < 400) return
			this.pop.hide(keyboard, keyboard)
		} else void this.openAt(keyboard, keyboard)
	}
	private onKey = (event: KeyboardEvent) => {
		if (this.move(event)) return
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			void this.openAt(true, true)
		}
	}
	private onBlur = (event: FocusEvent) => {
		const next = event.relatedTarget as Node | null
		if (next && !within(this.renderRoot.querySelector('.ds-pop'), next) && !within(this.renderRoot.querySelector('[data-nav-trigger]'), next)) this.pop.hide()
	}

	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const nav = this.nav
		if (!nav) return
		if (this.pop.open !== this.wasOpen) {
			this.wasOpen = this.pop.open
			if (this.pop.open) nav.setActive(this)
			else if (nav.active === this) nav.setActive(null)
		}
		if (nav.active !== this && this.pop.open) this.pop.hide(false, true)
	}

	render() {
		if (!this.hasSlot()) {
			return html`<li data-ds="navigation-menu-item" class="flex"><a data-nav-trigger href=${ifDefined(this.href)} aria-current=${ifDefined(this.active ? 'page' : undefined)} class=${`${ROW} ${this.active ? 'text-fg' : 'text-fg-soft hover:bg-action-ghost-hover hover:text-fg'}`} @keydown=${this.move}>${this.label}</a></li>`
		}
		const panel = this.pop.rendered
			? html`<div data-ds="navigation-menu-item" popover="manual" class="ds-pop p-2" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width}`)} @pointerenter=${this.enter} @pointerleave=${this.leave} @focusout=${this.pop.onFocusOut}><slot></slot></div>`
			: nothing
		return html`<li data-ds="navigation-menu-item" class="flex" @pointerenter=${this.enter} @pointerleave=${this.leave}><button data-nav-trigger type="button" aria-expanded=${String(this.pop.open)} class=${`${ROW} text-fg-soft hover:not-aria-expanded:bg-action-ghost-hover hover:text-fg aria-expanded:bg-action-secondary aria-expanded:text-fg`} @click=${this.onClick} @keydown=${this.onKey} @blur=${this.onBlur}>${this.label}${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: 'shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>${panel}</li>`
	}
}

define('navigation-menu-item', NavigationMenuItem)
