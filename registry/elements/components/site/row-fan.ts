import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { mountRowFan } from '@/lib/effects/row-fan'
import { ROW_FAN_CSS } from '@/lib/effects/row-fan-css'
import styles from 'virtual:tw'

// RowFan.tsx as <spyglass-row-fan>: big names, each a link, whose pictures fan out beside (from 1024) or below the name
// when it is pointed at, focused, tapped or scrolled to the middle; a card opens with its title and meta. `rows` (JSON:
// { key, name, href, cta, srLabel?, items: [{ key, src, alt?, title, meta? }] }), `sizes`, `new-tab`.

export interface FanItem { key: string, src: string, alt?: string, title: string, meta?: string }
export interface FanRow { key: string, name: string, href: string, cta: string, srLabel?: string, items: FanItem[] }

/**
 * @summary Names whose pictures fan out beside them.
 */
export class RowFan extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(ROW_FAN_CSS)]
	static properties = { rows: { type: Array }, sizes: {}, newTab: { type: Boolean, attribute: 'new-tab' } }
	rows: FanRow[] = []
	/** The img sizes attribute for the cards. */
	sizes = '(min-width: 1024px) 128px, (min-width: 768px) 96px, 72px'
	/** Open the rows' links in a new tab. */
	newTab = false
	private stop: (() => void) | null = null

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('rows') && this.stop) return
		this.stop?.()
		const root = this.renderRoot.querySelector<HTMLElement>('[data-fan-root]')
		this.stop = root ? mountRowFan(root) : null
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated && !this.stop) this.requestUpdate('rows')
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = null
	}

	render() {
		const rows = Array.isArray(this.rows) ? this.rows : []
		const most = Math.max(0, ...rows.map((r) => r.items.length))
		const places = Array.from({ length: most }, (_, k) => ({ side: k % 2 === 0 ? 'l' : 'r', step: Math.floor(k / 2), k }))
		return html`<div data-ds="row-fan" data-fan-root="" class="ds-fan"><ul class="ds-fan-list" role="list">${rows.map((row) => html`<li><a class="ds-fan-row" href=${row.href} data-fan-row="" data-fan-cta=${row.cta} target=${this.newTab ? '_blank' : nothing} rel=${this.newTab ? 'noreferrer' : nothing}><span class="ds-fan-anchor" data-fan-anchor=""><span class="ds-fan-name" data-fan-name="">${row.name}</span></span>${row.srLabel ? html`<span class="sr-only">${row.srLabel}</span>` : nothing}</a></li>`)}</ul><div class="ds-fan-layer" data-fan-layer="" aria-hidden="true">${places.map((p) => html`<div class="ds-fan-slot" data-fan-slot="" data-side=${p.side} data-step=${p.step}><div class="ds-fan-turn"><div class="ds-fan-chrome"></div><div class="ds-fan-pic">${rows.map((row, i) => {
			const item = row.items[p.k]
			return item ? html`<div class="ds-fan-img" data-fan-img="" data-row=${i} data-title=${item.title} data-meta=${item.meta ?? nothing}><img src=${item.src} alt="" sizes=${this.sizes} decoding="async" draggable="false" /></div>` : nothing
		})}</div><div class="ds-fan-details" data-fan-details=""><span class="ds-fan-title" data-fan-title=""></span><span class="ds-fan-meta" data-fan-meta=""></span></div></div></div>`)}${[0, 1].map(() => html`<span class="ds-fan-cta" data-fan-cta=""><span data-fan-cta-label=""></span></span>`)}</div></div>`
	}
}

define('row-fan', RowFan)
