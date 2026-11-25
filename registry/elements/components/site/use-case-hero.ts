import { html, nothing, type PropertyValues } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { Plug } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import { ASCII_TEXTURE } from '@/lib/textures'
import { runBuild, runChat, typedText, turnPictures, tileSlot, useCaseBuildContent, useCaseChatContent, useCaseHeroContent, type BuildContent, type ChatContent, type ChatPicture, type ChatTurn, type UseCaseHeroContent } from '@/lib/use-case-hero'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'
import { imageFit } from '@/lib/image'
import { styleMap } from 'lit/directives/style-map.js'

// UseCaseHero.tsx as <spyglass-use-case-hero>: the use case page's hero, the head, line, actions (or the `control`
// slot in the White button's place, stepping aside on phones as the site's MCP pair does) and who it is for, beside the
// raised panel with the visual: `visual="chat"`, the session answering questions in turn (chips pick one), or
// `visual="build"`, the team's own library re-sorting itself. `content`, `chat` and `build` take JSON. The motion runs
// in lib/use-case-hero.ts; with reduced motion the chat shows an answer and the library holds still.

/**
 * @summary The use case hero: head, actions and a chat or library visual.
 * @slot control - A control in the White button's place (a connect menu).
 */
export class UseCaseHero extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="use-case-hero"]'))
	static properties = {
		content: { type: Object },
		visual: { reflect: true },
		chat: { type: Object },
		build: { type: Object },
		pair: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
	}
	/** The copy ({ id, name, line, forWho, primary, secondary, source }). */
	content: UseCaseHeroContent = useCaseHeroContent
	/** chat (the default) or build. */
	visual: 'chat' | 'build' = 'chat'
	/** The chat's session. */
	chat: ChatContent = useCaseChatContent
	/** The build visual's library. */
	build: BuildContent = useCaseBuildContent
	/** On phones, hide the control and turn the quiet button White; pair="false" keeps both. */
	pair = true

	private stop?: () => void

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (!this.stop || changed.has('visual') || changed.has('chat') || changed.has('build')) {
			this.stop?.()
			const chat = this.renderRoot.querySelector<HTMLElement>('[data-uch-chat]')
			const build = this.renderRoot.querySelector<HTMLElement>('[data-uch-build]')
			this.stop = chat ? runChat(chat, (this.chat ?? useCaseChatContent).turns) : build ? runBuild(build, this.build ?? useCaseBuildContent) : undefined
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stop = undefined
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.requestUpdate('visual')
	}

	render() {
		const c = this.content ?? useCaseHeroContent
		const control = this.hasSlot('control')
		const paired = control && this.pair
		return html`<section data-ds="use-case-hero" aria-labelledby=${`${c.id}-heading`} class="ds-uch relative isolate grid items-center text-fg"><span aria-hidden="true" class="ds-uch-drift" data-at="top" style=${asciiDriftStyle('scatter', 'top', 'hero')}></span><span aria-hidden="true" class="ds-uch-drift" data-at="side" style=${asciiDriftStyle('column', 'left', 'hero')}></span><span aria-hidden="true" class="ds-uch-drift" data-at="foot" style=${asciiDriftStyle('mass', 'centre', 'hero')}></span><div class="ds-uch-wrap grid grid-cols-[minmax(0,1fr)] gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12"><div class="flex min-w-0 flex-col items-start"><h1 id=${`${c.id}-heading`} class="type-section text-balance">${c.name}</h1><p class="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">${c.line}</p><div class="mt-10 flex flex-col gap-3 self-stretch md:flex-row md:flex-wrap md:self-auto">${control ? html`<div class=${paired ? 'contents max-md:hidden' : 'contents'}><slot name="control"></slot></div>` : html`<spyglass-button href=${c.primary.href}>${c.primary.label}</spyglass-button>`}${paired ? html`<div class="contents max-md:hidden"><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div><div class="contents md:hidden"><spyglass-button href=${c.secondary.href}>${c.secondary.label}</spyglass-button></div>` : html`<spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button>`}</div><p class="mt-6 type-ui text-pretty text-fg-muted">${c.forWho}.</p></div><div class="ds-uch-box"><span aria-hidden="true" class="ds-uch-ascii" style=${`background-image: url("${ASCII_TEXTURE}")`}></span>${this.visual === 'build' ? this.renderBuild(this.build ?? useCaseBuildContent) : this.renderChat(this.chat ?? useCaseChatContent)}${c.source ? html`<p class="sr-only">${c.source}</p>` : nothing}</div></div></section>`
	}

	private picture(p: ChatPicture, cls: string, extra: { pic?: number; style?: string } = {}) {
		return html`<span class=${p.src ? cls : `${cls} ds-uch-tone-${p.tone ?? 2}`} data-ds-placeholder=${p.src ? nothing : ''} data-pic=${extra.pic ?? nothing} style=${extra.style ?? nothing}>${p.src ? html`<img class="ds-uch-pic" src=${p.src} alt="" loading="lazy" decoding="async" style=${styleMap(imageFit(p) ?? {})}>` : nothing}</span>`
	}

	private renderChat(content: ChatContent) {
		const turns = content.turns
		const mark = icon(Plug, 'plug', { size: 16, strokeWidth: 1.5, class: 'ds-uch-mark', attrs: { 'aria-hidden': 'true' } })
		return html`<figure data-uch-chat="" class="ds-uch-chat" aria-label=${content.label}><div class="ds-uch-scene"><div class="ds-uch-window" data-window=""><p class="ds-uch-server">${mark}<span class="ds-uch-server-name">${content.server}</span><span class="ds-uch-status type-label">${content.status}</span></p><div class="ds-uch-thread" data-thread="">${turns.map((t, i) => this.renderTurn(t, i))}</div><div class="ds-uch-composer"><p class="ds-uch-input" aria-hidden="true">${turns.map((t) => html`<span class="ds-uch-ghost">${typedText(t)}</span>`)}<span data-placeholder="" class="ds-uch-placeholder">${content.composer}</span><span data-typed="" class="ds-uch-typed">${turns.map((t, i) => html`<span data-q=${i} ?hidden=${i !== 0}>${[...typedText(t)].map((ch, k) => html`<span data-char="" class=${t.mention && k < t.mention.length ? 'ds-uch-mention' : nothing} style="display: none;">${ch}</span>`)}</span>`)}<span data-caret="" class="ds-uch-caret" style="opacity: 0;"></span></span></p><div class="ds-uch-chips" role="group" aria-label=${content.chipsLabel} data-chips=""><span class="ds-uch-pill" data-pill="" aria-hidden="true"></span>${turns.map((t, i) => html`<button type="button" class="ds-uch-chip" data-chip=${i} aria-pressed=${String(i === 0)}>${t.chip}</button>`)}</div><span class="ds-uch-send" aria-hidden="true"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12.5v-9M4 7.5l4-4 4 4"></path></svg></span></div></div></div><p data-live="" class="sr-only" aria-live="polite"></p></figure>`
	}

	private renderTurn(turn: ChatTurn, index: number) {
		const pictures = turnPictures(turn)
		const mark = icon(Plug, 'plug', { size: 16, strokeWidth: 1.5, class: 'ds-uch-mark', attrs: { 'aria-hidden': 'true' } })
		return html`<div class="ds-uch-turn" data-turn=${index} style=${index === 0 ? nothing : 'visibility: hidden;'}><p class="ds-uch-message" data-message="">${turn.mention ? html`<span class="ds-uch-mention">${turn.mention} </span>` : nothing}${turn.question}</p><div class="ds-uch-agent"><p class="ds-uch-worked" data-call="">${turn.status}</p><p class="ds-uch-call" data-call="">${mark}<span class="ds-uch-call-name">${turn.tool}</span><span class="ds-uch-call-args">${turn.args}</span></p>${turn.post ? html`<div class="ds-uch-lead" data-line=""><p class="ds-uch-reply">${turn.lead}</p><p class="ds-uch-row">${this.picture(turn.post.picture, 'ds-uch-thumb')}<span class="ds-uch-row-text ds-uch-post-text">${turn.post.title}<span class="ds-uch-detail">${turn.post.detail}</span></span></p></div>` : html`<p class="ds-uch-reply" data-line="">${turn.lead}</p>`}<table class="ds-uch-table"><thead><tr data-line="">${turn.columns.map((col) => html`<th scope="col">${col}</th>`)}</tr></thead><tbody>${turn.rows.map((r) => html`<tr data-line=""><th scope="row"><span class="ds-uch-row">${r.picture ? this.picture(r.picture, 'ds-uch-thumb') : nothing}<span class="ds-uch-row-text">${r.label}<span class="ds-uch-detail">${r.detail}</span></span></span></th><td>${r.value}</td></tr>`)}</tbody></table>${pictures.length ? html`<div class="ds-uch-strip" data-strip="" aria-hidden="true">${pictures.map((p, k) => this.picture(p, 'ds-uch-strip-pic', { pic: k, style: `aspect-ratio: ${p.ratio ?? 0.8};` }))}</div>` : nothing}</div></div>`
	}

	private renderBuild(b: BuildContent) {
		const sort = b.sorts[0]
		const swap = (text: string) => unsafeHTML(`<span class="ds-uch-swap-item" data-state="in">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`)
		return html`<div data-uch-build="" class="ds-uch-build"><p class="sr-only">${b.description}</p><div class="ds-uch-bwin" aria-hidden="true"><div class="ds-uch-bar"><span class="ds-uch-dots"><span class="ds-uch-dot bg-(--ds-color-window-close)"></span><span class="ds-uch-dot bg-(--ds-color-window-min)"></span><span class="ds-uch-dot bg-(--ds-color-window-full)"></span></span><span class="ds-uch-url">${b.url}</span><span class="ds-uch-built-on">${b.builtOn}</span></div><div class="ds-uch-body"><div class="ds-uch-head"><span class="ds-uch-titles"><span class="ds-uch-title">${b.title}</span><span class="ds-uch-meta">${b.meta}</span></span><span class="ds-uch-sort"><span class="ds-uch-swap" data-swap="sort">${swap(sort.label)}</span></span></div><div class="ds-uch-grid">${b.tiles.map(() => html`<span class="ds-uch-cell"></span>`)}${b.tiles.map((t) => {
			const { col, row } = tileSlot(sort, t.id)
			return html`<span class=${t.src ? 'ds-uch-tile' : `ds-uch-tile ds-uch-tone-${t.tone ?? 2}`} data-ds-placeholder=${t.src ? nothing : ''} data-tile=${t.id} style=${`--col: ${col}; --row: ${row};`}>${t.src ? html`<img class="ds-uch-pic" src=${t.src} alt="" decoding="async" style=${styleMap(imageFit(t) ?? {})}>` : nothing}<span class="ds-uch-badge"><span class="ds-uch-swap" data-swap=${`figure:${t.id}`}>${swap(t.figure[sort.key] ?? '')}</span></span></span>`
		})}</div><div class="ds-uch-code"><span class="ds-uch-line"><span class="ds-uch-c-fg">${b.call.method}</span> <span class="ds-uch-c-muted">${b.call.path}</span></span>${b.call.lines.map((line) => html`<span class="ds-uch-line"><span class="ds-uch-c-soft">"${line.key}"</span><span class="ds-uch-c-muted">: </span>${line.value === null ? html`<span class="ds-uch-swap ds-uch-c-fg" data-swap="sortBy">${swap(sort.sortBy)}</span>` : html`<span class="ds-uch-c-fg">${line.value}</span>`}</span>`)}</div></div></div></div>`
	}
}

define('use-case-hero', UseCaseHero)
