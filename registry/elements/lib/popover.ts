import { css, type ReactiveController, type ReactiveControllerHost } from 'lit'
import { enter, leave } from './transition'

// usePopover and PopoverPanel for elements: the floating panel every overlay draws (popover, the listboxes, and the
// tooltip, hover card, context menu, menubar and date picker as they are ported). The panel lives in the element's own
// shadow root, so its content keeps the element's styles, and opens in the top layer (popover="manual"), so no
// overflow or stacking clips it and it sits over an open modal dialog. Placement, the anchor it grows from, Escape for
// the topmost panel only, a press outside and focus leaving are usePopover's.
//
//   pop = new PopoverController(this, { anchor: () => this.trigger, panel: () => this.renderRoot.querySelector('.ds-pop'), align: 'end' })
//   render: ${pop.rendered ? html`<div popover="manual" class="ds-pop p-3" data-side=${pop.pos.side} style=${pop.style()} ...>` : nothing}
//   static styles = [DsElement.styles, popoverStyles, styles]
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'
export interface PopoverOptions {
	side?: Side
	align?: Align
	/** Space between the anchor and the panel (4px, as Menu's panel). */
	gap?: number
	/** The panel at least as wide as its anchor (selects, the date field). */
	matchWidth?: boolean
	/** A press outside, or focus leaving, keeps it open (a tooltip closes itself). */
	sticky?: boolean
}
interface Box { left: number, top: number, right: number, bottom: number, width: number, height: number }

const MARGIN = 8
const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(n, hi))

/** Where a w by h panel goes beside `a` in a vw by vh viewport: the side asked for, or its opposite when only that fits. */
export function place(a: Box, w: number, h: number, vw: number, vh: number, side: Side, align: Align, gap: number) {
	const room: Record<Side, number> = { top: a.top - MARGIN, bottom: vh - a.bottom - MARGIN, left: a.left - MARGIN, right: vw - a.right - MARGIN }
	const need = (side === 'top' || side === 'bottom' ? h : w) + gap
	const s = room[side] < need && room[OPPOSITE[side]] > room[side] ? OPPOSITE[side] : side
	let x: number
	let y: number
	if (s === 'top' || s === 'bottom') {
		y = s === 'bottom' ? a.bottom + gap : a.top - gap - h
		x = align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + a.width / 2 - w / 2
	} else {
		x = s === 'right' ? a.right + gap : a.left - gap - w
		y = align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + a.height / 2 - h / 2
	}
	x = Math.max(MARGIN, Math.min(x, vw - w - MARGIN))
	y = Math.max(MARGIN, Math.min(y, vh - h - MARGIN))
	const ox = s === 'left' ? w : s === 'right' ? 0 : clamp(a.left + a.width / 2 - x, 0, w)
	const oy = s === 'top' ? h : s === 'bottom' ? 0 : clamp(a.top + a.height / 2 - y, 0, h)
	return { x: Math.round(x), y: Math.round(y), side: s, origin: `${Math.round(ox)}px ${Math.round(oy)}px` }
}

/** Whether `node` is `container` or inside it in the flat tree (through slots and shadow roots). */
export function within(container: Node | null | undefined, node: Node | null | undefined) {
	let n: Node | null | undefined = node
	while (n) {
		if (n === container) return true
		n = (n as Element).assignedSlot ?? n.parentNode ?? (n as ShadowRoot).host
	}
	return false
}

/** The box an element draws: itself, or, for an element whose host is display: contents (most of the library's), the
 * first box in its shadow root. A panel placed beside <conare-button> measures the button it draws. */
export function boxOf(el: Element | null | undefined): HTMLElement | null {
	let n = el ?? null
	for (let i = 0; n && i < 8 && getComputedStyle(n).display === 'contents'; i++) n = [...(n.shadowRoot?.children ?? n.children)].find((c) => c.localName !== 'style' && c.localName !== 'slot') ?? null
	return n as HTMLElement | null
}

/** The first thing in `root` that takes focus, through slots into the page's content and into elements. */
export function firstFocusable(root: Element | null | undefined): HTMLElement | null {
	if (!root) return null
	const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
	const walk = (el: Element): HTMLElement | null => {
		if (el.matches(FOCUSABLE) && el.getClientRects().length > 0) return el as HTMLElement
		if (el.shadowRoot && (el.shadowRoot as ShadowRoot & { delegatesFocus?: boolean }).delegatesFocus) {
			for (const c of el.shadowRoot.children) if (walk(c)) return el as HTMLElement
		}
		const kids = el.localName === 'slot' ? (el as HTMLSlotElement).assignedElements({ flatten: true }) : [...(el.shadowRoot?.children ?? el.children)]
		for (const c of kids) {
			const hit = walk(c)
			if (hit) return hit
		}
		return null
	}
	for (const c of root.children) {
		const hit = walk(c)
		if (hit) return hit
	}
	return null
}

