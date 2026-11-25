import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { keyed } from 'lit/directives/keyed.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { ASCII_TEXTURE } from '@/lib/textures'
import { placeRingTag, preloadNextRingCard, ringAspect, ringCardLabel, ringCss, ringIntent, ringPlaceStyle, ringPlaceholders, watchRing, RING_PLACES, type RingCard, type RingWatch } from '@/lib/enterprise-ring'
import { enterpriseHeroContent, type EnterpriseHeroContent } from '@/lib/pages/enterprise'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'
import { imageFit } from '@/lib/image'

// EnterpriseHero.tsx as <spyglass-enterprise-hero>: the headline, lead and two buttons centered in a hero at least the
// window's height, with twelve creatives around them that rise in, bob while seen, come forward with a tag under the
// pointer, on focus or a tap (and one on its own every 6s), and step through their set on a press. `content`, `cards`
// (JSON: sets of { brand, title, ratio, hook, meta, src, tone }) and `section-id`.

/**
 * @summary The enterprise hero: the headline inside a ring of creatives that step on a press.
 */
export class EnterpriseHero extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(ringCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="enterprise-hero"]'))
	static properties = { content: { type: Object }, cards: { type: Array }, sectionId: { attribute: 'section-id' }, at: { state: true }, stepped: { state: true }, shown: { state: true }, hint: { state: true }, said: { state: true }, held: { state: true } }
	/** The headline's two lines, the lead, the buttons and the ring's name. */
	content: EnterpriseHeroContent = enterpriseHeroContent
	/** Twelve sets of creatives, clockwise from the top left. */
	cards: RingCard[][] = ringPlaceholders
	/** The section's id (the heading is `<id>-heading`). */
	sectionId = 'enterprise'
	at: number[] = []
	stepped: boolean[] = []
	shown: number | null = null
	hint: number | null = null
	said = ''
	held: number | null = null
	#watch: RingWatch | null = null
	#pointer = 'mouse'
	#intent = 0

	get #section() { return this.renderRoot.querySelector<HTMLElement>('[data-ds="enterprise-hero"]') }

	#onDown = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse' && !e.composedPath().some((n) => n instanceof HTMLElement && n.hasAttribute('data-ring-card'))) this.shown = null
	}
	#onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') this.shown = null }

	#start() {
		const section = this.#section
		const ring = this.renderRoot.querySelector<HTMLElement>('.ds-ring')
		if (!section || !ring) return
		this.#watch = watchRing(ring, section, () => this.shown !== null, (i) => (this.hint = i))
		section.addEventListener('pointerdown', this.#onDown)
		section.addEventListener('keydown', this.#onKey)
	}
	#stop() {
		this.#watch?.stop()
		this.#watch = null
		const section = this.#section
		section?.removeEventListener('pointerdown', this.#onDown)
		section?.removeEventListener('keydown', this.#onKey)
		window.clearTimeout(this.#intent)
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.updateComplete.then(() => this.#start())
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.#stop()
	}
	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.#start()
	}
	protected willUpdate(changed: PropertyValues) {
		if (changed.has('cards')) {
			this.at = (this.cards ?? []).map(() => 0)
			this.stepped = (this.cards ?? []).map(() => false)
		}
		const forward = this.shown ?? this.hint
		if (forward !== null && forward !== this.held) this.held = forward
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('shown') || changed.has('at')) preloadNextRingCard((this.cards ?? ringPlaceholders).slice(0, RING_PLACES.length), this.shown, this.at)
		if (changed.has('held') || changed.has('at') || changed.has('stepped')) {
			const el = this.held === null ? null : this.renderRoot.querySelectorAll<HTMLElement>('[data-ring-place]')[this.held]
			const section = this.#section
			if (el && section) placeRingTag(el, section)
		}
	}

	#next(i: number, sets: RingCard[][]) {
		const n = sets[i].length
		const to = ((this.at[i] ?? 0) + 1) % n
		this.at = sets.map((_, j) => (j === i ? to : this.at[j] ?? 0))
		this.stepped = sets.map((_, j) => (j === i ? true : this.stepped[j] ?? false))
		const card = sets[i][to]
		this.said = `${to + 1} of ${n} with this hook: ${card.brand}, ${card.title}.`
	}

	render() {
		const c = this.content ?? enterpriseHeroContent
		const sets = (this.cards ?? ringPlaceholders).slice(0, RING_PLACES.length)
		const id = this.sectionId
		const forward = this.shown ?? this.hint
		return html`<section id=${id} aria-labelledby=${`${id}-heading`} data-ds="enterprise-hero" class="ds-ent-hero relative grid items-center overflow-x-clip bg-surface text-fg"><div class="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)"><div data-ring-words="" class="relative z-2 mx-auto flex max-w-(--ds-ent-hero-head-w) flex-col items-center gap-6 text-center"><h1 id=${`${id}-heading`} class="max-w-(--ds-ent-hero-title-w) type-section"><span class="ds-ent-hero-keep">${c.title[0]}</span> ${c.title[1]}</h1><p class="type-body-lg text-fg-soft">${c.lead}</p><div class="flex flex-col flex-wrap justify-center gap-3 self-stretch md:flex-row md:self-auto"><spyglass-button href=${c.primary.href}>${c.primary.label}</spyglass-button><spyglass-button href=${c.secondary.href} variant="secondary">${c.secondary.label}</spyglass-button></div></div></div><span aria-hidden="true" class="ds-ent-hero-ascii" style=${`background-image: url("${ASCII_TEXTURE}"), url("${ASCII_TEXTURE}")`}></span><ul class="ds-ring" aria-label=${c.label} data-run="false">${sets.map((set, i) => {
			const at = this.at[i] ?? 0
			const card = set[at]
			if (!card) return nothing
			const slot = RING_PLACES[i]
			return html`<li data-ring-place="" class="ds-ring-place" data-wide=${ifDefined(slot.wide ? '' : undefined)} data-phone=${ifDefined(slot.phone ? '' : undefined)} data-forward=${ifDefined(forward === i ? '' : undefined)} style=${styleMap(ringPlaceStyle(i))}><button type="button" class="ds-ring-card" data-ring-card="" aria-label=${ringCardLabel(card, at, set.length)}
				@pointerdown=${(e: PointerEvent) => { this.#pointer = e.pointerType }}
				@keydown=${() => { this.#pointer = 'keyboard' }}
				@pointerenter=${(e: PointerEvent) => { if (e.pointerType !== 'mouse') return; window.clearTimeout(this.#intent); const ring = this.renderRoot.querySelector('.ds-ring'); this.#intent = window.setTimeout(() => (this.shown = i), ring ? ringIntent(ring) : 0) }}
				@pointerleave=${(e: PointerEvent) => { if (e.pointerType !== 'mouse') return; window.clearTimeout(this.#intent); if (this.shown === i) this.shown = null }}
				@focus=${(e: FocusEvent) => { if ((e.currentTarget as HTMLElement).matches(':focus-visible')) this.shown = i }}
				@blur=${() => { if (this.shown === i) this.shown = null }}
				@click=${() => { const touch = this.#pointer === 'touch' || this.#pointer === 'pen'; this.#pointer = 'mouse'; const was = this.shown; this.shown = i; if (touch && was !== i) return; this.#next(i, sets) }}
			><span class="ds-ring-frame" style=${`aspect-ratio: ${ringAspect(card.ratio)}`} data-tone=${ifDefined(card.src ? undefined : card.tone ?? (i % 4) + 1)} data-ds-placeholder=${ifDefined(card.src ? undefined : '')} data-stepped=${ifDefined(this.stepped[i] ? '' : undefined)}>${keyed(card.src ?? `${card.brand}-${card.title}`, card.src ? html`<img src=${card.src} alt="" draggable="false" style=${styleMap(imageFit(card) ?? {})}>` : html`<span class="absolute inset-0 flex items-end p-2"><span class="hidden type-label text-fg md:block">${card.brand}</span></span>`)}</span></button>${this.held === i ? html`<div class="ds-ring-tag" data-ring-tag="" data-shown=${ifDefined(forward === i ? '' : undefined)} aria-hidden="true"><span>${`Hook: ${card.hook.toLowerCase()}`}</span>${card.meta.map((line) => html`<span class="text-fg-muted">${line}</span>`)}${this.stepped[i] ? html`<span class="text-fg-muted">${`${at + 1} of ${set.length} with this hook`}</span>` : nothing}</div>` : nothing}</li>`
		})}</ul><p class="sr-only" aria-live="polite">${this.said}</p></section>`
	}
}

define('enterprise-hero', EnterpriseHero)
