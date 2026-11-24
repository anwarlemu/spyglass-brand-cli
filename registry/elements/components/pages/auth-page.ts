import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { authContent, type AuthContent } from '@/lib/pages/auth'
import '@/elements/components/ui/button'
import '@/elements/components/ui/field'
import '@/elements/components/ui/input'
import '@/elements/components/visuals/brand-light'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// AuthPage.tsx as <spyglass-auth-page>: sign in or sign up (`mode`), the light field, the lockup and the card with the
// fields and the one White button. `content` replaces the copy; the form posts to `action`.

/**
 * @summary The sign-in and sign-up page.
 */
export class AuthPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="auth-page"]'))
	static properties = { mode: {}, content: { type: Object }, action: {} }
	/** sign-in or sign-up. */
	mode: 'sign-in' | 'sign-up' = 'sign-in'
	/** The page's copy (lib/pages/auth.ts by default). */
	content: AuthContent = authContent
	/** Where the form posts. */
	action?: string

	render() {
		const c = this.content ?? authContent
		const m = this.mode === 'sign-up' ? c.signUp : c.signIn
		const link = 'rounded-ds-sm underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-160 ease-out hover:decoration-fg'
		return html`<div data-ds="auth-page" class="relative isolate flex min-h-dvh flex-col items-center bg-surface px-4 pt-24 pb-16 text-fg"><spyglass-brand-light variant="field" ground="false" cover class="absolute inset-x-0 top-0 -z-10 h-64 mask-b-from-30%"></spyglass-brand-light><a href="/" aria-label="Home" class="rounded-control"><spyglass-logo height="24"></spyglass-logo></a><main class="mt-10 grid w-full max-w-100 gap-6 rounded-container bg-surface-raised p-8 max-sm:p-6"><div class="grid gap-2"><h1 class="type-heading-2">${m.headline}</h1><p class="type-body text-fg-soft">${m.body}</p></div><form action=${ifDefined(this.action)} method="post" class="grid gap-5"><spyglass-field label=${c.email.label}><spyglass-input name="email" type="email" autocomplete="email" placeholder=${c.email.placeholder} required></spyglass-input></spyglass-field><spyglass-field label=${c.password.label}><spyglass-input name="password" type="password" autocomplete=${this.mode === 'sign-up' ? 'new-password' : 'current-password'} placeholder=${c.password.placeholder} required></spyglass-input></spyglass-field>${this.mode === 'sign-in' ? html`<a href=${c.forgot.href} class=${`justify-self-start type-ui text-fg-soft ${link}`}>${c.forgot.label}</a>` : nothing}<spyglass-button type="submit" class="w-full">${m.submit}</spyglass-button></form><p class="type-ui text-fg-muted">${m.switch.text} <a href=${m.switch.href} class=${`text-fg ${link}`}>${m.switch.label}</a></p></main><p class="mt-6 max-w-100 text-center type-caption text-fg-muted">${c.legal}</p></div>`
	}
}

define('auth-page', AuthPage)
