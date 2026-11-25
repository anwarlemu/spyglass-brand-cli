import { html, nothing, type PropertyValues } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { pieceStartStyle, runScrollStory, stillRatio, trackHeight, type ScrollStoryData, type StoryAction, type StoryImage, type StoryLogo, type StoryPiece } from '@/lib/scroll-story'
import { scrollStories, type ScrollStoryPreset } from '@/lib/pages/scroll-stories'
import '@/elements/components/ui/button'
import '@/elements/components/site/browser-frame'
import '@/elements/components/site/creative-card'
import styles from 'virtual:tw'
import { imageFit } from '@/lib/image'

// ScrollStory.tsx as <spyglass-scroll-story>: the site's scroll story. From 1024 with motion allowed the stage pins and
// the pieces move on keyframes as the reader scrolls, the chapters' words rising in turn; below 1024 or with reduced
// motion the chapters stack over still arrangements. `story` (JSON, lib/scroll-story.ts) or `preset` (research,
// sentiment, landing, channels: the Acme stories), and `actions` (JSON [{ label, href }]) under the last chapter.

type Piece<K extends StoryPiece['kind']> = Extract<StoryPiece, { kind: K }>

const shot = (image: StoryImage) =>
	image.src
		? html`<img src=${image.src} alt="" loading="lazy" decoding="async" style=${styleMap(imageFit(image) ?? {})}>`
		: html`<span class="ds-story-fill"><spyglass-creative-card ratio="fill" caption=${image.caption ?? nothing} tone=${image.tone ?? 2}></spyglass-creative-card></span>`

const logo = (l: StoryLogo) => html`<span class="ds-story-logo">${l.src ? html`<img src=${l.src} alt="">` : l.name.charAt(0).toUpperCase()}</span>`

const searchIcon = html`<svg class="ds-story-search-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>`

const board = (p: Piece<'board'>) =>
	html`<span class="ds-story-board" ?data-compact=${!!p.compact}>${p.query
		? html`<span class="ds-story-search">${searchIcon}<span class="ds-story-search-text">${p.query}</span></span>${p.filters ? html`<span class="ds-story-filters">${p.filters.map((f) => {
				const [label, value] = f.split(': ')
				return html`<span class="ds-story-filter"><span class="ds-story-muted">${label}:</span> ${value}</span>`
			})}</span>` : nothing}`
		: html`<span class="ds-story-board-name">${p.logo ? logo(p.logo) : nothing}${p.logos ? html`<span class="ds-story-board-stack">${p.logos.map(logo)}${p.more ? html`<span class="ds-story-more">+${p.more}</span>` : nothing}</span>` : nothing}<span class="ds-story-board-title">${p.title}</span></span><span class="ds-story-board-meta">${p.meta}</span>${p.action ? html`<span class="ds-story-action">${p.action}</span>` : nothing}`}</span>`

const head = (title: string, meta: string) => html`<span class="ds-story-card-head"><span class="ds-story-card-title">${title}</span><span class="ds-story-small">${meta}</span></span>`

function body(piece: StoryPiece, still = false) {
	switch (piece.kind) {
		case 'image':
			return html`<span class="ds-story-shot">${shot(piece.image)}${piece.badge ? html`<span class="ds-story-badge">${piece.badge}</span>` : nothing}${piece.image.mark ? html`<span class="ds-story-mark"><img src=${piece.image.mark} alt=""></span>` : nothing}</span>`
		case 'board':
			return board(piece)
		case 'chip':
			return html`<span class="ds-story-chip"><span class="ds-story-muted">${piece.label}</span><span>${piece.value}</span></span>`
		case 'page':
			return html`<span class="ds-story-page"><spyglass-browser-frame url=${piece.url}><span class="ds-story-page-fill">${shot(piece.image)}</span><span slot="footer">${piece.meta}</span></spyglass-browser-frame></span>`
		case 'thread':
			return html`<span class="ds-story-card">${head(piece.title, piece.meta)}${piece.tabs ? html`<span class="ds-story-tabs">${piece.tabs.map((t, i) => html`<span class="ds-story-tab" ?data-on=${i === 0}>${t}</span>`)}</span>` : nothing}${piece.rows.map((row) => html`<span class="ds-story-message"><span class="ds-story-initial">${row.avatar ? html`<img src=${row.avatar} alt="">` : row.who.charAt(0).toUpperCase()}</span><span class="ds-story-message-words"><span class="ds-story-small">${row.who}</span><span class="ds-story-message-text">${row.text}</span></span>${row.likes ? html`<span class="ds-story-likes">${row.likes}</span>` : nothing}</span>`)}</span>`
		case 'profile':
			return html`<span class="ds-story-profile"><span class="ds-story-profile-head">${logo(piece.logo)}<span class="ds-story-profile-words"><span class="ds-story-card-title">${piece.name}</span><span class="ds-story-handle">${piece.mark ? html`<img class="ds-story-inline-mark" src=${piece.mark} alt="">` : nothing}${piece.handle}</span></span><span class="ds-story-action">${piece.action}</span></span><span class="ds-story-profile-meta">${piece.meta}</span><span class="ds-story-grid">${piece.posts.map((p) => html`<span class="ds-story-post">${shot(p)}</span>`)}</span><span class="ds-story-profile-foot">${piece.footer}</span></span>`
		case 'result':
			return html`<span class="ds-story-card">${head(piece.title, piece.meta)}${piece.rows.map((row) => html`<span class="ds-story-row"><span class="ds-story-thumb">${still ? shot(row.image) : nothing}</span><span class="ds-story-row-words"><span class="ds-story-body">${row.title}</span><span class="ds-story-detail">${row.logo ? logo(row.logo) : nothing}${row.detail}</span></span><span class="ds-story-figure">${row.mark ? html`<img class="ds-story-inline-mark" src=${row.mark} alt="">` : nothing}${row.figure}</span></span>`)}</span>`
	}
}

