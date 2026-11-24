import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/ui/input'
import styles from 'virtual:tw'

// NewsletterBlock.tsx as <spyglass-newsletter-block>: the `heading` (React's `title`), `body`, an email field and the
// `cta` button, the `note` under them; fires `subscribe` with { email } and then shows `done`.

/**
 * @summary A newsletter sign-up on a card.
 * @fires subscribe - With { email }.
 */
export class NewsletterBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="newsletter-block"]'))
	static properties = { heading: {}, body: {}, placeholder: {}, cta: {}, note: {}, done: {}, sent: { state: true } }
	/** The heading (React's `title`). */
	heading = ''
	body?: string
	placeholder = 'you@company.com'
	/** The button's label. */
	cta = 'Subscribe'
	/** Small print under the field. */
	note?: string
	/** Said in the field's place once subscribed. */
	done = 'You are on the list.'
	private sent = false

	private submit(e: Event) {
		e.preventDefault()
		const input = this.renderRoot.querySelector('spyglass-input') as (HTMLElement & { value?: string }) | null
		const email = String(input?.value ?? '').trim()
		if (!email) return
		this.emit('subscribe', { email })
		this.sent = true
	}

	render() {
		return html`<section data-ds="newsletter-block" class="grid gap-6 rounded-container bg-surface-raised p-8 text-fg max-sm:p-6 lg:grid-cols-2 lg:items-end lg:gap-12"><div class="grid gap-3"><h2 class="type-heading-1">${this.heading}</h2>${this.body ? html`<p class="max-w-measure type-body text-fg-soft">${this.body}</p>` : nothing}</div><div class="grid gap-3">${this.sent ? html`<p role="status" class="type-body text-fg">${this.done}</p>` : html`<form @submit=${(e: Event) => this.submit(e)} class="flex gap-3 max-sm:flex-col"><spyglass-input name="email" type="email" autocomplete="email" required placeholder=${this.placeholder} aria-label="Email" class="min-w-0 flex-1"></spyglass-input><spyglass-button type="submit" @click=${(e: Event) => this.submit(e)}>${this.cta}</spyglass-button></form>`}${this.note ? html`<p class="type-caption text-fg-muted">${this.note}</p>` : nothing}</div></section>`
	}
}

define('newsletter-block', NewsletterBlock)
