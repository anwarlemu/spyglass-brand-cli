import { html, nothing, type PropertyValues } from 'lit'
import { followGlow } from '@/lib/glow'
import { DsElement, define, uid } from '@/elements/lib/element'
import { firstFocusable, PopoverController, popoverStyles, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// Popover.tsx as <spyglass-popover>: a panel for any content (a short form, a few settings, a note), opened from a
// button: the card's #262626 fill on Black with a hairline and the brand corner. The trigger: a <button
// slot="trigger"> you style yourself (React's triggerClass), or other content in the `trigger` slot, drawn as a small
// secondary button. Opening moves focus to the panel's first control (or the panel); Escape, a press outside or tabbing
// away closes it, and Escape returns focus to the trigger. It flips to the side with room and stays 8px inside the
// viewport, in the top layer. `open` (reflected) with `open-change`; close() closes it.

// Button.tsx's classes for a small secondary button, in its order.
const TRIGGER = 'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control whitespace-nowrap select-none transition-[background-color,color] duration-160 ease-out relative isolate overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_var(--ds-glow-radius)_at_var(--glow-x,50%)_var(--glow-y,50%),var(--ds-color-action-glow),transparent)] before:opacity-0 before:transition-opacity before:duration-240 before:ease-out hover:not-disabled:before:opacity-100 disabled:cursor-not-allowed disabled:bg-action-disabled disabled:text-action-disabled-fg h-control-sm gap-1.5 type-ui-strong px-3 bg-action-secondary text-action-secondary-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-action-secondary-edge)] hover:not-disabled:bg-action-secondary-hover'

/**
 * @summary A panel for any content, opened from a button.
 * @slot - The panel's content.
 * @slot trigger - A <button> to use as the trigger, or the default trigger's content.
 * @fires open-change - It opened or closed (detail.value).
 */
export class Popover extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { label: {}, side: {}, align: {}, width: {}, triggerLabel: { attribute: 'trigger-label' }, open: { type: Boolean, reflect: true } }

	/** The panel's name for assistive tech. */
	label = ''
	side: Side = 'bottom'
	align: Align = 'start'
	width = '288px'
	triggerLabel?: string
	open = false
	private panelId = uid('popover')
	private pop = new PopoverController(this, {
		anchor: () => this.trigger,
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private get trigger(): HTMLElement | null {
		return this.querySelector<HTMLElement>(':scope > button[slot="trigger"]') ?? this.renderRoot.querySelector<HTMLElement>('button[data-trigger]')
	}

	/** Closes it; focus returns to the trigger unless refocus is false. */
	close(refocus = true) {
		this.pop.hide(refocus)
	}
	private async show(keyboard = false) {
		await this.pop.show({ keyboard })
		const panel = this.renderRoot.querySelector<HTMLElement>('.ds-pop')
		// Into an element's own control, so a field takes focus as a click gives it (focusing the host selects its text).
		let target = firstFocusable(panel) ?? panel
		while (target?.shadowRoot) {
			const inner = firstFocusable(target.shadowRoot as unknown as Element)
			if (!inner || inner === target) break
			target = inner
		}
		target?.focus({ preventScroll: true })
	}
	// A click from the keyboard has no pointer detail: the panel opens and closes at once.
	private onClick = (event: MouseEvent) => {
		const keyboard = event.detail === 0
		if (this.pop.open) this.pop.hide(keyboard, keyboard)
		else void this.show(keyboard)
	}

	private wired: HTMLElement | null = null
	protected willUpdate(changed: PropertyValues<this>) {
		this.pop.configure({ side: this.side, align: this.align, gap: 8 })
		if (changed.has('open') && this.open !== this.pop.open && changed.get('open') !== undefined) {
			if (this.open) void this.show()
			else this.pop.hide()
		}
	}
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const own = this.querySelector<HTMLElement>(':scope > button[slot="trigger"]')
		if (own && own !== this.wired) {
			own.addEventListener('click', this.onClick)
			own.setAttribute('aria-haspopup', 'dialog')
			this.wired = own
		}
		if (own) {
			own.setAttribute('aria-expanded', String(this.pop.open))
			if (this.triggerLabel) own.setAttribute('aria-label', this.triggerLabel)
		}
		if (this.open !== this.pop.open) {
			this.open = this.pop.open
			this.emit('open-change', { value: this.open })
		}
	}
	protected firstUpdated(changed: PropertyValues<this>) {
		super.firstUpdated(changed)
		if (this.open) void this.show()
	}

	render() {
		const own = !!this.querySelector(':scope > button[slot="trigger"]')
		const trigger = own
			? html`<slot name="trigger"></slot>`
			: html`<button data-ds="popover" data-trigger type="button" class=${TRIGGER} aria-haspopup="dialog" aria-expanded=${String(this.pop.open)} aria-controls=${this.pop.open ? this.panelId : nothing} aria-label=${this.triggerLabel ?? nothing} @click=${this.onClick} @pointermove=${(event: PointerEvent) => followGlow(event.currentTarget as HTMLElement, event)}><slot name="trigger"></slot></button>`
		const panel = this.pop.rendered
			? html`<div data-ds="popover" id=${this.panelId} popover="manual" class="ds-pop p-4 fade-y" role="dialog" aria-label=${this.label} tabindex="-1" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width}`)} @focusout=${this.pop.onFocusOut}><slot></slot></div>`
			: nothing
		return html`${trigger}${panel}`
	}
}

define('popover', Popover)
