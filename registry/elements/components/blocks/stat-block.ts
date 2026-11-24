import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// StatBlock.tsx as <spyglass-stat-block>: Funnel Display figures over DM Sans lines (`stats`, a list of
// { value, label }), under a `heading` (React's `title`), each under a hairline (`rule`) or on the #262626 fill (`card`).
export interface Stat { value: string; label: string }

/**
 * @summary Numbers: Funnel Display figures with a line each.
 */
export class StatBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="stat-block"]'))
	static properties = { stats: { type: Array }, heading: {}, variant: {} }
	stats: Stat[] = []
	/** A heading above the numbers (React's `title`). */
	heading?: string
	/** rule or card. */
	variant: 'rule' | 'card' = 'rule'

	render() {
		const card = this.variant === 'card'
		return html`<section data-ds="stat-block" class="grid gap-10 text-fg max-sm:gap-8">${this.heading ? html`<h2 class="max-w-3xl type-section">${this.heading}</h2>` : nothing}<dl class=${['m-0 grid grid-cols-4 max-md:grid-cols-2', card ? 'gap-4' : 'gap-x-6 gap-y-10'].join(' ')}>${(this.stats ?? []).map((s) => html`<div class=${['flex flex-col-reverse justify-end gap-3', card ? 'rounded-container bg-surface-raised p-6' : 'border-t border-edge-strong pt-6'].join(' ')}><dt class="type-ui text-fg-soft">${s.label}</dt><dd class="m-0 type-hero max-sm:type-heading-1">${s.value}</dd></div>`)}</dl></section>`
	}
}

define('stat-block', StatBlock)
