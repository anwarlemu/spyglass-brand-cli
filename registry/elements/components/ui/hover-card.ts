import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { boxOf, PopoverController, popoverStyles, within, type Align, type Side } from '@/elements/lib/popover'
import styles from 'virtual:tw'

// HoverCard.tsx as <spyglass-hover-card>: more about a link, shown while the pointer rests on it: the card's #171717
// fill with a hairline and the brand corner, 16px in, opened after the tooltip's 300ms wait and, on keyboard focus, at
// once. The pointer can cross into the
// card to select or follow what is in it; leaving both closes it after a short grace. It is a preview, never the only
// way to the content: on touch the link just works. Wrap one link; the card is the `card` slot. Inside a paragraph, put
// the card in a <template slot="card"> (a <div> or <p> there would end the paragraph): the element moves its content
// into a <div slot="card"> as it connects.
const WAIT = 300
const GRACE = 120

/**
 * @summary More about a link, shown while the pointer rests on it.
 * @slot - One link.
 * @slot card - What the card shows (an element, or a <template slot="card">).
 */
export class HoverCard extends DsElement {
	static styles = [DsElement.styles, popoverStyles, styles]
	static properties = { side: {}, align: {}, width: {} }

	side: Side = 'bottom'
	align: Align = 'start'
	width = '288px'
	private timer?: ReturnType<typeof setTimeout>
	private pop = new PopoverController(this, {
		gap: 8,
		sticky: true,
		anchor: () => boxOf([...this.children].find((c) => !c.hasAttribute('slot'))),
		panel: () => this.renderRoot.querySelector<HTMLElement>('.ds-pop'),
	})

	private enter = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		clearTimeout(this.timer)
		// ds-latency: the wait keeps a passing pointer from opening it.
		if (!this.pop.open) this.timer = setTimeout(() => void this.pop.show(), WAIT)
	}
	private leave = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		clearTimeout(this.timer)
		// ds-latency: a grace to cross the gap into the card.
		this.timer = setTimeout(() => this.pop.hide(), GRACE)
	}
	private onFocusIn = (event: FocusEvent) => {
		if ((event.composedPath()[0] as Element).matches(':focus-visible')) void this.pop.show({ keyboard: true })
	}
	private onFocusOut = (event: FocusEvent) => {
		const next = event.relatedTarget as Node | null
		if (!next || !within(this.renderRoot.querySelector('.ds-pop'), next)) this.pop.hide()
	}

	connectedCallback() {
		super.connectedCallback()
		const template = this.querySelector<HTMLTemplateElement>(':scope > template[slot="card"]')
		if (template) {
			const card = document.createElement('div')
			card.slot = 'card'
			card.append(template.content.cloneNode(true))
			template.replaceWith(card)
		}
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
	}
	protected willUpdate() {
		this.pop.configure({ side: this.side, align: this.align })
	}

	render() {
		const panel = this.pop.rendered
			? html`<div data-ds="hover-card" popover="manual" class="ds-pop p-4 fade-y" data-side=${this.pop.pos.side} ?data-instant=${this.pop.instant} ?data-placed=${this.pop.pos.placed} style=${this.pop.style(`width: ${this.width}`)} @pointerenter=${this.enter} @pointerleave=${this.leave}><slot name="card"></slot></div>`
			: nothing
		return html`<span data-ds="hover-card" class="inline-flex" @pointerenter=${this.enter} @pointerleave=${this.leave} @focusin=${this.onFocusIn} @focusout=${this.onFocusOut}><slot></slot></span>${panel}`
	}
}

define('hover-card', HoverCard)
