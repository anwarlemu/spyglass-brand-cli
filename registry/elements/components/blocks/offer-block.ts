import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/ascii-texture'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// OfferBlock.tsx as <spyglass-offer-block>: the centered headline, the terms in capitals (`note`) and one White button
// (`cta`, { label, href }), the light around (`corner`) or from the top (`field`); the default slot (a plan card)
// replaces the terms and the button.

const CLEAR = { corner: [{ x: 200, y: 140, w: 1040, h: 620 }], field: [{ x: 280, y: 0, w: 880, h: 900 }] }

/**
 * @summary The offer: headline, terms and one White button, in the light.
 * @slot - A plan card, instead of the terms and the button.
 */
export class OfferBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="offer-block"]'))
	static properties = { headline: {}, note: {}, cta: { type: Object }, light: {}, seed: { type: Number }, texture: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } } }
	headline = ''
	/** The terms, set in capitals. */
	note?: string
	/** The White button ({ label, href }). */
	cta?: { label: string; href?: string }
	/** corner or field. */
	light: 'corner' | 'field' = 'corner'
	seed = 0
	/** The ASCII texture behind the light (texture="false" to leave it out). */
	texture = true

	render() {
		const field = this.light === 'field'
		return html`<section data-ds="offer-block" class="relative isolate overflow-hidden bg-surface text-fg">${this.texture ? html`<spyglass-ascii-texture seed=${this.seed + 3} width="1440" height="900" density="0.35" .clear=${CLEAR[this.light] ?? CLEAR.corner} cover class="absolute inset-0 -z-10 size-full"></spyglass-ascii-texture>` : nothing}${field ? html`<spyglass-brand-light variant="field" seed=${this.seed} ground="false" cover class="absolute inset-x-0 top-0 -z-10 h-80 mask-b-from-40% max-sm:h-48"></spyglass-brand-light>` : html`<spyglass-brand-light variant="corner" seed=${this.seed} ground="false" cover class="absolute inset-0 -z-10 size-full max-sm:hidden"></spyglass-brand-light><spyglass-brand-light variant="field" seed=${this.seed} ground="false" cover class="absolute inset-x-0 top-0 -z-10 h-48 mask-b-from-40% sm:hidden"></spyglass-brand-light>`}<div class=${['mx-auto flex w-full max-w-page flex-col items-center px-12 text-center max-sm:px-4', field ? 'pt-72 pb-24 max-sm:pt-44 max-sm:pb-16' : 'py-32 max-sm:pt-44 max-sm:pb-20'].join(' ')}><h2 class="max-w-3xl type-section">${this.headline}</h2>${this.hasSlot() ? html`<div class="mt-12 flex w-full justify-center max-sm:mt-8"><slot></slot></div>` : html`${this.note ? html`<p class="mt-6 type-label text-fg">${this.note}</p>` : nothing}${this.cta ? html`<spyglass-button href=${ifDefined(this.cta.href)} size="lg" class="mt-6">${this.cta.label}</spyglass-button>` : nothing}`}</div></section>`
	}
}

define('offer-block', OfferBlock)
