import { html, nothing } from 'lit'
import { live } from 'lit/directives/live.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { authContent, emailProblem, type AuthContent } from '@/lib/pages/auth'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// AuthForm.tsx as <spyglass-auth-form>: the site's sign-in and sign-up form, the title and lead, a quiet provider
// button, the "or" rule, the email field with its message, the one White button, the legal line and the way to the other
// mode. A press shows a spinner in the pressed button until the app takes over. The provider's mark goes in the
// `provider-icon` slot. `provider` and `email` (with { email }) fire on a press; unless a listener calls
// preventDefault(), the press goes to the mode's `next` address.

/**
 * @summary The sign-in and sign-up form.
 * @slot provider-icon - The provider's mark, 20px.
 * @fires provider - The provider button pressed (cancelable).
 * @fires email - A valid email sent, with { email } (cancelable).
 */
export class AuthForm extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="auth-form"]'))
	static properties = { mode: { reflect: true }, content: { type: Object }, email: { state: true }, error: { state: true }, busy: { state: true } }
	/** sign-in or sign-up. */
	mode: 'sign-in' | 'sign-up' = 'sign-up'
	/** The copy (lib/pages/auth.ts by default). */
	content: AuthContent = authContent
	private email = ''
	private error = ''
	private busy: 'provider' | 'email' | null = null
	private uid = uid('auth')

	private back = (event: PageTransitionEvent) => { if (event.persisted) this.busy = null }
	connectedCallback() {
		super.connectedCallback()
		window.addEventListener('pageshow', this.back)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		window.removeEventListener('pageshow', this.back)
	}

	private go(method: 'provider' | 'email', value = '') {
		if (this.busy) return
		this.busy = method
		const c = this.content ?? authContent
		const m = this.mode === 'sign-in' ? c.signIn : c.signUp
		const free = method === 'provider' ? this.emit('provider', undefined, { cancelable: true }) : this.emit('email', { email: value }, { cancelable: true })
		if (free) window.location.assign(m.next)
	}

	private submit(event: Event) {
		event.preventDefault()
		if (this.busy) return
		const problem = emailProblem(this.email, this.content ?? authContent)
		this.error = problem
		if (problem) this.renderRoot.querySelector<HTMLInputElement>('input')?.focus()
		else this.go('email', this.email.trim())
	}

	private labels(busy: boolean, label: unknown) {
		return html`<span class="grid place-items-center"><span class=${['col-start-1 row-start-1 inline-flex items-center gap-3 transition-opacity duration-160 ease-out', busy ? 'opacity-0' : ''].join(' ')}>${label}</span><span aria-hidden="true" class=${['col-start-1 row-start-1 inline-flex items-center transition-opacity duration-160 ease-out', !busy ? 'opacity-0' : ''].join(' ')}><span class=${['ds-auth-spin size-5 rounded-full border-2 border-current border-t-transparent', !busy ? '[animation-play-state:paused]' : ''].join(' ')}></span></span></span>`
	}

	render() {
		const c = this.content ?? authContent
		const m = this.mode === 'sign-in' ? c.signIn : c.signUp
		const id = this.uid
		const link = 'rounded-ds-sm underline decoration-transparent decoration-from-font underline-offset-4 transition-[text-decoration-color] duration-160 ease-out pointer-fine:hover:decoration-current'
		const icon = this.querySelector('[slot="provider-icon"]') ? html`<span class="grid size-5 flex-none place-items-center [&_svg]:size-5"><slot name="provider-icon"></slot></span>` : nothing
		return html`<section data-ds="auth-form" aria-labelledby=${`${id}-title`} class="mx-auto flex w-full max-w-[calc(var(--ds-layout-auth)+2*var(--ds-layout-gutter))] flex-col items-center px-(--ds-layout-gutter) text-center text-fg"><h1 id=${`${id}-title`} class="type-title md:whitespace-nowrap">${m.title}</h1>${m.lead ? html`<p class="mt-3 type-body text-balance text-fg-soft">${m.lead}</p>` : nothing}<spyglass-button variant="secondary" size="form" class="mt-8 w-full" aria-disabled=${this.busy ? 'true' : nothing} @click=${() => this.go('provider')}>${this.labels(this.busy === 'provider', html`${icon}${c.provider}`)}</spyglass-button><p class="my-4 flex w-full items-center gap-4 type-ui text-fg-muted before:h-px before:flex-1 before:bg-edge after:h-px after:flex-1 after:bg-edge">${c.or}</p><form novalidate @submit=${(e: Event) => this.submit(e)} class="flex w-full flex-col text-left"><div class="mb-2 flex justify-between gap-4 type-ui"><label for=${`${id}-email`} class="font-medium">${c.email}</label><span id=${`${id}-error`} role="alert" class="text-fg">${this.error}</span></div><input id=${`${id}-email`} type="email" inputmode="email" autocomplete="email" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder=${c.placeholder} .value=${live(this.email)} aria-invalid=${this.error ? 'true' : nothing} aria-describedby=${this.error ? `${id}-error` : nothing} @input=${(e: Event) => { this.email = (e.target as HTMLInputElement).value; if (this.error) this.error = '' }} class="mb-3 h-control-form w-full appearance-none rounded-control bg-surface-subtle px-4 type-body text-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge)] transition-[box-shadow] duration-160 ease-out placeholder:text-fg-muted focus-visible:-outline-offset-1 aria-invalid:shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-white)]"><spyglass-button type="submit" size="form" class="w-full" aria-disabled=${this.busy ? 'true' : nothing}>${this.labels(this.busy === 'email', m.submit)}</spyglass-button></form><p role="status" class="sr-only">${this.busy ? c.working : ''}</p><p class="mt-5 type-ui text-balance text-fg-faint">${c.legal.before}<a href=${c.legal.terms.href} class=${`text-fg-soft ${link}`}>${c.legal.terms.label}</a>${c.legal.between}<a href=${c.legal.privacy.href} class=${`text-fg-soft ${link}`}>${c.legal.privacy.label}</a>${c.legal.after}</p><p class="mt-5 type-ui text-fg-muted">${m.other.ask} <a href=${m.other.href} class=${`relative py-3 font-medium text-fg ${link}`}>${m.other.label}</a></p></section>`
	}
}

define('auth-form', AuthForm)