// Open panels, the newest last: Escape belongs to the last. One list for every element on the page (shared.js).
const stack: object[] = []

export interface PopoverPosition { x: number, y: number, side: Side, origin: string, minWidth: number, placed: boolean }

export class PopoverController implements ReactiveController {
	open = false
	/** Opened from the keyboard (or closed by it): no animation. */
	instant = false
	/** In the page: from show() until its leave has ended. */
	rendered = false
	pos: PopoverPosition
	private point: { x: number, y: number } | null = null
	private returnTo: HTMLElement | null = null
	private frame = 0
	private ro?: ResizeObserver
	private shown?: () => void
	private generation = 0

	constructor(private host: ReactiveControllerHost & HTMLElement, private o: PopoverOptions & { anchor: () => HTMLElement | null | undefined, panel: () => HTMLElement | null | undefined }) {
		this.pos = { x: 0, y: 0, side: o.side ?? 'bottom', origin: '0px 0px', minWidth: 0, placed: false }
		host.addController(this)
	}

	/** Changes the options (an element's side and align attributes). */
	configure(options: PopoverOptions) {
		Object.assign(this.o, options)
	}

	/** The panel's inline position, for its style attribute. */
	style(extra = '') {
		const p = this.pos
		return `${extra ? `${extra}; ` : ''}left: ${p.x}px; top: ${p.y}px; transform-origin: ${p.origin}${p.minWidth ? `; min-width: ${p.minWidth}px` : ''}`
	}

	update = () => {
		const el = this.o.panel()
		const a = this.point ? { left: this.point.x, top: this.point.y, right: this.point.x, bottom: this.point.y, width: 0, height: 0 } : this.o.anchor()?.getBoundingClientRect()
		if (!el || !a) return
		const minWidth = this.o.matchWidth && !this.point ? a.width : 0
		el.style.minWidth = minWidth ? `${minWidth}px` : ''
		const w = Math.max(el.offsetWidth, minWidth)
		const p = place(a, w, el.offsetHeight, document.documentElement.clientWidth, window.innerHeight, this.o.side ?? 'bottom', this.o.align ?? 'start', this.o.gap ?? 4)
		this.pos = { ...p, minWidth, placed: true }
		this.host.requestUpdate()
	}
	private schedule = () => {
		cancelAnimationFrame(this.frame)
		this.frame = requestAnimationFrame(this.update)
	}

	/** Opens it; `at` puts it at a point (a context menu), `keyboard` skips the animation. It resolves once the panel is
	 * placed and visible, so focus can move into it. */
	show(how: { keyboard?: boolean, at?: { x: number, y: number } } = {}): Promise<void> {
		let a = document.activeElement as Element | null
		while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
		this.returnTo = a instanceof HTMLElement ? a : null
		this.point = how.at ?? null
		this.instant = !!how.keyboard
		this.pos = { ...this.pos, placed: false }
		this.open = true
		this.rendered = true
		this.generation++
		this.host.requestUpdate()
		return new Promise((resolve) => { this.shown = resolve })
	}
	/** Closes it; `refocus` returns focus to what opened it, `keyboard` closes at once. */
	hide(refocus = false, keyboard = false) {
		if (!this.open) return
		this.instant = keyboard
		this.open = false
		this.stop()
		const panel = this.o.panel()
		const gen = this.generation
		const gone = () => {
			if (gen !== this.generation) return
			this.rendered = false
			if (panel?.matches(':popover-open')) panel.hidePopover()
			this.host.requestUpdate()
		}
		if (panel && !keyboard) void leave(panel, 'ds-pop').then(gone)
		else gone()
		this.host.requestUpdate()
		if (refocus) (this.point ? this.returnTo : this.o.anchor() ?? this.returnTo)?.focus({ preventScroll: true })
	}
	toggle(how: { keyboard?: boolean } = {}) {
		if (this.open) this.hide(how.keyboard, how.keyboard)
		else void this.show(how)
	}

	hostUpdated() {
		const panel = this.o.panel()
		if (!this.open || !panel) return
		if (!panel.matches(':popover-open')) {
			panel.showPopover()
			this.start(panel)
			this.update()
			return
		}
		if (this.pos.placed && this.shown) {
			const done = this.shown
			this.shown = undefined
			if (!this.instant) void enter(panel, 'ds-pop')
			done()
		}
	}
	hostDisconnected() {
		this.stop()
	}

