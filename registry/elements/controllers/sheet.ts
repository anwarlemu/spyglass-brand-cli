import type { ReactiveController, ReactiveControllerHost } from 'lit'
import { firstFocusable } from '@/elements/lib/popover'

/**
 * useSheet as a Lit controller: a native modal dialog that slides (Sheet, Drawer): showModal keeps focus inside and
 * the page inert; the panel and its scrim come in on `data-shown` and leave on its removal, closing once the exit
 * transition has run (read from CSS, so reduced motion and the tokens decide). Escape closes at once (keyboard actions
 * don't animate); the scrim closes it; focus returns to what opened it, through shadow roots. Focus starts on the first
 * control in `[data-autofocus]` (in the page's content or the panel) or the body, else the panel. The element calls
 * show() and hide() when its `open` changes and passes `setOpen` for Escape and the scrim.
 */
export class SheetController implements ReactiveController {
	shown = false
	private returnTo: HTMLElement | null = null
	private timer?: ReturnType<typeof setTimeout>

	constructor(
		private host: ReactiveControllerHost & HTMLElement,
		private dialog: () => HTMLDialogElement | null,
		private setOpen: (open: boolean) => void,
		private options: { dismissable?: () => boolean } = {},
	) {
		host.addController(this)
	}
	hostDisconnected() {
		clearTimeout(this.timer)
	}

	private exitMs(el: HTMLElement) {
		const parts = getComputedStyle(el).transitionDuration.split(',').map((s) => Number.parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))
		return Math.max(0, ...parts.filter((n) => !Number.isNaN(n)))
	}
	private setShown(v: boolean) {
		this.shown = v
		this.host.requestUpdate()
	}

	async show() {
		const d = this.dialog()
		if (!d || d.open) return
		clearTimeout(this.timer)
		// The focused element itself, inside shadow roots, not the host it sits in.
		let active = document.activeElement as HTMLElement | null
		while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement as HTMLElement
		this.returnTo = active
		d.showModal()
		const start = this.host.querySelector<HTMLElement>('[data-autofocus]') ?? d.querySelector<HTMLElement>('[data-autofocus]') ?? firstFocusable(d.querySelector<HTMLElement>('[data-sheet-body]'))
		;(start ?? d).focus({ preventScroll: true })
		// One frame at the closed state, so the transition has somewhere to start.
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
		this.setShown(true)
	}
	private finish() {
		this.dialog()?.close()
		this.returnTo?.focus({ preventScroll: true })
		this.returnTo = null
	}
	async hide(instant = false) {
		const d = this.dialog()
		if (!d?.open) return
		this.setShown(false)
		if (instant) return this.finish()
		await this.host.updateComplete
		// ds-latency: the dialog stays in the top layer until its exit has played.
		this.timer = setTimeout(() => this.finish(), this.exitMs(d))
	}

	/** Escape: at once, no exit motion. */
	onCancel = (event: Event) => {
		event.preventDefault()
		if (this.options.dismissable && !this.options.dismissable()) return
		this.setOpen(false)
		void this.hide(true)
	}
	/** A press on the scrim lands on the dialog element itself. */
	onClick = (event: MouseEvent) => {
		if (event.target === this.dialog() && (!this.options.dismissable || this.options.dismissable())) this.setOpen(false)
	}
}
