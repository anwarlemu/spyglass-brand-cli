import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/logo'
import '@/elements/components/visuals/dispersion-field'
import { PRODUCT_HERO_CSS, createHeroLight, startResultsRun, watchHeroLight, type HeroResult, type HeroSet } from '@/lib/product-hero'
import { ASCII_TEXTURE } from '@/lib/textures'
import { WORKS_STILLS } from '@/lib/works-light'
import styles from 'virtual:tw'

// ProductHero.tsx as <spyglass-product-hero>: the product's name and line, two buttons, the composer typing each
// question over its row of result cards turned away in perspective (lib/product-hero.ts runs it), a card turning to face
// you with its detail under a mouse or focus; the works light behind (or the texture in the margins with `unlit`).
// `sets` as JSON: [{ question, resultsLabel, results: [{ id, picture?, pair?, stat?, notes?, mark?, label, meta?,
// detail: { title, facts: [{ term, value }] } }] }]; `live` lays the dispersion field over the still, pushed and
// stirred by the cards, the still fading out once it draws; the slot `light` takes your own live light instead.

export type { HeroResult, HeroSet }
export interface ProductHeroAction { label: string; href: string }

/**
 * @summary The product hero: the name and line, the composer typing questions and their rows of result cards.
 * @slot light - Your own live light over the still (without `live`), covering it once it draws.
 */
