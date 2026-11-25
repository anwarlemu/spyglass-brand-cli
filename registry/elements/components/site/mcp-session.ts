import { html, svg, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import { ASCII_TEXTURE } from '@/lib/textures'
import { sessionContent, startSession, typedText, type SessionContent, type SessionQuestion } from '@/lib/home/session'
import styles from 'virtual:tw'

// McpSession.tsx as <spyglass-mcp-session>: the chat window on its stage, asking the server a question at a typist's
// rhythm, the answer settling in, then the next; plays while a quarter on screen, rests with reduced motion.
// `content` as JSON: { server, status, label, composer, questions }.

const glyph = html`<span class="ds-ss-glyph" aria-hidden="true"><svg viewBox="0 0 16 16">${svg`<path d="M3 4.5h10M3 8h10M3 11.5h6"></path>`}</svg></span>`

/** @summary An AI chat asking an MCP server questions in turn, the answers arriving as tables. */
export class McpSession extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="mcp-session"]'))
	static properties = { content: { type: Object } }
	/** The server, the status, the composer's placeholder and the questions. */
	content: SessionContent = sessionContent
	private stop?: () => void

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = undefined
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!changed.has('content') && this.stop) return
		this.stop?.()
		const root = this.renderRoot.querySelector<HTMLElement>('.ds-ss')
		this.stop = root ? startSession(root, (this.content ?? sessionContent).questions) : undefined
	}

	private turn(q: SessionQuestion, first: boolean) {
		return html`<div class="ds-ss-turn" data-turn="" style=${ifDefined(first ? undefined : 'visibility: hidden')}><p class="ds-ss-message" data-message="">${q.mention ? html`<span class="ds-ss-mention">${q.mention} </span>` : ''}${q.text}</p><div class="ds-ss-agent"><p class="ds-ss-call" data-call="">${glyph}<span class="ds-ss-call-name">${q.tool}</span><span class="ds-ss-call-args">${q.args}</span></p><p class="ds-ss-reply" data-line="">${q.reply}</p><div class="ds-ss-thumbs" data-thumbs="">${q.images.map((img) => html`<span class="ds-ss-thumb" data-thumb=""><spyglass-creative-card ratio="fill" src=${ifDefined(img.src)} alt=${img.alt} fit=${ifDefined(img.fit)} position=${ifDefined(img.position)} tone=${img.tone ?? 2}></spyglass-creative-card></span>`)}</div><table class="ds-ss-table"><thead><tr data-line="">${q.columns.map((col) => html`<th scope="col">${col}</th>`)}</tr></thead><tbody>${q.rows.map((r) => html`<tr data-line=""><th scope="row">${r.label}</th><td>${r.value}</td></tr>`)}</tbody></table></div></div>`
	}

	render() {
		const c = this.content ?? sessionContent
		const qs = c.questions
		return html`<figure data-ds="mcp-session" class="ds-ss" aria-label=${c.label}><span class="ds-ss-ascii" aria-hidden="true" style=${`background-image: url("${ASCII_TEXTURE}")`}></span><div class="ds-ss-window" data-window=""><p class="ds-ss-server">${glyph}<span class="ds-ss-server-name">${c.server}</span><span class="ds-ss-status">${c.status}</span></p><div class="ds-ss-thread">${qs.map((q, i) => this.turn(q, i === 0))}</div><div class="ds-ss-composer" aria-hidden="true"><p class="ds-ss-input">${qs.map((q) => html`<span class="ds-ss-ghost">${typedText(q)}</span>`)}<span data-placeholder="" class="ds-ss-placeholder">${c.composer}</span><span data-typed="" data-q="0" class="ds-ss-typed">${qs.map((q, i) => html`<span data-q=${i} ?hidden=${i !== 0}>${[...typedText(q)].map((ch, k) => html`<span data-char="" class=${ifDefined(q.mention && k < q.mention.length ? 'ds-ss-mention' : undefined)} style="display: none">${ch}</span>`)}</span>`)}<span data-caret="" class="ds-ss-caret" style="opacity: 0"></span></span></p><span class="ds-ss-send"><svg viewBox="0 0 16 16">${svg`<path d="M8 12.5v-9M4 7.5l4-4 4 4"></path>`}</svg></span></div></div></figure>`
	}
}

define('mcp-session', McpSession)
