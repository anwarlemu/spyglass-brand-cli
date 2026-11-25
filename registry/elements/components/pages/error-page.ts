import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { errorContent, type ErrorContent, errorSections, type ErrorSection } from '@/lib/pages/error'
import '@/elements/components/site/error-head'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'

// ErrorPage.tsx as <spyglass-error-page>: what shows when a page fails to render, the error head alone on Black (the
// title, the plain sentence, Try again, which fires `retry`, and the way home). `content` replaces the copy.

/**
 * @summary The error page.
 * @fires retry - When Try again is pressed.
 */
export class ErrorPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="error-page"]'))
	static properties = { content: { type: Object }, sections: { type: Array } }
	/** The page's copy (lib/pages/error.ts by default). */
	content: ErrorContent = errorContent
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: ErrorSection[]

	render() {
		const c = this.content ?? errorContent
		const parts: Record<ErrorSection, unknown> = {
			head: html`<div class="-mb-6 md:-mb-5 lg:-mb-3"><spyglass-error-head .content=${c} @retry=${(e: Event) => { e.stopPropagation(); this.emit('retry') }}></spyglass-error-head></div>`,
		}
		return html`<div data-ds="error-page" class="min-h-svh bg-surface text-fg"><main id="main">${pageSections(errorSections, this.sections).map((k) => parts[k])}</main></div>`
	}
}

define('error-page', ErrorPage)
