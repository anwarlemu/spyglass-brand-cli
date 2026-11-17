import { html } from 'lit'
import { ChevronDown } from 'lucide'
import { accordionOf } from '@/elements/controllers/accordion'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// AccordionItem.tsx as <spyglass-accordion-item>: one row of an accordion: the question as a full-width button (DM Sans
// 16px, soft White that turns full White under the pointer and while open) over a neutral hairline, and the answer
// under it in muted DM Sans 14px. The chevron turns half a circle as the row opens; it never moves on hover. The closed
// answer is inert, so its links leave the tab order. `heading` (React's `title`) or the `title` slot names the row; the
// default slot is the answer.

/**
 * @summary One row of an accordion.
 * @slot - The answer.
 * @slot title - The question, in place of `heading`.
 */
export class AccordionItem extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { value: {}, heading: {}, disabled: { type: Boolean } }

	/** The value the accordion opens it by. */
	value = ''
	/** The question (React's `title`). */
	heading?: string
	disabled = false
	private rowId = uid('accordion')

	render() {
		const ctx = accordionOf(this)
		const open = ctx?.isOpen(this.value) ?? false
		return html`<div data-ds="accordion-item" class="border-b border-edge" data-open=${String(open)}>
			<h3>
				<button id=${`${this.rowId}-head`} type="button" aria-expanded=${String(open)} aria-controls=${`${this.rowId}-body`} ?disabled=${this.disabled} class="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left type-body text-fg-soft transition-[color] duration-150 ease-standard hover:text-fg aria-expanded:text-fg disabled:cursor-not-allowed disabled:text-fg-faint" @click=${() => ctx?.toggle(this.value)}><slot name="title">${this.heading}</slot>${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: 'ds-accordion-chev shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>
			</h3>
			<div id=${`${this.rowId}-body`} role="region" aria-labelledby=${`${this.rowId}-head`} ?inert=${!open} class="ds-collapse" data-open=${String(open)}>
				<div><div class="ds-collapse-body pb-4 type-ui text-fg-muted"><slot></slot></div></div>
			</div>
		</div>`
	}
}

define('accordion-item', AccordionItem)
