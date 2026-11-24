import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// StepsBlock.tsx as <spyglass-steps-block>: numbered `steps` ({ title, body }) under hairlines, with an optional
// `heading` (React's `title`) and `body`.
export interface Step { title: string; body?: string }

/**
 * @summary How it works, in numbered steps.
 */
export class StepsBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="steps-block"]'))
	static properties = { steps: { type: Array }, heading: {}, body: {} }
	steps: Step[] = []
	/** The heading (React's `title`). */
	heading?: string
	body?: string

	render() {
		return html`<section data-ds="steps-block" class="grid gap-10 text-fg">${this.heading || this.body ? html`<div class="grid max-w-3xl gap-6">${this.heading ? html`<h2 class="type-section">${this.heading}</h2>` : nothing}${this.body ? html`<p class="max-w-measure type-body-lg text-fg-soft">${this.body}</p>` : nothing}</div>` : nothing}<ol class="m-0 grid list-none grid-cols-1 gap-8 p-0 md:auto-cols-fr md:grid-flow-col md:gap-6">${(this.steps ?? []).map((s, n) => html`<li class="grid content-start gap-3 border-t border-edge pt-6"><span class="type-label text-fg-muted">${String(n + 1).padStart(2, '0')}</span><h3 class="type-heading-3">${s.title}</h3>${s.body ? html`<p class="type-body text-fg-soft">${s.body}</p>` : nothing}</li>`)}</ol></section>`
	}
}

define('steps-block', StepsBlock)
