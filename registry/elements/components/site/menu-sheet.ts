import { html } from 'lit'
import { DsElement, define, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// MenuSheet.tsx as <spyglass-menu-sheet>: the 48px menu button and the phone sheet, a modal dialog revealed downward from
// the bar, with the `brand`, `action` and close button in its bar, the default slot scrolling in the middle and the
// `foot` pinned under a hairline. Focus moves in (to the close button from the keyboard) and Tab wraps inside; Escape
// or the close button closes it and gives focus back; following a link closes it; the page does not scroll under it.
// `label`, `close-label`, `until` (1280 or 1024: it hides and closes from there).
export const menuSheetStyles = styles
export const BAR = 'relative mx-auto flex h-16 w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] items-center justify-between px-(--ds-layout-gutter) lg:h-header'
const MENU_BUTTON = 'ds-menu-button grid size-12 flex-none cursor-pointer place-items-center rounded-control -me-3 text-fg outline-offset-[calc(-1*var(--ds-space-xs))]'

const glyph = html`<span aria-hidden="true" class="ds-menu-glyph relative block h-3 w-6"><span></span><span></span></span>`

function unlock(dialog: HTMLDialogElement | null) {
	const root = document.documentElement
	root.style.overflow = ''
	root.style.paddingRight = ''
	dialog?.style.removeProperty('--scrollbar-w')
}

/**
 * @summary The phone menu: a button that opens the sheet.
 * @slot brand - The lockup link in the sheet's bar.
 * @slot action - Beside the close button.
 * @slot - The links.
 * @slot foot - Pinned at the foot.
 */
export class MenuSheet extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { label: {}, closeLabel: { attribute: 'close-label' }, until: { type: Number }, open: { state: true } }
	label = 'Menu'
	closeLabel = 'Close menu'
	/** The width it hides and closes at (1280 or 1024). */
	until = 1280
	private open = false
	private sheetId = uid('sheet')
	private followed = false
	private wide?: MediaQueryList

	private get dialog() { return this.renderRoot.querySelector<HTMLDialogElement>('dialog') }
	private get trigger() { return this.renderRoot.querySelector<HTMLButtonElement>('[aria-haspopup]') }
	private get closer() { return this.renderRoot.querySelector<HTMLButtonElement>('[data-close]') }

	private onWide = () => { if (this.wide?.matches && this.dialog?.open) this.closeMenu() }

	connectedCallback() {
		super.connectedCallback()
		this.wide = window.matchMedia(`(min-width: ${this.until}px)`)
		this.wide.addEventListener('change', this.onWide)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.wide?.removeEventListener('change', this.onWide)
		unlock(this.dialog)
	}

	private openMenu(e: MouseEvent) {
		const dialog = this.dialog
		if (!dialog || dialog.open) return
		this.followed = false
		const root = document.documentElement
		const bar = window.innerWidth - root.clientWidth
		root.style.overflow = 'hidden'
		root.style.paddingRight = `${bar}px`
		dialog.style.setProperty('--scrollbar-w', `${bar}px`)
		dialog.showModal()
		if (e.detail === 0) this.closer?.focus()
		else dialog.focus()
		this.open = true
	}
	private closeMenu() {
		unlock(this.dialog)
		this.dialog?.close()
	}
	private onClose() {
		unlock(this.dialog)
		this.open = false
		if (!this.followed) this.trigger?.focus({ preventScroll: true })
	}
	private onClick(e: MouseEvent) {
		if (!e.composedPath().some((n) => n instanceof HTMLAnchorElement)) return
		this.followed = true
		this.closeMenu()
	}

	// The focusable stops in the order they show: what is slotted in the bar, the close button, the links (a closed
	// disclosure gives only its own button), the foot. Elements that draw their control in a shadow root give that.
	private stops() {
		const out: HTMLElement[] = []
		const walk = (el: Element) => {
			if (!(el instanceof HTMLElement)) return
			if (el.localName.endsWith('-sheet-disclosure')) {
				const toggle = el.shadowRoot?.querySelector<HTMLElement>('button')
				if (toggle) out.push(toggle)
				if (el.hasAttribute('open')) for (const c of el.children) walk(c)
				return
			}
			if (el.shadowRoot && el.localName.endsWith('-button')) {
				const inner = el.shadowRoot.querySelector<HTMLElement>('a[href], button')
				if (inner) out.push(inner)
				return
			}
			if (el.matches('a[href], button')) {
				out.push(el)
				return
			}
			for (const c of el.children) walk(c)
		}
		const from = (name: string) => {
			const slot = this.renderRoot.querySelector<HTMLSlotElement>(name ? `slot[name="${name}"]` : 'slot:not([name])')
			for (const el of slot?.assignedElements({ flatten: true }) ?? []) walk(el)
		}
		from('brand')
		from('action')
		if (this.closer) out.push(this.closer)
		from('')
		from('foot')
		return out.filter((el) => el.getClientRects().length > 0)
	}
	private deepActive() {
		let a: Element | null = document.activeElement
		while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
		return a
	}
	private onKeyDown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return
		const stops = this.stops()
		const first = stops[0]
		const last = stops[stops.length - 1]
		if (!first || !last) return
		const active = this.deepActive()
		if (active === this.dialog) {
			e.preventDefault()
			;(e.shiftKey ? last : first).focus()
		} else if (e.shiftKey && active === first) {
			e.preventDefault()
			last.focus()
		} else if (!e.shiftKey && active === last) {
			e.preventDefault()
			first.focus()
		}
	}

	render() {
		return html`<div data-ds="menu-sheet" class=${`contents ${this.until === 1024 ? 'lg:hidden' : 'xl:hidden'}`}><button type="button" aria-haspopup="dialog" aria-expanded=${String(this.open)} aria-controls=${this.sheetId} @click=${this.openMenu} class=${MENU_BUTTON}><span class="sr-only">${this.label}</span>${glyph}</button><dialog id=${this.sheetId} aria-label=${this.label} tabindex="-1" @close=${this.onClose} @click=${this.onClick} @keydown=${this.onKeyDown} class="ds-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 pe-(--scrollbar-w,0) text-fg outline-none"><div class="flex h-full flex-col"><div class=${`${BAR} flex-none after:absolute after:inset-x-0 after:bottom-0 after:border-t after:border-edge`}><slot name="brand"></slot><div class="flex min-w-0 flex-[0_1_auto] items-center gap-1 md:gap-2"><slot name="action"></slot><button data-close type="button" @click=${this.closeMenu} class=${MENU_BUTTON}><span class="sr-only">${this.closeLabel}</span>${glyph}</button></div></div><div class="fade-y flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"><slot></slot></div><div class="relative mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-none flex-col gap-2 px-(--ds-layout-gutter) pt-4 pb-[max(var(--ds-space-lg),env(safe-area-inset-bottom))] before:absolute before:inset-x-0 before:top-0 before:border-t before:border-edge"><slot name="foot"></slot></div></div></dialog></div>`
	}
}

define('menu-sheet', MenuSheet)
