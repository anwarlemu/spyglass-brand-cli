import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// LogoStripBlock.tsx as <spyglass-logo-strip-block>: a `label` in capitals over a row of `names`, each set as a
// Funnel Display wordmark in the muted gray; the default slot (the marks themselves) replaces the names.

/**
 * @summary A row of customer names as wordmarks.
 * @slot - The marks themselves, instead of the names.
 */
export class LogoStripBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="logo-strip-block"]'))
	static properties = { names: { type: Array }, label: {} }
	/** The names, each set as a wordmark. */
	names: string[] = []
	/** A line in capitals above the row. */
	label?: string

	render() {
		return html`<section data-ds="logo-strip-block" class="grid gap-8 text-fg max-sm:gap-6">${this.label ? html`<p class="type-label text-fg-muted">${this.label}</p>` : nothing}${this.hasSlot() ? html`<div class="flex flex-wrap items-center justify-between gap-x-12 gap-y-6"><slot></slot></div>` : html`<ul class="flex flex-wrap items-center justify-between gap-x-12 gap-y-6">${(this.names ?? []).map((n) => html`<li class="type-heading-3 text-fg-muted">${n}</li>`)}</ul>`}</section>`
	}
}

define('logo-strip-block', LogoStripBlock)
