import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// PageHead.tsx as <spyglass-page-head>: the page title as the section head (each of `lines` on its own line from 768),
// a lead in the soft gray and the actions 40px below (a White button and a quiet one, or what is in the `control` slot
// in the White button's place). `align="margin"` puts an ASCII drift (or the `visual` slot) in the right 5 of 12
// columns from 768; `align="centre"` centers it all and fades the texture in from the right edge from 1024. Nothing moves.
export interface PageAction { label: string; href: string }

/**
 * @summary The page head: title, lead, actions and the ASCII drift.
 * @slot control - A control in the White button's place (a connect menu, a form).
 * @slot visual - Your own picture in the right columns instead of the drift (margin only).
 */
export class PageHead extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="page-head"]'))
	static properties = {
		headId: { attribute: 'head-id' },
		lines: { type: Array },
		eyebrow: {},
		lead: {},
		primary: { type: Object },
		secondary: { type: Object },
		align: { reflect: true },
		drift: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
	}
	/** Names the heading (`<head-id>-heading`) the section is labeled by (React's `id`). */
	headId = 'page'
	/** The title, one string per line (lines break from 768). */
	lines: string[] = []
	/** The capital label over the title. */
	eyebrow?: string
	lead?: string
	/** The White button ({ label, href }); left out when the control slot is filled. */
	primary?: PageAction
	/** The quiet button after it ({ label, href }). */
	secondary?: PageAction
	/** margin (copy left, drift right) or centre. */
	align: 'margin' | 'centre' = 'margin'
	/** The ASCII drift in the right columns when the visual slot is empty (margin only). */
	drift = true

	render() {
		const centre = this.align === 'centre'
		const lines = this.lines ?? []
		const control = this.hasSlot('control')
		const visual = this.hasSlot('visual')
		const actions = control || this.primary || this.secondary
		return html`<section data-ds="page-head" aria-labelledby=${`${this.headId}-heading`} data-align=${this.align} class="relative isolate overflow-x-clip pt-16 pb-20 text-fg md:pt-24 md:pb-24 lg:pt-32">${centre ? html`<span aria-hidden="true" class="pointer-events-none absolute top-0 right-0 -z-1 hidden h-full w-[calc(50%-var(--ds-page-head-drift-clear))] select-none lg:block" style=${asciiDriftStyle('mass', 'right')}></span>` : nothing}<div class=${`mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col gap-6 px-(--ds-layout-gutter) ${centre ? 'items-center text-center' : ''}`.trim()}>${this.eyebrow ? html`<p class="-mb-2 type-label text-fg-muted">${this.eyebrow}</p>` : nothing}<h1 id=${`${this.headId}-heading`} class="max-w-full type-section">${lines.map((line, i) => html`<span class="inline md:block">${line}${i < lines.length - 1 ? ' ' : nothing}</span>`)}</h1><div class=${`grid w-full grid-cols-[minmax(0,1fr)] gap-12 ${centre ? '' : 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start lg:gap-16'}`.trim()}><div class=${centre ? 'flex flex-col items-center text-center' : ''}>${this.lead ? html`<p class="max-w-measure type-body-lg text-pretty text-fg-soft">${this.lead}</p>` : nothing}${actions ? html`<div class=${`mt-10 flex flex-col gap-3 md:flex-row md:flex-wrap ${centre ? 'self-stretch md:self-auto md:justify-center' : ''}`.trim()}>${control ? html`<slot name="control"></slot>` : nothing}${!control && this.primary ? html`<spyglass-button href=${this.primary.href}>${this.primary.label}</spyglass-button>` : nothing}${this.secondary ? html`<spyglass-button href=${this.secondary.href} variant="secondary">${this.secondary.label}</spyglass-button>` : nothing}</div>` : nothing}</div>${!centre && (visual || this.drift) ? html`<div class=${`relative isolate min-w-0 ${visual ? 'block' : 'hidden md:block md:min-h-40 md:self-stretch'}`}>${visual ? html`<slot name="visual"></slot>` : html`<span aria-hidden="true" class="pointer-events-none absolute inset-x-0 -inset-y-16 -z-1 select-none" style=${asciiDriftStyle('cluster')}></span>`}</div>` : nothing}</div></div></section>`
	}
}

define('page-head', PageHead)
