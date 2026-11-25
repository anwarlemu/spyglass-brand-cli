import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import { authContent, type AuthContent, authSections, type AuthSection } from '@/lib/pages/auth'
import { AUTH_LIGHT_LEFT, AUTH_LIGHT_RIGHT, AUTH_LIGHT_RIGHT_PHONE } from '@/lib/textures'
import { proofPlaceholders, type ProofLogo } from '@/elements/components/site/proof-strip'
import '@/elements/components/site/auth-form'
import '@/elements/components/site/proof-strip'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'

// AuthPage.tsx as <spyglass-auth-page>: the site's sign-in and sign-up pages, Black with the site's light images in two
// corners bobbing slowly (still with reduced motion), two ASCII crops from 1024, the lockup bar, the form centered in the
// height left and the proof row under it. `mode`, `content`, `logos` (JSON) and `proof` (the row, on sign-up by default); the provider's
// mark in the `provider-icon` slot; the form's `provider` and `email` events bubble out.

/**
 * @summary The sign-in and sign-up page.
 * @slot provider-icon - The provider's mark, 20px.
 */
export class AuthPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="auth-page"]'))
	static properties = { mode: { reflect: true }, content: { type: Object }, logos: { type: Array }, proof: { type: Boolean }, sections: { type: Array } }
	/** sign-in or sign-up. */
	mode: 'sign-in' | 'sign-up' = 'sign-up'
	/** The copy (lib/pages/auth.ts by default). */
	content: AuthContent = authContent
	/** The proof row's marks: { name, src?, ratio?, height? }. */
	logos: ProofLogo[] = proofPlaceholders
	/** Show the proof row; by default on sign-up only (sign-in keeps its room empty). */
	proof?: boolean
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: AuthSection[]

	render() {
		const c = this.content ?? authContent
		const logos = this.logos ?? proofPlaceholders
		const icon = this.querySelector('[slot="provider-icon"]') ? html`<slot name="provider-icon" slot="provider-icon"></slot>` : nothing
		const parts: Record<AuthSection, unknown> = {
			form: html`<spyglass-auth-form mode=${this.mode} .content=${c}>${icon}</spyglass-auth-form>`,
			proof: html`${(this.proof ?? this.mode === 'sign-up') ? html`<section aria-label=${c.proof} class="mx-auto flex min-h-(--ds-layout-auth-proof-h) w-full max-w-[calc(var(--ds-layout-auth-proof)+2*var(--ds-layout-gutter))] flex-col items-center gap-6 px-(--ds-layout-gutter)"><h2 class="type-ui text-fg-muted">${c.proof}</h2><spyglass-proof-strip .logos=${logos} tight></spyglass-proof-strip></section>` : html`<div aria-hidden="true" class="mx-auto min-h-(--ds-layout-auth-proof-h) w-full"></div>`}`,
		}
		return html`<div data-ds="auth-page" class="relative isolate grid min-h-svh grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] overflow-clip bg-surface text-fg"><div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-1 overflow-clip"><span class="ds-auth-light" data-side="left" style=${`background-image: url("${AUTH_LIGHT_LEFT}")`}></span><span class="ds-auth-light" data-side="right" style=${`--light-phone: url("${AUTH_LIGHT_RIGHT_PHONE}"); --light: url("${AUTH_LIGHT_RIGHT}")`}></span><span class="pointer-events-none absolute top-0 left-0 -z-1 hidden h-[44%] w-[36%] select-none lg:block" style=${asciiDriftStyle('mass', 'left')}></span><span class="pointer-events-none absolute right-0 bottom-0 -z-1 hidden h-[44%] w-[36%] select-none lg:block" style=${asciiDriftStyle('cluster', 'right')}></span></div><header class="relative z-1"><div class="mx-auto flex h-16 w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] items-center px-(--ds-layout-gutter) lg:h-header"><a href="/" aria-label=${c.home} class="-ms-2 block rounded-ds-sm px-2 py-3 text-fg"><spyglass-logo height="20"></spyglass-logo></a></div></header><main class="ds-auth-main flex min-w-0 flex-col justify-center gap-16 py-8">${pageSections(authSections, this.sections).map((k) => parts[k])}</main></div>`
	}
}

define('auth-page', AuthPage)