export class ProductHero extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(PRODUCT_HERO_CSS(ASCII_TEXTURE))]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-hero"]'))
	static properties = { name: {}, line: {}, primary: { type: Object }, secondary: { type: Object }, sets: { type: Array }, unlit: { type: Boolean }, live: { type: Boolean }, placeholder: {}, tool: {}, prefix: {} }
	/** The product's name: the page's h1. */
	name = ''
	line = ''
	primary: ProductHeroAction = { label: 'Get a free API key', href: '#' }
	secondary: ProductHeroAction = { label: 'Read the docs', href: '#' }
	sets: HeroSet[] = []
	/** The texture in the margins instead of the works light (React's `lit={false}`). */
	unlit = false
	/** The site's live light over the still: the dispersion field, which the result cards push and stir. */
	live = false
	placeholder = 'Ask about any brand’s ads'
	tool = 'MCP'
	/** Prefix for ids (React's `id`). */
	prefix = 'product'
	private stop?: () => void
	private stopWatch?: () => void
	private key = ''
	/** The live light's canvas: the field this renders, or the one slotted into `light`. */
	private canvas = (): HTMLCanvasElement | null => {
		const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="light"]')
		const field = this.renderRoot.querySelector('spyglass-dispersion-field') ?? slot?.assignedElements({ flatten: true })[0] ?? null
		return field?.shadowRoot?.querySelector('canvas') ?? field?.querySelector('canvas') ?? null
	}
	private light = createHeroLight(this.canvas)

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const key = `${this.live && !this.unlit}\n${(this.sets ?? []).map((s) => s.question).join('\n')}`
		if (key === this.key && this.stop) return
		this.key = key
		this.stop?.()
		this.stopWatch?.()
		const run = this.renderRoot.querySelector<HTMLElement>('[data-ph-run]')
		const hero = this.renderRoot.querySelector<HTMLElement>('[data-ds="product-hero"]')
		this.stop = run ? startResultsRun(run, (this.sets ?? []).map((s) => s.question), this.live && !this.unlit ? this.light : undefined) : undefined
		this.stopWatch = hero && !this.unlit ? watchHeroLight(hero, this.canvas) : undefined
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.stop?.()
		this.stopWatch?.()
		this.stop = undefined
		this.stopWatch = undefined
		this.key = ''
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.requestUpdate()
	}

	private card(r: HeroResult) {
		const { picture, pair, stat, notes, mark, label, meta, detail } = r
		const detailId = `${this.prefix}-${r.id}-detail`
		return html`<li data-card="" tabindex="0" aria-describedby=${detailId} class="ds-ph-card relative flex-none outline-none"><div class="ds-ph-turn"><div data-face="" class=${`ds-ph-face relative flex aspect-4/5 overflow-hidden rounded-ds-sm bg-surface-raised ${pair ? 'gap-px' : ''}`}>${picture ? html`<span class="relative flex-[1_1_0]"><img src=${picture.src} alt=${picture.alt} class="absolute inset-0 size-full object-cover"></span>` : nothing}${pair ? html`<span class="relative flex-[1_1_0]"><img src=${pair.src} alt=${pair.alt} class="absolute inset-0 size-full object-cover"></span>` : nothing}${!picture && stat ? html`<span class="flex flex-[1_1_0] flex-col justify-end gap-2 p-4"><span class="ds-ph-stat-value text-fg">${stat.value}</span><span class="type-ui text-fg-soft">${stat.caption}</span></span>` : nothing}${notes?.length ? html`<span class="absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">${notes.map((n) => html`<span class="max-w-full rounded-panel bg-surface-subtle px-2 py-1 type-ui text-fg">${n}</span>`)}</span>` : nothing}<div id=${detailId} data-detail="" class="ds-ph-detail pointer-events-none absolute inset-0 z-1 flex flex-col justify-end gap-3 overflow-hidden p-4"><p class="ds-ph-reveal flex-none truncate type-ui-strong text-fg" style="--i: 0">${detail.title}</p><dl class="m-0 flex flex-none flex-col gap-3">${detail.facts.map((f, i) => html`<div data-fact="" class="ds-ph-reveal ds-ph-fact flex flex-none flex-col gap-1" style=${`--i: ${i + 1}`}><dt class="type-caption text-fg-soft">${f.term}</dt><dd class="m-0 type-ui text-fg">${f.value}</dd></div>`)}</dl></div></div></div><p class="ds-ph-label mt-3 flex flex-col gap-1 px-3 type-ui"><span class="flex items-center gap-2 overflow-hidden font-medium text-ellipsis whitespace-nowrap text-fg">${mark ? html`<img src=${mark} alt="" width="20" height="20" class="size-5 flex-none rounded-ds-sm">` : nothing}${label}</span>${meta ? html`<span class="text-fg-muted">${meta}</span>` : nothing}</p></li>`
	}

	render() {
		const sets = this.sets ?? []
		const questions = sets.map((s) => s.question)
		const last = WORKS_STILLS[WORKS_STILLS.length - 1]
		return html`<section data-ds="product-hero" aria-labelledby=${`${this.prefix}-heading`} class="ds-ph relative isolate overflow-x-clip pb-(--ds-layout-section) text-fg">${this.unlit ? html`<span aria-hidden="true" class="ds-ph-ascii"></span>` : nothing}<div class="mx-auto flex max-w-(--ds-ph-head-w) flex-col items-center gap-6 px-(--ds-layout-gutter) pt-30 text-center"><h1 id=${`${this.prefix}-heading`} class="max-w-180 type-section">${this.name}</h1><p class="max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${this.line}</p><div class="flex flex-wrap justify-center gap-3 max-md:flex-col max-md:self-stretch"><spyglass-button href=${this.primary.href}>${this.primary.label}</spyglass-button><spyglass-button href=${this.secondary.href} variant="secondary">${this.secondary.label}</spyglass-button></div></div><div data-ph-run="" class="mt-10 flex flex-col items-center"><div aria-hidden="true" class="ds-ph-composer flex flex-col gap-3 rounded-ds-lg border border-edge-surface bg-surface-raised p-3"><p class="min-h-12 px-2 pt-2 type-body text-fg"><span data-ph-text=""></span><span class="ds-ph-caret"></span><span data-ph-hint="" hidden class="text-fg-muted">${this.placeholder}</span></p><div class="flex items-center gap-2"><span class="grid size-8 flex-none place-items-center rounded-panel border border-edge-surface text-fg-soft"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3v10M3 8h10"></path></svg></span><span class="inline-flex h-8 items-center gap-2 rounded-panel bg-surface-inset px-3 type-ui-strong text-fg-soft"><spyglass-logo variant="mark" height="16" aria-label="" class="text-fg"></spyglass-logo>${this.tool}</span><span data-ph-send="" data-awake="" class="ds-ph-send ml-auto grid size-8 flex-none place-items-center rounded-panel bg-surface-inset text-fg-faint"><svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"></path></svg></span></div></div><p class="sr-only">${questions.join(' ')}</p><div data-stage="" class="ds-ph-stage mt-12 grid pt-6 pb-16">${sets.map((set) => html`<ul data-row="" role="list" aria-label=${set.resultsLabel} class="ds-ph-row m-0 flex list-none justify-center gap-2 p-0">${set.results.map((r) => this.card(r))}</ul>`)}</div></div>${this.unlit ? nothing : html`<picture aria-hidden="true" class="ds-ph-light ds-ph-still">${WORKS_STILLS.slice(0, -1).map((s) => html`<source media=${s.media} srcset=${s.picture}>`)}<img src=${last.picture} alt="" draggable="false"></picture><span aria-hidden="true" class="ds-ph-light">${this.live ? html`<spyglass-dispersion-field composition="works" seed="7" class="absolute inset-0 size-full" .drag=${this.light.source}></spyglass-dispersion-field>` : html`<slot name="light"></slot>`}</span>`}</section>`
	}
}

define('product-hero', ProductHero)
