import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/page-head'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// ErrorHead.tsx as <spyglass-error-head>: the page head with no drift, the title in one line, the lead, a White
// "Try again" button (fires `retry`) beside the quiet way home. `content` as JSON: { lines, lead, retry, home }.
export interface ErrorHeadContent { lines: string[]; lead: string; retry: string; home: { label: string; href: string } }
export const errorHeadContent: ErrorHeadContent = {
	lines: ['Something went wrong'],
	lead: 'This page did not load. Try again, or start from the homepage.',
	retry: 'Try again',
	home: { label: 'Go to the homepage', href: '/' },
}

/**
 * @summary The error page's head: try again or go home.
 * @fires retry - When the White button is pressed.
 */
export class ErrorHead extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('spyglass-page-head'))
	static properties = { content: { type: Object } }
	content: ErrorHeadContent = errorHeadContent

	render() {
		const c = this.content ?? errorHeadContent
		return html`<div data-ds="error-head" class="contents"><spyglass-page-head head-id="error" .lines=${[c.lines.join(' ')]} .lead=${c.lead} .drift=${false} .pair=${false} .secondary=${c.home}><spyglass-button slot="control" @click=${() => this.emit('retry')}>${c.retry}</spyglass-button></spyglass-page-head></div>`
	}
}

define('error-head', ErrorHead)
