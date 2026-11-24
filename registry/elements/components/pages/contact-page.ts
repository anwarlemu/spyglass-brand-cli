import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { contactContent, type ContactContent } from '@/lib/pages/contact'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/ui/textarea'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// ContactPage.tsx as <spyglass-contact-page>: the heading and a line beside the form on the card fill. The form posts
// to `content.form.action`; it first fires a cancelable `send` event with { name, email, message }, and a listener
// that calls preventDefault() takes the values instead (React's `onSubmit`).
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

/**
 * @summary The contact page template.
 * @fires send - On submit, with { name, email, message }; preventDefault() keeps the form from posting.
 */
export class ContactPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="contact-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/contact.ts by default). */
	content: ContactContent = contactContent

	private onSubmit(e: SubmitEvent) {
		const form = e.currentTarget as HTMLFormElement
		const d = new FormData(form)
		const detail = { name: String(d.get('name') ?? ''), email: String(d.get('email') ?? ''), message: String(d.get('message') ?? '') }
		const ev = new CustomEvent('send', { detail, bubbles: true, composed: true, cancelable: true })
		if (!this.dispatchEvent(ev)) e.preventDefault()
	}

	render() {
		const c = this.content ?? contactContent
		const f = c.form
		return html`<div data-ds="contact-page" class="flex min-h-dvh flex-col bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main class=${`${WRAP} grid flex-1 grid-cols-2 items-start gap-12 py-24 max-md:grid-cols-1 max-md:gap-8 max-sm:py-16`}>
<div class="grid max-w-xl gap-6"><h1 class="type-section">${c.headline}</h1><p class="type-body-lg text-fg-soft">${c.body}</p></div>
<form aria-label=${f.label} action=${f.action} method="post" @submit=${this.onSubmit} class="grid gap-6 rounded-container bg-surface-raised p-8 max-sm:p-6">
<spyglass-field label=${f.name.label}><spyglass-input name="name" autocomplete="name" placeholder=${f.name.placeholder} required></spyglass-input></spyglass-field>
<spyglass-field label=${f.email.label} description=${f.email.description}><spyglass-input name="email" type="email" autocomplete="email" placeholder=${f.email.placeholder} required></spyglass-input></spyglass-field>
<spyglass-field label=${f.message.label}><spyglass-textarea name="message" rows="6" placeholder=${f.message.placeholder} required></spyglass-textarea></spyglass-field>
<spyglass-button type="submit" class="w-full">${f.submit}</spyglass-button>
</form>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('contact-page', ContactPage)
