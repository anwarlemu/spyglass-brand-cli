import { html, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { mountProductVisual, productVisualCss, type ProductVisualKind } from '@/lib/product-visual'
import styles from 'virtual:tw'

// ProductVisual.tsx as <spyglass-product-visual>: the 4:3 stage of a product page's feature row with one looping scene
// of the product, built by the same engine (lib/product-visual.ts) so both flavors draw the same nodes. `kind` picks
// the scene, `data` (JSON) its content (Acme by default), `texture` the ASCII field's position (0 to 3, or "none").

/**
 * @summary A product page's feature visual: a small looping scene of the product on the 4:3 stage.
 */
export class ProductVisual extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(productVisualCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-visual"]'))
	static properties = { kind: { reflect: true }, data: { type: Object }, texture: {}, fill: { type: Boolean } }
	/** Which scene. */
	kind: ProductVisualKind = 'brand-record'
	/** The kind's content; Acme by default. */
	data?: unknown
	/** The ASCII field's position, 0 to 3, or "none". */
	texture?: number | string
	/** Fill the box it is in (its height, no 4:3, no panel of its own): the header's live card. */
	fill = false
	private stop?: () => void

	render() {
		return html`<div data-ds="product-visual" data-kind=${this.kind} ?data-fill=${this.fill} class="ds-pv"></div>`
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('kind') && !changed.has('data') && !changed.has('texture')) return
		this.stop?.()
		const stage = this.renderRoot.querySelector<HTMLElement>('[data-ds="product-visual"]')
		if (!stage) return
		const t = this.texture
		const texture = t === 'none' ? false : Number(t ?? 0) || 0
		this.stop = mountProductVisual(stage, { kind: this.kind, data: (this.data ?? undefined) as never, texture })
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated && !this.stop) this.requestUpdate('kind')
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = undefined
	}
}

define('product-visual', ProductVisual)
