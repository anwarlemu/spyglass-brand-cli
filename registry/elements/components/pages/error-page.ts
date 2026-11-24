import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { errorContent, type ErrorContent } from '@/lib/pages/error'
import '@/elements/components/ui/button'
import '@/elements/components/blocks/hero-block'
import '@/elements/components/visuals/logo'
import styles from 'virtual:tw'

// ErrorPage.tsx as <spyglass-error-page>: the 500 page, the plain sentence, try again (fires `retry`) and the way home.

/**
 * @summary The 500 page template.
 * @fires retry - When Try again is pressed.
 */
export class ErrorPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="error-page"]'))
	static properties = { content: { type: Object } }
	/** The page's copy (lib/pages/error.ts by default). */
	content: ErrorContent = errorContent

	render() {
		const c = this.content ?? errorContent
		return html`<div data-ds="error-page" class="flex min-h-dvh flex-col bg-surface text-fg"><div class="mx-auto flex h-16 w-full max-w-page-wide items-center px-12 max-sm:px-4 lg:h-header"><a href=${c.home.href} aria-label="Home" class="rounded-control"><spyglass-logo height="20"></spyglass-logo></a></div><main class="flex flex-1 flex-col"><spyglass-hero-block eyebrow=${c.eyebrow} headline=${c.headline} body=${c.body} placement="center" light="corner" class="flex-1"><spyglass-button slot="actions" href=${ifDefined(c.retry.href || undefined)} @click=${() => this.emit('retry')}>${c.retry.label}</spyglass-button><spyglass-button slot="actions" href=${c.home.href} variant="secondary">${c.home.label}</spyglass-button><p class="text-center type-ui text-fg-muted"><a href=${c.contact.href} class="rounded-ds-sm underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-160 ease-out hover:decoration-fg">${c.contact.label}</a></p></spyglass-hero-block></main></div>`
	}
}

define('error-page', ErrorPage)