	private onPointerDown = (event: PointerEvent) => {
		const path = event.composedPath()
		const panel = this.o.panel()
		const anchor = this.o.anchor()
		if ((panel && path.includes(panel)) || (anchor && path.includes(anchor))) return
		this.hide()
	}
	private onKey = (event: KeyboardEvent) => {
		if (event.key !== 'Escape' || stack.at(-1) !== this) return
		// A dialog under the panel would take Escape too: it is the panel's.
		event.preventDefault()
		event.stopPropagation()
		this.hide(true, true)
	}
	/** Focus moving to somewhere outside the panel and its anchor closes it (Tab out of a popover). */
	onFocusOut = (event: FocusEvent) => {
		const next = event.relatedTarget as Node | null
		if (this.o.sticky || !next || within(this.o.panel(), next) || within(this.o.anchor(), next)) return
		this.hide()
	}
	private start(panel: HTMLElement) {
		stack.push(this)
		if (!this.o.sticky) document.addEventListener('pointerdown', this.onPointerDown, true)
		document.addEventListener('keydown', this.onKey, true)
		window.addEventListener('scroll', this.schedule, true)
		window.addEventListener('resize', this.schedule)
		this.ro = new ResizeObserver(this.schedule)
		this.ro.observe(panel)
	}
	private stop() {
		const i = stack.indexOf(this)
		if (i >= 0) stack.splice(i, 1)
		document.removeEventListener('pointerdown', this.onPointerDown, true)
		document.removeEventListener('keydown', this.onKey, true)
		window.removeEventListener('scroll', this.schedule, true)
		window.removeEventListener('resize', this.schedule)
		cancelAnimationFrame(this.frame)
		this.ro?.disconnect()
		this.ro = undefined
	}
}

/** PopoverPanel.vue's <style>, for every element that draws a panel, with the top layer's own defaults undone. */
export const popoverStyles = css`
.ds-pop { position: fixed; z-index: 60; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); overflow: auto; overscroll-behavior: contain; border: var(--ds-border-hairline) solid var(--ds-color-edge); background: var(--ds-color-surface); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); text-align: left; outline: none; }
.ds-pop:not([data-placed]) { visibility: hidden; }
.ds-pop[data-tip] { z-index: 70; overflow: visible; padding: 2px 6px; border-color: var(--ds-color-surface-inverse); background: var(--ds-color-surface-inverse); color: var(--ds-color-fg-inverse); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; pointer-events: none; }
.ds-pop-enter-active { transition: opacity var(--ds-duration-enter) var(--ds-easing-out), transform var(--ds-duration-enter) var(--ds-easing-out); }
.ds-pop-leave-active { transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-standard); }
.ds-pop-enter-from, .ds-pop-leave-to { opacity: 0; }
.ds-pop-enter-from[data-side="bottom"], .ds-pop-leave-to[data-side="bottom"] { transform: translateY(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="top"], .ds-pop-leave-to[data-side="top"] { transform: translateY(4px) scale(0.98); }
.ds-pop-enter-from[data-side="right"], .ds-pop-leave-to[data-side="right"] { transform: translateX(-4px) scale(0.98); }
.ds-pop-enter-from[data-side="left"], .ds-pop-leave-to[data-side="left"] { transform: translateX(4px) scale(0.98); }
.ds-pop[data-tip].ds-pop-enter-active, .ds-pop[data-tip].ds-pop-leave-active { transition: opacity var(--ds-duration-tip) var(--ds-easing-out), transform var(--ds-duration-tip) var(--ds-easing-out); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="bottom"], .ds-pop[data-tip].ds-pop-leave-to[data-side="bottom"] { transform: translateY(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="top"], .ds-pop[data-tip].ds-pop-leave-to[data-side="top"] { transform: translateY(2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="right"], .ds-pop[data-tip].ds-pop-leave-to[data-side="right"] { transform: translateX(-2px); }
.ds-pop[data-tip].ds-pop-enter-from[data-side="left"], .ds-pop[data-tip].ds-pop-leave-to[data-side="left"] { transform: translateX(2px); }
.ds-pop[data-instant].ds-pop-enter-active, .ds-pop[data-instant].ds-pop-leave-active { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-pop.ds-pop-enter-from, .ds-pop.ds-pop-leave-to { transform: none; }
}

/* The top layer's own defaults undone, under every utility class (a layer), as the Vue panel has none of them. */
@layer base { .ds-pop[popover] { inset: auto; margin: 0; padding: 0; width: auto; height: auto; } }
`
