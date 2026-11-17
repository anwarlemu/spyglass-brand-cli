import { html, nothing, type PropertyValues, type ReactiveController, type ReactiveControllerHost } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { firstFocusable } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Sheet.tsx as <spyglass-sheet>: a panel at an edge of the screen over the page: the card's #171717 fill with a
// hairline on its inner edge, 384px at the right (the default) or left, full width at the top or bottom. A Funnel
// Display title and a muted line, a close button, the body scrolling on its own, buttons at the foot. It is modal: the
// page dims under the scrim and stays inert. It slides in over 300ms on the drawer curve and leaves in 200ms; Escape
// closes it at once; focus returns to what opened it. `open` (reflected) with `open-change`; React's `title` is
// `heading`.
export type SheetSide = 'right' | 'left' | 'top' | 'bottom'

/**
 * @summary A modal panel at an edge of the screen.
 * @slot - The body.
 * @slot foot - Buttons at the foot.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 */
export class Sheet extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, side: { reflect: true }, open: { type: Boolean, reflect: true } }

	/** The title, and the panel's name (React's `title`). */
	heading = ''
	/** A line under the title. */
	description?: string
	/** The edge it comes from. */
	side: SheetSide = 'right'
	/** Whether it is showing. */
	open = false

	private sheet = new SheetController(this, () => this.renderRoot.querySelector('dialog'), (open) => this.setOpen(open))

	private setOpen(open: boolean) {
		if (this.open === open) return
		this.open = open
		this.emit('open-change', { value: open })
	}

	// Show when it opens (or starts open), hide when it closes.
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('open')) return
		if (this.open) void this.sheet.show()
		else if (changed.get('open') !== undefined) void this.sheet.hide()
	}

	render() {
		const side = ['right', 'left', 'top', 'bottom'].includes(this.side) ? this.side : 'right'
		return html`<dialog data-ds="sheet" class="ds-sheet" data-side=${side} data-shown=${ifDefined(this.sheet.shown ? 'true' : undefined)} aria-label=${this.heading} tabindex="-1" @cancel=${this.sheet.onCancel} @click=${this.sheet.onClick}>
			<div class="flex shrink-0 items-start gap-4 px-6 pt-6 pb-4">
				<div class="flex min-w-0 flex-1 flex-col gap-2">
					<h2 class="type-heading-4 text-fg">${this.heading}</h2>
					${this.description ? html`<p class="type-ui text-fg-muted">${this.description}</p>` : nothing}
				</div>
				<button type="button" class="-mt-1.5 -mr-2 inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg max-md:size-control-touch" aria-label="Close" @click=${() => this.setOpen(false)}>${icon(X, 'x', { size: 16, strokeWidth: 1.5 })}</button>
			</div>
			<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6" data-sheet-body>
				<slot></slot>
			</div>
			${this.hasSlot('foot') ? html`<div class="flex shrink-0 justify-end gap-2 border-t border-edge px-6 py-4"><slot name="foot"></slot></div>` : nothing}
		</dialog>`
	}
}

/**
 * The sheet's native modal dialog: showModal keeps focus inside and the page inert; the panel and its scrim come in on
 * `data-shown` and leave on its removal, closing once the exit transition has run (read from CSS, so reduced motion
 * and the tokens decide). Escape closes at once (keyboard actions don't animate); the scrim closes it; focus returns
 * to what opened it, through shadow roots. Focus starts on the first control in `[data-autofocus]` (in the page's
 * content or the panel) or the body, else the panel.
 */
class SheetController implements ReactiveController {
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

define('sheet', Sheet)
