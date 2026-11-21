import { html, LitElement, type PropertyValues } from 'lit'
import { html as staticHtml } from 'lit/static-html.js'
import { DsElement, define, tag } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { ChevronLeft, ChevronRight } from 'lucide'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Carousel.tsx as <spyglass-carousel>: slides in a row on the Black ground, 16px apart, one or more in view, with two
// ghost arrow buttons and the place in tabular figures between them. Native scroll snap, so a swipe or a trackpad
// moves it as the arrows do; the arrows and the arrow keys on the focused track glide it with the browser's smooth
// scroll, and jump with reduced motion. It never plays on its own. Each child element is a slide (React's `count` and
// `slide`): the element puts each in its own slide box. `per-view` sets how many show at 768px and up (one on phones).

/**
 * @summary Slides in a row with arrows and the place between them.
 * @slot - The slides: each child element is one.
 */
export class Carousel extends DsElement {
	static styles = [DsElement.styles, styles]
	// Each child goes into its own slide's slot, assigned by the element.
	static shadowRootOptions = { ...LitElement.shadowRootOptions, slotAssignment: 'manual' as const }
	static properties = { label: {}, perView: { type: Number, attribute: 'per-view' }, current: { state: true }, visible: { state: true }, slides: { state: true } }

	/** What it holds, for assistive tech. */
	label = ''
	/** How many show at 768px and up. */
	perView: 1 | 2 | 3 = 1
	private current = 0
	private visible = 1
	private slides: Element[] = []
	private ro?: ResizeObserver
	private mo?: MutationObserver

	private get count() {
		return this.slides.length
	}
	private get last() {
		return Math.max(0, this.count - this.visible)
	}
	private get track() {
		return this.renderRoot.querySelector<HTMLElement>('.ds-carousel')
	}
	// One step: a slide and the gap after it.
	private stride(el: HTMLElement) {
		const [a, b] = el.children as unknown as HTMLElement[]
		return a ? (b ? b.offsetLeft - a.offsetLeft : a.offsetWidth) : 0
	}

	private measure = () => {
		const el = this.track
		const step = el ? this.stride(el) : 0
		if (!el || !step) return
		this.visible = Math.max(1, Math.round((el.clientWidth + step - (el.firstElementChild as HTMLElement).offsetWidth) / step))
		this.current = Math.min(this.last, Math.round(el.scrollLeft / step))
	}
	private go(i: number) {
		const el = this.track
		const step = el ? this.stride(el) : 0
		if (!el || !step) return
		const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
		el.scrollTo({ left: Math.max(0, Math.min(this.last, i)) * step, behavior: reduce ? 'auto' : 'smooth' })
	}
	private onKey = (e: KeyboardEvent) => {
		if (e.key === 'ArrowRight') {
			e.preventDefault()
			this.go(this.current + 1)
		}
		if (e.key === 'ArrowLeft') {
			e.preventDefault()
			this.go(this.current - 1)
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.slides = [...this.children]
		this.mo = new MutationObserver(() => { this.slides = [...this.children] })
		this.mo.observe(this, { childList: true })
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.mo?.disconnect()
		this.ro?.disconnect()
	}

	protected firstUpdated(changed: PropertyValues) {
		super.firstUpdated(changed)
		this.measure()
		this.ro = new ResizeObserver(this.measure)
		if (this.track) this.ro.observe(this.track)
	}

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const slots = this.renderRoot.querySelectorAll<HTMLSlotElement>('slot')
		this.slides.forEach((s, k) => slots[k]?.assign(s))
	}

	render() {
		const count = this.count
		const last = this.last
		const button = tag('button')
		return html`<section data-ds="carousel" class="flex min-w-0 flex-col gap-3" role="region" aria-roledescription="carousel" aria-label=${this.label}><div class="ds-carousel flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-container -outline-offset-2 fade-x" data-per-view=${this.perView} tabindex="0" aria-label=${`${this.label}, use the arrow keys to move`} @scroll=${this.measure} @keydown=${this.onKey}>${this.slides.map((_, k) => html`<div class="ds-carousel-slide min-w-0 shrink-0 snap-start" role="group" aria-roledescription="slide" aria-label=${`${k + 1} of ${count}`}><slot></slot></div>`)}</div><div class="flex items-center justify-end gap-1">${staticHtml`<${button} variant="ghost" size="sm" icon ?disabled=${this.current <= 0} aria-label=${`Previous ${this.label}`} @click=${() => this.go(this.current - 1)}>${icon(ChevronLeft, 'chevron-left', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>`}<span class="min-w-12 text-center type-caption text-fg-muted tabular-nums" aria-live="polite">${`${this.current + 1} / ${last + 1}`}</span>${staticHtml`<${button} variant="ghost" size="sm" icon ?disabled=${this.current >= last} aria-label=${`Next ${this.label}`} @click=${() => this.go(this.current + 1)}>${icon(ChevronRight, 'chevron-right', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</${button}>`}</div></section>`
	}
}

define('carousel', Carousel)
