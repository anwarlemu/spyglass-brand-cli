import { html, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { createWheel, createWheelRipple, useCaseWheelContent, useCaseWheelCss, wheelFit, wheelLongest, wheelRest, type WheelEngine, type WheelItem, type WheelPicture, type WheelRipple } from '@/lib/use-case-wheel'
import '@/elements/components/site/creative-card'
import styles from 'virtual:tw'

// UseCaseWheel.tsx as <spyglass-use-case-wheel>: the headline inside an ellipse of creatives over a drum of audiences
// that turns every 2.4s on screen, holds under the pointer or keyboard focus, and turns to a label that is clicked or
// rested on; still with reduced motion (the creatives crossfade). `items` as JSON; `section-id` names the section;
// `as="h1"` when it opens a page; `autoplay="false"` keeps it still. A light layer goes in the `light` slot, and the
// element's `ripple` property hands it the ring's ripple. Fires `change` (detail.index) after each turn.

const picture = (p: WheelPicture) => {
	const fit = wheelFit(p)
	return html`<span class="ds-wheel-frame" data-fit=${fit === 'fill' ? '' : fit} style=${p.ratio ? `aspect-ratio: ${p.ratio}` : ''}><spyglass-creative-card .src=${p.src} .alt=${p.alt ?? ''} .fit=${p.fit} .position=${p.position} .brand=${p.brand} .caption=${p.caption} .tone=${p.tone ?? 2} ratio="fill"></spyglass-creative-card></span>`
}

/**
 * @summary The use cases wheel: a ring of creatives around the headline and a drum of audiences.
 * @slot light - A light layer behind the ring.
 * @fires change - detail.index is the audience turned to.
 */
export class UseCaseWheel extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(useCaseWheelCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="use-case-wheel"]'))
	static properties = { sectionId: { attribute: 'section-id' }, headline: {}, items: { type: Array }, as: {}, autoplay: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } }, active: { state: true } }
	/** The section's id (React's `id`); its heading is `<id>-heading`. */
	sectionId = 'use-cases'
	headline = useCaseWheelContent.headline
	/** The audiences: { key, label, line, href, linkLabel, pairs }. */
	items: WheelItem[] = useCaseWheelContent.items
	/** h2 in a page, h1 when the wheel opens one. */
	as: 'h1' | 'h2' = 'h2'
	/** Turn by itself while on screen ("false" keeps it still). */
	autoplay = true
	declare active: number
	#engine: { current: WheelEngine | null } = { current: null }
	#stage: { current: HTMLElement | null } = { current: null }
	/** The ring's ripple, for a light layer that bends with each turn. */
	readonly ripple: WheelRipple = createWheelRipple(this.#engine, this.#stage)
	#holds = { pointer: false, focus: false }
	#lastRow: number | null = null

	constructor() {
		super()
		this.active = 0
	}

	protected updated(changed: PropertyValues) {
		if (changed.has('items') || changed.has('autoplay') || !this.#engine.current) this.#start()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.#engine.current?.destroy()
		this.#engine.current = null
	}

	#start() {
		const root = this.renderRoot
		const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)
		const section = q('[data-ds="use-case-wheel"]')
		const stage = q('.ds-wheel')
		const head = q('.ds-wheel-head')
		const queue = q('.ds-wheel-mask')
		const pill = q('.ds-wheel-pill')
		const pillText = q('.ds-wheel-pill-text')
		const focusBox = q('.ds-wheel-focus')
		if (!section || !stage || !head || !queue || !pill || !pillText || !focusBox) return
		this.#engine.current?.destroy()
		const items = this.items ?? useCaseWheelContent.items
		const pictures = items.map((item, g) => item.pairs.map((_, p) => [0, 1].map((side) => q(`[data-picture="${g}-${p}-${side}"]`) as HTMLElement)))
		this.#stage.current = stage
		this.#engine.current = createWheel(
			{ section, stage, head, queue, pill, pillText, focusBox, labels: [...root.querySelectorAll<HTMLElement>('button.ds-wheel-label')], twins: [...root.querySelectorAll<HTMLElement>('.ds-wheel-twin')], pictures },
			{ autoplay: this.autoplay, onChange: (index) => { this.active = index; this.emit('change', { index }) } },
		)
	}

	#hold() { this.#engine.current?.hold(this.#holds.pointer || this.#holds.focus) }
	#onPointerMove = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return
		const target = (event.composedPath()[0] as Element).closest?.<HTMLElement>('[data-item]') ?? null
		const index = target ? Number(target.dataset.item) : null
		const e = this.#engine.current
		e?.mark('hover', index)
		const pill = this.renderRoot.querySelector('.ds-wheel-pill')
		const row = index === null ? (pill?.contains(event.composedPath()[0] as Node) ? 0 : null) : e?.row(index)
		if (row === undefined || row === this.#lastRow) return
		this.#lastRow = row
		if (index !== null && row !== 0 && row !== null) e?.hover(index)
	}
	#onPointerEnter = () => { this.#holds.pointer = true; this.#hold() }
	#onPointerLeave = () => { this.#holds.pointer = false; this.#lastRow = null; this.#engine.current?.mark('hover', null); this.#hold() }
	#onFocus = (event: FocusEvent) => {
		const target = event.composedPath()[0] as HTMLElement
		const keyboard = target.matches(':focus-visible')
		this.#engine.current?.mark('focus', keyboard && target.dataset.item ? Number(target.dataset.item) : null)
		if (!keyboard) return
		this.#holds.focus = true
		this.#hold()
	}
	#onBlur = (event: FocusEvent) => {
		if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) return
		this.#engine.current?.mark('focus', null)
		this.#holds.focus = false
		this.#hold()
	}

	render() {
		const id = this.sectionId
		const items = this.items ?? useCaseWheelContent.items
		const active = this.active ?? 0
		const current = items[active] ?? items[0]
		const lit = Boolean(this.querySelector('[slot="light"]'))
		const heading = this.as === 'h1'
			? html`<h1 id=${`${id}-heading`} class="ds-wheel-head type-section">${this.headline}</h1>`
			: html`<h2 id=${`${id}-heading`} class="ds-wheel-head type-section">${this.headline}</h2>`
		return html`<section data-ds="use-case-wheel" id=${id} aria-labelledby=${`${id}-heading`} ?data-light=${lit} class="ds-wheel-section text-fg"><div class="ds-wheel">${lit ? html`<div class="ds-wheel-light"><slot name="light"></slot></div>` : ''}${heading}<div class="ds-wheel-ring" aria-hidden="true">${items.map((item, g) => item.pairs.map((pair, p) => pair.map((pic, side) => html`<div data-picture=${`${g}-${p}-${side}`} class="ds-wheel-picture">${picture(pic)}</div>`)))}</div><div class="ds-wheel-queue" @pointerenter=${this.#onPointerEnter} @pointerleave=${this.#onPointerLeave} @pointermove=${this.#onPointerMove} @focusin=${this.#onFocus} @focusout=${this.#onBlur}><div class="ds-wheel-mask"><ul class="m-0 list-none p-0" role="list">${items.map((item, i) => html`<li><button type="button" class="ds-wheel-label" data-item=${i} data-rest=${wheelRest(i, active, items.length)} aria-pressed=${i === active ? 'true' : 'false'} aria-describedby=${`${id}-line-${item.key}`} @click=${() => this.#engine.current?.choose(i)}>${item.label}</button><span id=${`${id}-line-${item.key}`} class="sr-only">${item.line}</span></li>`)}</ul>${items.map((item) => html`<span class="ds-wheel-label ds-wheel-twin" aria-hidden="true">${item.label}</span>`)}</div><span class="ds-wheel-focus" aria-hidden="true"></span><div class="ds-wheel-pill"><span class="ds-wheel-pill-text" aria-hidden="true">${wheelLongest(items)}</span><a class="ds-wheel-send" href=${current.href} aria-label=${current.linkLabel}><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5"></path></svg></a></div></div></div></section>`
	}
}

define('use-case-wheel', UseCaseWheel)
