import { html, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { startAbstractCanvas, type Moment } from '@/lib/effects/abstract'
import { abstractSet, type AbstractKind, type Cluster, type Tag } from '@/lib/effects/abstract-kinds'
import styles from 'virtual:tw'

// AbstractCanvas.tsx as <spyglass-abstract-canvas>: an ASCII drawing in a 14:13 panel, `kind` archive, tags or graph,
// with `tags` (JSON), `brand`, `clusters` (JSON) and `freeze` (start, middle or settled). Settled with reduced motion.

/**
 * @summary An ASCII drawing: archive rows, a tag field or a brand graph.
 */
export class AbstractCanvas extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="abstract-canvas"]'))
	static properties = { kind: {}, tags: { type: Array }, brand: {}, clusters: { type: Array }, freeze: {} }
	/** archive, tags or graph. */
	kind: AbstractKind = 'archive'
	/** The tags the field resolves into. */
	tags?: Tag[]
	/** The brand in the middle (graph). */
	brand?: string
	/** The clusters around it (graph). */
	clusters?: Cluster[]
	/** Hold one moment: start, middle or settled. */
	freeze?: Moment
	private stop: (() => void) | null = null

	private get set() {
		return abstractSet(this.kind, { tags: this.tags, brand: this.brand, clusters: this.clusters })
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = null
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated && !this.stop) this.requestUpdate('kind')
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.stop?.()
		const canvas = this.renderRoot.querySelector('canvas')
		const set = this.set
		this.stop = canvas ? startAbstractCanvas(canvas, set.draw, { fps: set.fps, moments: set.moments, freeze: this.freeze }) : null
	}

	render() {
		const set = this.set
		return html`<div data-ds="abstract-canvas" data-name=${set.name} class="relative aspect-[14/13] overflow-hidden rounded-panel bg-surface-raised select-none"><canvas aria-hidden="true" class="absolute inset-0 block size-full"></canvas><p class="sr-only">${set.summary}</p></div>`
	}
}

define('abstract-canvas', AbstractCanvas)
