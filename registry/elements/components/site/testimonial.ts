import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import { toSlot, type ImageSlot } from '@/lib/image'
import styles from 'virtual:tw'

// Testimonial.tsx as <spyglass-testimonial>: a 4/5 headshot, the quote in Funnel Display in curly quotes, the name and
// the position in capitals (not `role`, which is the host's ARIA role). `layout` stacked (the ad) or side. `image` is the headshot's src; without it the placeholder,
// and image="false" draws none. As a property, `image` also takes { src, alt, fit, position }.

/**
 * @summary A testimonial: headshot, quote, name and role.
 */
export class Testimonial extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="testimonial"]'))
	static properties = { quote: {}, name: {}, position: {}, image: {}, arrangement: { attribute: 'layout' } }
	/** The words, without quote marks. */
	quote = ''
	name = ''
	/** Role and company, shown in capitals. */
	position?: string
	/** The headshot's src (or, as a property, { src, alt, fit, position }), or "false" for none. */
	image?: string | ImageSlot
	/** stacked or side (the layout attribute). */
	arrangement: 'stacked' | 'side' = 'stacked'

	render() {
		const side = this.arrangement === 'side'
		const none = this.image === 'false'
		const shot = none ? {} : toSlot(this.image)
		const src = shot.src || undefined
		return html`<figure data-ds="testimonial" class=${['m-0 grid text-fg', side ? 'grid-cols-5 items-center gap-12 max-md:grid-cols-1 max-md:gap-8' : 'gap-10 max-sm:gap-8'].join(' ')}>${none ? nothing : html`<div class=${side ? 'col-span-2 max-md:col-span-1 max-md:w-1/2' : 'w-1/2'}><spyglass-creative-card .src=${src} alt=${src ? shot.alt ?? this.name : `${this.name}, headshot`} .fit=${shot.fit} .position=${shot.position} tone="3" ratio="4/5"></spyglass-creative-card></div>`}<div class=${['grid gap-6', side ? 'col-span-3 max-md:col-span-1' : ''].filter(Boolean).join(' ')}><blockquote class="m-0 type-heading-2 leading-(--ds-text-display-leading)"><p>${`“${this.quote}”`}</p></blockquote><figcaption class="grid gap-1"><span class="type-body text-fg">${this.name}</span>${this.position ? html`<span class="type-label text-fg-muted">${this.position}</span>` : nothing}</figcaption></div></figure>`
	}
}

define('testimonial', Testimonial)
