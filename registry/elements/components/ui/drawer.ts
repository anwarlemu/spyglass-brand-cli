import { html, nothing, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { X } from 'lucide'
import { DsElement, define } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { SheetController } from '@/elements/controllers/sheet'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Drawer.tsx as <spyglass-drawer>: a panel that slides in from an edge over a Black scrim, on the #262626 overlay
// surface with a neutral hairline on its inner edge. `bottom` (the default) is the screen's width and up to 85% of its
// height, with the 8px corner on its top edge and a grab handle; `left` and `right` are min(320px, 85vw) and full
// height. A Funnel Display heading, an optional line and a ghost close button head it. It slides in over 360ms on the
// drawer curve and out in 240ms. A press on the scrim or Escape (at once) closes it, and focus returns to what opened
// it. React's `open` with `onOpenChange` is the reflected `open` attribute with an `open-change` event; React's
// `title` is `heading`; React's `close` (children as a function) is the element's close().

/**
 * @summary A panel that slides in from an edge over a Black scrim.
 * @slot - The panel's body.
 * @fires open-change - It opened or closed (detail.value; read `open`).
 */
export class Drawer extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { heading: {}, description: {}, side: { reflect: true }, open: { type: Boolean, reflect: true } }

	/** The title, and the panel's name (React's `title`). */
	heading = ''
	/** A line under the heading. */
	description?: string
	/** The edge it comes from. */
	side: 'bottom' | 'left' | 'right' = 'bottom'
	/** Whether it is showing. */
	open = false

	private sheet = new SheetController(this, () => this.renderRoot.querySelector('dialog'), (open) => this.setOpen(open))

	/** Closes it, with its exit. */
	close() {
		this.setOpen(false)
	}
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
		return html`<dialog data-ds="drawer" class="ds-drawer" data-side=${this.side} data-shown=${ifDefined(this.sheet.shown ? 'true' : undefined)} aria-label=${this.heading} tabindex="-1" @cancel=${this.sheet.onCancel} @click=${this.sheet.onClick}>
			${this.side === 'bottom' ? html`<div class="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-ds-neutral-5" aria-hidden="true"></div>` : nothing}
			<div class="flex shrink-0 items-start gap-4 pt-4 pr-4 pb-2 pl-6">
				<div class="flex min-w-0 flex-1 flex-col gap-1.5 pt-1.5">
					<h2 class="type-heading-4">${this.heading}</h2>
					${this.description ? html`<p class="type-ui text-fg-muted">${this.description}</p>` : nothing}
				</div>
				<spyglass-button variant="ghost" size="sm" icon aria-label="Close" @click=${() => this.close()}>${icon(X, 'x', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</spyglass-button>
			</div>
			<div class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 pb-6 fade-y" data-sheet-body><slot></slot></div>
		</dialog>`
	}
}

define('drawer', Drawer)
