import { html, type PropertyValues } from 'lit'
import { ChevronDown } from 'lucide'
import { DsElement, define, uid } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import styles from 'virtual:tw'

// Collapsible.tsx as <spyglass-collapsible>: a part that opens in place and pushes what follows. The part grows to its
// content's height over 250ms on the strong ease-out and closes in 150ms; the content fades and settles 4px down; the
// muted chevron turns half a circle. Toggled from the keyboard it opens at once. The trigger: content in the `trigger`
// slot, drawn as a quiet DM Sans Medium row with the chevron, or a <button slot="trigger"> you style yourself (React's
// triggerClass; draw your own chevron in it). `open` (the attribute) with `open-change`.

/**
 * @summary A part that opens in place and pushes what follows.
 * @slot - What opens.
 * @slot trigger - The trigger's content, or a <button> to use as the trigger.
 * @fires open-change - It opened or closed (detail.value).
 */
export class Collapsible extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { open: { type: Boolean, reflect: true }, instant: { state: true } }

	open = false
	private instant = false
	private regionId = uid('collapse')

	private toggle = (event: MouseEvent) => {
		this.instant = event.detail === 0
		this.commit(!this.open, 'open')
	}

	// The page's own trigger button gets the button's attributes and the press.
	private wired: HTMLElement | null = null
	protected updated(changed: PropertyValues<this>) {
		super.updated(changed)
		const own = this.querySelector<HTMLElement>(':scope > button[slot="trigger"]')
		if (own !== this.wired) {
			this.wired?.removeEventListener('click', this.toggle)
			own?.addEventListener('click', this.toggle)
			this.wired = own
		}
		own?.setAttribute('aria-expanded', String(this.open))
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.wired?.removeEventListener('click', this.toggle)
		this.wired = null
	}

	render() {
		const own = !!this.querySelector(':scope > button[slot="trigger"]')
		const trigger = own
			? html`<slot name="trigger"></slot>`
			: html`<button type="button" class="flex w-full cursor-pointer items-center gap-2 rounded-control py-2 text-left type-ui-strong text-fg max-md:min-h-control-touch" aria-expanded=${String(this.open)} aria-controls=${this.regionId} @click=${this.toggle}><slot name="trigger"></slot>${icon(ChevronDown, 'chevron-down', { size: 16, strokeWidth: 1.5, class: 'ds-collapsible-chev ml-auto shrink-0 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}</button>`
		return html`<div data-ds="collapsible" class="ds-collapsible" ?data-open=${this.open} ?data-instant=${this.instant}>
			${trigger}
			<div id=${this.regionId} class="ds-collapsible-region" ?inert=${!this.open}>
				<div><div class="ds-collapsible-content"><slot></slot></div></div>
			</div>
		</div>`
	}
}

define('collapsible', Collapsible)
