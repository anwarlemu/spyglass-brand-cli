import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import { ASCII_TEXTURE } from '@/lib/textures'
import styles from 'virtual:tw'

// ProductFeatures.tsx as <spyglass-product-features>: one row per thing the product does, the copy beside a 4:3 stage
// with the ASCII texture around a clear middle, every other row flipped from 1024. `features` as JSON: [{ headline,
// text, link?: { label, href } }]; each row's picture goes in the slot `visual-1`, `visual-2`...

export interface ProductFeature { headline: string; text: string; link?: { label: string; href: string } }

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const ASCII_AT = ['0 0', '40% 24%', '64% 56%', '20% 80%']

/**
 * @summary The product feature rows: copy beside a stage for each feature's picture, alternating.
 * @slot visual-1 - The first row's picture (visual-2, visual-3... for the next rows).
 */
export class ProductFeatures extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-features"]'))
	static properties = { features: { type: Array }, prefix: {} }
	features: ProductFeature[] = []
	/** Prefix for the heading ids (React's `id`). */
	prefix = 'product'

	render() {
		return html`<div data-ds="product-features" class="py-(--ds-layout-section) text-fg"><div class=${`${WRAP} grid gap-y-20 md:gap-y-30`}>${(this.features ?? []).map((f, i) => html`<section aria-labelledby=${`${this.prefix}-feature-${i + 1}`} class=${`grid grid-cols-[minmax(0,1fr)] items-center gap-y-8 lg:gap-x-16 xl:gap-x-24 ${i % 2 ? 'lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'}`}><div class=${`flex flex-col items-start ${i % 2 ? 'lg:order-2' : ''}`}><h2 id=${`${this.prefix}-feature-${i + 1}`} class="ds-pf-title">${f.headline}</h2><p class="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${f.text}</p>${f.link ? html`<spyglass-button href=${f.link.href} variant="secondary" class="mt-8">${f.link.label}</spyglass-button>` : nothing}</div><div class="ds-pf-stage relative isolate aspect-4/3 min-w-0 overflow-clip rounded-panel bg-surface-raised"><span aria-hidden="true" class="ds-pf-ascii" style=${`background-image: url("${ASCII_TEXTURE}"); background-position: ${ASCII_AT[i % ASCII_AT.length]}`}></span><slot name=${`visual-${i + 1}`}></slot></div></section>`)}</div></div>`
	}
}

define('product-features', ProductFeatures)
