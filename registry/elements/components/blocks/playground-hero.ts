import { html, svg, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/site/connect-menu'
import '@/elements/components/site/mcp-session'
import '@/elements/components/visuals/light-image'
import '@/elements/components/visuals/ascii-trail'
import { ASCII_TEXTURE } from '@/lib/textures'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import type { ConnectContent } from '@/lib/connect'
import type { SessionContent } from '@/lib/home/session'
import { heroContent, writeInto, type HeroContent, type Typing } from '@/lib/home/hero'
import { sentences } from '@/lib/home/pricing'
import { followGlow } from '@/lib/glow'
import styles from 'virtual:tw'

// PlaygroundHero.tsx as <spyglass-playground-hero>: the headline, the lead, the connect menu and the quiet button, the
// prompt typing example questions, the note, and the frame playing the MCP session with the light band behind it.
// `content`, `connect`, `session` and `marks` as JSON; the default slot replaces the frame's content.

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const CODE = 'M8 4.5c-1.7 0-2.5.8-2.5 2.5v2.2c0 1.2-.7 2-2 2.8 1.3.8 2 1.6 2 2.8V17c0 1.7.8 2.5 2.5 2.5M16 4.5c1.7 0 2.5.8 2.5 2.5v2.2c0 1.2.7 2 2 2.8-1.3.8-2 1.6-2 2.8V17c0 1.7-.8 2.5-2.5 2.5'

/**
 * @summary The home hero: the line, the connect menu, the prompt typing questions and the session in a frame.
 * @slot - The frame's content, instead of the session.
 */
export class PlaygroundHero extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="playground-hero"]'))
	static properties = { content: { type: Object }, connect: { type: Object }, session: { type: Object }, marks: { type: Array }, index: { state: true }, copied: { state: true }, status: { state: true } }
	/** The copy, the prompt's questions and its clients. */
	content: HeroContent = heroContent
	/** The connect menu's rows (lib/connect.ts). */
	connect?: ConnectContent
	/** The session's questions (lib/home/session.ts). */
	session?: SessionContent
	/** The clients' marks before the connect menu's label (JSON list of SVG URLs; your own or licensed marks). */
	marks?: string[]
	private index = 0
	private copied: string | null = null
	private status = ''
	private cycle: Typing | null = null
	private holds = { pointer: false, focus: false }
	private typedIndex = -1
	private view: IntersectionObserver | null = null

	disconnectedCallback() {
		super.disconnectedCallback()
		this.view?.disconnect()
		this.view = null
		this.cycle?.cleanup()
		this.cycle = null
		this.typedIndex = -1
	}

	private held() {
		return this.holds.pointer || this.holds.focus || window.matchMedia('(prefers-reduced-motion: reduce)').matches
	}

	private sync() {
		if (this.held()) this.cycle?.hold()
		else this.cycle?.release()
	}

	private watchLight() {
		const el = this.renderRoot.querySelector<HTMLElement>('.ds-ph-light')
		if (!el || this.view) return
		this.view = new IntersectionObserver(([entry]) => el.toggleAttribute('data-offscreen', !entry.isIntersecting))
		this.view.observe(el)
	}

	protected updated(changed: PropertyValues) {
		this.watchLight()
		super.updated(changed)
		if (this.typedIndex === this.index && this.cycle) return
		this.typedIndex = this.index
		this.cycle?.cleanup()
		const ghost = this.renderRoot.querySelector<HTMLElement>('.ds-hp-ghost')
		const count = (this.content ?? heroContent).prompt.questions.length
		this.cycle = ghost ? writeInto(ghost, this.held(), () => (this.index = (this.index + 1) % count)) : null
	}

	private async copy(name: string, text?: string, done?: string) {
		if (!text) return
		const c = (this.content ?? heroContent).prompt
		try {
			await navigator.clipboard.writeText(text)
			this.copied = name
			this.status = done ?? c.copied
			window.setTimeout(() => {
				if (this.copied === name) this.copied = null
			}, 2000)
		} catch {
			// The clipboard is not available here.
		}
	}

	private prompt(c: HeroContent['prompt']) {
		const current = c.questions[this.index % c.questions.length]
		const mouse = (on: boolean) => (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return
			this.holds.pointer = on
			this.sync()
		}
		return html`<form class="ds-hp" action=${c.action} @submit=${(e: SubmitEvent) => { e.preventDefault(); window.location.assign((e.currentTarget as HTMLFormElement).action) }} @pointerenter=${mouse(true)} @pointerleave=${mouse(false)}><div class="ds-hp-row"><div class="ds-hp-field"><label class="sr-only" for="ds-hero-ask">${c.label}</label><textarea id="ds-hero-ask" class="ds-hp-input" rows="1" placeholder=${current} autocomplete="off" enterkeyhint="go" @focus=${() => { this.holds.focus = true; this.sync() }} @blur=${() => { this.holds.focus = false; this.sync() }} @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); (e.currentTarget as HTMLTextAreaElement).form?.requestSubmit() } }}></textarea><span class="ds-hp-ghost" data-typing="" aria-hidden="true">${Array.from(current).map((ch) => html`<span class="ds-hp-ch" data-ch="">${ch}</span>`)}</span></div><button type="submit" class="ds-hp-send" aria-label=${c.send} title=${c.send} @pointermove=${(e: PointerEvent) => followGlow(e.currentTarget as HTMLElement, e)}><svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d="M12 19.5v-15M6 10.5l6-6 6 6"></path>`}</svg></button></div><div class="ds-hp-works"><p class="ds-hp-works-label">${c.worksLabel}</p><ul class="ds-hp-clients" role="list">${c.clients.map((client) => {
			const icon = client.src ? html`<span class="ds-hp-mark" style=${`--mark: url("${client.src}")`} aria-hidden="true"></span>` : html`<svg class="ds-hp-glyph" viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${CODE}></path>`}</svg>`
			return html`<li>${client.href ? html`<a class="ds-hp-client" href=${client.href} target=${ifDefined(client.href.startsWith('http') ? '_blank' : undefined)} rel=${ifDefined(client.href.startsWith('http') ? 'noreferrer' : undefined)}>${icon}${client.name}</a>` : html`<button type="button" class="ds-hp-client" @click=${() => this.copy(client.name, client.copy, client.copied)}>${icon}${this.copied === client.name ? c.copied : client.name}</button>`}</li>`
		})}</ul></div><p class="sr-only" role="status">${this.status}</p></form>`
	}

	render() {
		const c = this.content ?? heroContent
		return html`<section data-ds="playground-hero" class="ds-ph text-fg"><span class="ds-ph-light" aria-hidden="true"><span class="ds-ph-slide"><span class="ds-ph-bob"><spyglass-light-image art="hero-band" grain="false" still priority class="absolute inset-0 size-full"></spyglass-light-image></span></span></span><spyglass-ascii-trail class="ds-ph-trail"></spyglass-ascii-trail><span class="ds-ph-drift" data-side="left" aria-hidden="true" style=${asciiDriftStyle('column', 'left', 'hero')}></span><span class="ds-ph-drift" data-side="right" aria-hidden="true" style=${asciiDriftStyle('scatter', 'right', 'hero')}></span><div class=${`${CONTAINER} ds-ph-inner`}><div class="ds-ph-head"><h1 class="type-section">${c.headline}</h1><p class="max-w-(--ds-layout-measure) type-body-lg text-fg-soft">${c.lead}</p><div class="ds-ph-actions"><div class="ds-ph-connect"><spyglass-connect-menu .content=${this.connect} .marks=${this.marks ?? []}></spyglass-connect-menu></div><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div><div class="ds-ph-ask"><span class="ds-ph-ascii" aria-hidden="true" style=${`--tex: url("${ASCII_TEXTURE}")`}></span>${this.prompt(c.prompt)}<p class="ds-ph-note type-body">${sentences(c.note).map((s, i) => html`<span>${i > 0 ? ' ' : ''}<span class="max-md:inline-block">${s}</span></span>`)}</p></div></div><div class="ds-ph-frame" aria-hidden="true">${this.hasSlot() ? html`<slot></slot>` : html`<spyglass-mcp-session .content=${this.session}></spyglass-mcp-session>`}</div></div></section>`
	}
}

define('playground-hero', PlaygroundHero)
