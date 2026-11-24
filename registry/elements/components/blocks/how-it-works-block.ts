import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/site/connect-menu'
import '@/elements/components/site/mcp-session'
import '@/elements/components/visuals/side-drifts'
import type { ConnectContent } from '@/lib/connect'
import type { SessionContent } from '@/lib/home/session'
import { howItWorksContent, howMarks, type HowItWorksContent, type HowMark } from '@/lib/home/how-it-works'
import styles from 'virtual:tw'

// HowItWorksBlock.tsx as <spyglass-how-it-works-block>: the headline, lead, three steps, the connect menu and the
// quiet button, the clients' marks, and the MCP session beside them from 1024. `content`, `marks`, `connect` and
// `session` as JSON.

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/** @summary The home's set-up section: three steps, the connect menu and the MCP session playing. */
export class HowItWorksBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="how-it-works-block"]'))
	static properties = { content: { type: Object }, marks: { type: Array }, connect: { type: Object }, session: { type: Object } }
	/** { headline, lead, steps, secondary, marksLabel }. */
	content: HowItWorksContent = howItWorksContent
	/** The clients' marks: { name, href, src? }. */
	marks: HowMark[] = howMarks
	/** The connect menu's rows (lib/connect.ts). */
	connect?: ConnectContent
	/** The session's questions (lib/home/session.ts). */
	session?: SessionContent

	render() {
		const c = this.content ?? howItWorksContent
		const marks = this.marks ?? howMarks
		return html`<section data-ds="how-it-works-block" class="relative isolate py-(--ds-layout-section) text-fg"><spyglass-side-drifts left="middle" right="false"></spyglass-side-drifts><div class=${`${CONTAINER} ds-hw-layout`}><div class="ds-hw-copy"><h2 class="type-section">${c.headline}</h2><p class="ds-hw-lead mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${c.lead}</p><ol class="ds-hw-steps">${c.steps.map((step, i) => html`<li class="ds-hw-step"><span class="ds-hw-number" aria-hidden="true">${i + 1}</span><p class="ds-hw-step-text"><span class="ds-hw-step-title">${step.title}</span> ${step.body}</p></li>`)}</ol><div class="ds-hw-actions"><spyglass-connect-menu .content=${this.connect}></spyglass-connect-menu><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div>${marks.length ? html`<ul class="ds-hw-marks" aria-label=${c.marksLabel}>${marks.map((m) => html`<li><a class="ds-hw-mark-link" href=${m.href}>${m.src ? html`<span class="ds-hw-mark" style=${`--mark: url("${m.src}")`} aria-hidden="true"></span>` : html`<span class="ds-hw-letter" aria-hidden="true">${m.name.replace(/^Acme /, '').slice(0, 1)}</span>`}<span class="ds-hw-mark-name">${m.name}</span></a></li>`)}</ul>` : nothing}</div><spyglass-mcp-session .content=${this.session}></spyglass-mcp-session></div></section>`
	}
}

define('how-it-works-block', HowItWorksBlock)
