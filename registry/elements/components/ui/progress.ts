import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Progress.tsx as <spyglass-progress>: a White bar on a 6px #262626 track with round ends, sliding to a new value over
// 320ms on transform only. Without `value` a short White bar sweeps across at a steady pace (breathing in place with
// reduced motion). `label` names it for assistive tech.

/** @summary How far a task has got, as a bar. */
export class Progress extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="progress"]'))
	static properties = { value: { type: Number }, max: { type: Number }, label: {} }

	/** How far, from 0 to max; leave it out for work with no known end. */
	value?: number | null
	/** The value that means done. */
	max = 100
	/** What is in progress, for assistive tech. */
	label?: string

	render() {
		const known = typeof this.value === 'number' && !Number.isNaN(this.value)
		const share = known ? Math.max(0, Math.min(1, (this.value as number) / (this.max || 1))) : 0
		return html`<div data-ds="progress" role="progressbar" aria-label=${ifDefined(this.label)} aria-valuemin="0" aria-valuemax=${this.max} aria-valuenow=${ifDefined(known ? String(this.value) : undefined)} class="relative h-1.5 w-full overflow-hidden rounded-full bg-action-secondary">${known
			? html`<div class="h-full w-full rounded-full bg-action-primary transition-transform duration-320 ease-out motion-reduce:transition-none" style=${styleMap({ transform: `translateX(-${(1 - share) * 100}%)` })}></div>`
			: html`<div class="ds-progress-sweep h-full w-2/5 rounded-full bg-action-primary"></div>`}</div>`
	}
}

define('progress', Progress)
