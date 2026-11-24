import { html, nothing, unsafeCSS, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { runContent, runCss, runPlaceholders, runStats, startRun, type RunApi, type RunContent, type RunItem } from '@/lib/automation-run'
import styles from 'virtual:tw'

// AutomationRun.tsx as <spyglass-automation-run>: the quote, then the batch of skewed cards rushing in along the conveyor
// and drifting; a card under the pointer, focus or a tap rises and turns, the ones ahead give way and a note with its
// numbers opens beside it. `items` (JSON: brand, title, alt, src, video, tone, facts, start, end, post, source, media),
// `content` (request, label, reportDay) and `id`.

/**
 * @summary The automation run: a batch of ads drifting under a quote, each opening a note with its numbers.
 */
export class AutomationRun extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(runCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="automation-run"]'))
	static properties = { items: { type: Array }, content: { type: Object }, sectionId: { attribute: 'section-id' }, shown: { state: true }, noted: { state: true } }
	/** The ads and posts, in order. */
	items: RunItem[] = runPlaceholders
	/** The quote, the list's name and the day the numbers count to. */
	content: RunContent = runContent
	/** The section's id (the heading is `<id>-heading`). */
	sectionId = 'automation-run'
	shown: number | null = null
	noted: number | null = null
	#run: RunApi | null = null

	#start() {
		this.#run?.stop()
		this.#run = null
		const q = <T extends Element>(s: string) => this.renderRoot.querySelector<T>(s)
		const root = q<HTMLElement>('[data-ds="automation-run"]')
		const stage = q<HTMLElement>('.ds-run-stage')
		const note = q<HTMLElement>('.ds-run-note')
		const head = q<HTMLElement>('.ds-run-request')
		const cards = [...this.renderRoot.querySelectorAll<HTMLElement>('.ds-run-card')]
		if (!root || !stage || !note || !head || cards.length !== (this.items ?? []).length) return
		this.#run = startRun({ root, stage, note, head, cards, setShown: (i) => (this.shown = i), setNoted: (i) => (this.noted = i) })
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.updateComplete.then(() => this.#start())
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.#run?.stop()
		this.#run = null
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('items') || !this.#run) this.#start()
	}

	render() {
		const items = this.items ?? runPlaceholders
		const c = this.content ?? runContent
		const id = this.sectionId
		const ad = this.noted === null ? null : items[this.noted]
		const s = ad ? runStats(ad, c.reportDay) : null
		const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
		return html`<section id=${id} aria-labelledby=${`${id}-heading`} data-ds="automation-run" class="ds-run relative grid overflow-x-clip pb-[calc(var(--ds-layout-section)-var(--ds-space-md))] text-fg" style=${`--n: ${items.length}`}><div class="relative mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter) pt-(--ds-layout-section)"><h2 id=${`${id}-heading`} class="ds-run-request type-section">${c.request}</h2></div><div class="ds-run-stage"><ul class="ds-run-list" aria-label=${c.label}>${items.map((a, i) => html`<li class="ds-run-card" style=${`--i: ${i}`}><div data-push="" class="ds-run-layer"><div data-lift="" class="ds-run-layer"><button type="button" class="ds-run-face" data-tone=${ifDefined(a.src || a.video ? undefined : a.tone ?? (i % 4) + 1)} aria-label=${`${a.brand}, ${a.title}`} aria-describedby=${`${id}-facts-${i}`} aria-expanded=${this.shown === i ? 'true' : 'false'} @click=${(e: MouseEvent) => { if (e.detail > 0 && fine()) return; this.#run?.setTapped(this.shown === i ? null : i) }} @focus=${(e: FocusEvent) => { if ((e.currentTarget as HTMLElement).matches(':focus-visible')) this.#run?.setFocused(i) }} @blur=${() => this.#run?.setFocused(null)}>${a.video ? html`<video src=${a.video} poster=${ifDefined(a.src)} muted loop autoplay playsinline preload="metadata" draggable="false"></video>` : a.src ? html`<img src=${a.src} alt="" draggable="false">` : nothing}</button></div></div><p id=${`${id}-facts-${i}`} class="sr-only">${[a.alt, ...(a.facts ?? [])].filter(Boolean).join('. ')}.</p></li>`)}</ul><div class="ds-run-note" data-words=${ifDefined(this.noted ?? undefined)} aria-hidden="true">${ad && s ? html`<div class="flex items-center gap-3"><span class="ds-run-thumb size-10 flex-none rounded-ds-sm" data-tone=${ifDefined(ad.src ? undefined : ad.tone ?? (this.noted! % 4) + 1)}>${ad.src ? html`<img src=${ad.src} alt="">` : nothing}</span><p class="m-0 grid min-w-0 flex-1"><span class="type-ui-strong text-fg">${ad.brand}</span><span class="truncate type-caption text-fg-muted">${ad.title}</span></p><span class=${['inline-flex h-6 flex-none items-center gap-1 rounded-ds-sm border border-edge px-2 type-caption text-fg-soft', s.live ? 'ds-run-live' : ''].join(' ')}>${s.status}</span></div><dl class="m-0 mt-3 grid grid-cols-2 border-y border-edge py-3"><div><dt class="truncate type-caption text-fg-muted">${s.first[0]}</dt><dd class="m-0 mt-1 text-ui leading-8 text-fg"><span class="font-heading text-[length:var(--ds-space-2xl)] tracking-(--ds-ent-run-big-tracking)">${s.big}</span>${s.bigUnit}</dd></div><div class="border-l border-edge pl-3"><dt class="truncate type-caption text-fg-muted">${s.first[1]}</dt><dd class="m-0 mt-1 text-ui leading-8 text-fg">${s.second}</dd></div></dl>${s.why.length ? html`<ul role="list" class="m-0 mt-3 flex list-none flex-wrap gap-1 p-0">${s.why.map((f) => html`<li class="rounded-ds-sm bg-surface-raised px-2 text-caption leading-6 text-fg">${f}</li>`)}</ul>` : nothing}<ul role="list" class="m-0 mt-3 flex list-none flex-wrap gap-1 p-0 font-code"><li class="rounded-ds-sm px-2 text-caption leading-6 text-fg-muted outline-1 -outline-offset-1 outline-edge">${s.source}</li>${ad.media ? html`<li class="rounded-ds-sm px-2 text-caption leading-6 text-fg-muted outline-1 -outline-offset-1 outline-edge">media/${ad.media.slice(0, 8)}</li>` : nothing}</ul>` : nothing}</div></div></section>`
	}
}

define('automation-run', AutomationRun)
