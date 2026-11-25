import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/testimonial'
import type { ImageSlot } from '@/lib/image'
import styles from 'virtual:tw'

// TestimonialBlock.tsx as <spyglass-testimonial-block>: a `label` in capitals over the testimonial, the headshot
// beside the words (layout="side") or above them (layout="stacked"); `card` sets it on the #262626 fill.

/**
 * @summary One customer, as a section.
 */
export class TestimonialBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="testimonial-block"]'))
	static properties = { quote: {}, name: {}, position: {}, image: {}, label: {}, arrangement: { attribute: 'layout' }, card: { type: Boolean } }
	/** The words, without quote marks. */
	quote = ''
	name = ''
	/** Role and company, shown in capitals. */
	position?: string
	/** The headshot's src, or "false" for none. */
	image?: string | ImageSlot
	/** A line in capitals above it. */
	label?: string
	/** side or stacked (the layout attribute). */
	arrangement: 'side' | 'stacked' = 'side'
	/** On the card fill. */
	card = false

	render() {
		return html`<section data-ds="testimonial-block" class=${['grid gap-8 text-fg', this.card ? 'rounded-container bg-surface-raised p-12 max-sm:p-6' : ''].filter(Boolean).join(' ')}>${this.label ? html`<p class="type-label text-fg-muted">${this.label}</p>` : nothing}<spyglass-testimonial quote=${this.quote} name=${this.name} .position=${this.position} .image=${this.image} layout=${this.arrangement}></spyglass-testimonial></section>`
	}
}

define('testimonial-block', TestimonialBlock)