const actionsRow = (actions: StoryAction[]) => html`<div class="ds-story-actions">${actions.map((a, i) => html`<spyglass-button href=${a.href} variant=${i === 0 ? 'primary' : 'secondary'} class="max-md:w-full">${a.label}</spyglass-button>`)}</div>`

/**
 * @summary A story told in chapters while the reader scrolls, pinned from 1024.
 */
export class ScrollStory extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="scroll-story"]'))
	static properties = { story: { type: Object }, preset: {}, actions: { type: Array } }
	/** The story (lib/scroll-story.ts). */
	story?: ScrollStoryData
	/** One of the Acme stories when `story` is not set: research, sentiment, landing or channels. */
	preset: ScrollStoryPreset = 'research'
	/** Buttons under the last chapter: [{ label, href }], the first White. */
	actions?: StoryAction[]
	#stop = () => {}

	get #data(): ScrollStoryData {
		return (this.story && typeof this.story === 'object' ? this.story : undefined) ?? scrollStories[this.preset] ?? scrollStories.research
	}

	protected updated(changed: PropertyValues) {
		super.updated?.(changed)
		if (changed.has('story') || changed.has('preset')) {
			this.#stop()
			const root = this.renderRoot
			this.#stop = runScrollStory(() => {
				const track = root.querySelector<HTMLElement>('.ds-story-track')
				const frame = root.querySelector<HTMLElement>('.ds-story-frame')
				const words = root.querySelector<HTMLElement>('.ds-story-words')
				if (!track || !frame || !words) return null
				return { track, frame, words, pieces: [...root.querySelectorAll<HTMLElement>('.ds-story-piece')], texts: [...root.querySelectorAll<HTMLElement>('.ds-story-text')] }
			}, this.#data)
		}
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.requestUpdate('preset')
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.#stop()
		this.#stop = () => {}
	}

	render() {
		const story = this.#data
		const { chapters, pieces } = story
		const actions = Array.isArray(this.actions) ? this.actions : undefined
		const byId = new Map(pieces.map((p) => [p.id, p]))
		const titleId = `${story.id}-story-title`
		return html`<section data-ds="scroll-story" aria-labelledby=${titleId} class="ds-story"><h2 id=${titleId} class="sr-only">${story.title}</h2><div class="ds-story-track" style=${styleMap({ height: trackHeight(chapters.length) })}><div class="ds-story-stage"><div class="ds-story-frame" aria-hidden="true">${pieces.map((piece) => html`<span class="ds-story-piece" data-kind=${piece.kind} style=${styleMap(pieceStartStyle(piece, chapters.length))}>${body(piece)}</span>`)}</div><div class="ds-story-container ds-story-words">${chapters.map((c, i) => html`<div class="ds-story-slot" data-side=${c.side}><div class="ds-story-text" data-mode=${c.mode ?? 'scroll'}><h3 class="ds-story-heading">${c.heading}</h3><p class="ds-story-lead">${c.text}</p>${actions && i === chapters.length - 1 ? actionsRow(actions) : nothing}</div></div>`)}</div></div></div><ol class="ds-story-container ds-story-stack" role="list">${chapters.map((c, i) => html`<li class="ds-story-stack-item"><div class="ds-story-stack-text"><h3 class="ds-story-heading">${c.heading}</h3><p class="ds-story-lead">${c.text}</p>${actions && i === chapters.length - 1 ? actionsRow(actions) : nothing}</div><div class="ds-story-still" data-layout=${c.still.layout} aria-hidden="true">${c.still.pieces.map((id) => {
			const piece = byId.get(id)
			if (!piece) return nothing
			const ratio = stillRatio(piece)
			return html`<span class="ds-story-still-piece" data-kind=${piece.kind} style=${styleMap(ratio ? { aspectRatio: ratio } : {})}>${body(piece, true)}</span>`
		})}</div></li>`)}</ol></section>`
	}
}

define('scroll-story', ScrollStory)
