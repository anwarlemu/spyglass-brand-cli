import { html, nothing } from 'lit'
import { live } from 'lit/directives/live.js'
import { ArrowUp } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// PromptCard.tsx as <spyglass-prompt-card>: the site's prompt card, a two-line field (`placeholder`, `label`) with a
// square White send button and an optional row (`works-label`, `works` as words). Enter (without Shift) or the button
// fires `send` with { text }.

/**
 * @summary The site's prompt: a field and a send button in a #1A1A1A card with the 20px corner.
 * @fires send - With { text } when sent.
 */
export class PromptCard extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="prompt-card"]'))
	static properties = { placeholder: {}, label: {}, sendLabel: { attribute: 'send-label' }, worksLabel: { attribute: 'works-label' }, works: { type: Array }, value: {}, name: {}, disabled: { type: Boolean, reflect: true } }
	/** The hint in the empty field. */
	placeholder = 'Ask anything'
	/** The field's accessible name. */
	label = 'Your question'
	/** The send button's accessible name. */
	sendLabel = 'Send'
	/** The row's label. */
	worksLabel?: string
	/** The places it works, as words. */
	works: string[] = []
	value = ''
	name = 'q'
	disabled = false

	private send(event?: Event) {
		event?.preventDefault()
		const text = this.value.trim()
		if (!this.disabled && text) this.emit('send', { text })
	}

	render() {
		const works = this.works ?? []
		return html`<form data-ds="prompt-card" @submit=${(e: Event) => this.send(e)} class="grid w-full max-w-200 grid-cols-1 rounded-ds-lg bg-surface-subtle px-3 pt-3 text-left shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge-strong)] transition-[box-shadow] duration-160 ease-out has-[textarea:focus]:shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-fg-muted),0_0_0_var(--ds-border-focus)_var(--ds-color-edge-strong)]"><div class="flex flex-wrap items-end justify-end gap-3 pb-3"><textarea name=${this.name} .value=${live(this.value)} @input=${(e: Event) => (this.value = (e.target as HTMLTextAreaElement).value)} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) this.send(e) }} placeholder=${this.placeholder} aria-label=${this.label} ?disabled=${this.disabled} rows="2" class="block h-18 w-full min-w-0 flex-[1_1_100%] resize-none rounded-control bg-transparent px-4 py-3 type-body text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"></textarea><spyglass-button type="submit" icon aria-label=${this.sendLabel} ?disabled=${this.disabled} @click=${() => this.send()}>${icon(ArrowUp, 'arrow-up', { size: 24, strokeWidth: 2, attrs: { 'aria-hidden': 'true' } })}</spyglass-button></div>${this.worksLabel || works.length ? html`<div class="grid gap-2 border-t border-edge px-4 py-3 sm:flex sm:items-center sm:justify-between">${this.worksLabel ? html`<p class="type-ui text-fg-muted">${this.worksLabel}</p>` : nothing}${works.length ? html`<ul class="flex flex-wrap gap-x-5 gap-y-2 type-ui text-fg-soft">${works.map((w) => html`<li>${w}</li>`)}</ul>` : nothing}</div>` : nothing}</form>`
	}
}

define('prompt-card', PromptCard)
