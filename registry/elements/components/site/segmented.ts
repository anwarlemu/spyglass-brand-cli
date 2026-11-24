import { html, nothing, type PropertyValues } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Segmented.tsx as <spyglass-segmented>: one choice out of a few, as radios, on the site's segmented tray, the chosen
// option's #363636 pill gliding to it (a clip that moves over 160ms; still with reduced motion). `options` ({ key, label }
// as JSON or a property), `label`, `value` (with `input` and `change`) and `block` (full width).
export interface SegmentedOption { key: string; label: string }

const NEXT: Record<string, (i: number, last: number) => number> = {
	ArrowRight: (i, last) => (i === last ? 0 : i + 1),
	ArrowDown: (i, last) => (i === last ? 0 : i + 1),
	ArrowLeft: (i, last) => (i === 0 ? last : i - 1),
	ArrowUp: (i, last) => (i === 0 ? last : i - 1),
	Home: () => 0,
	End: (_, last) => last,
}

/**
 * @summary One choice out of a few, on a segmented tray.
 * @fires input - The choice changed (read `value`).
 * @fires change - The choice changed (read `value`).
 */
export class Segmented extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="segmented"]'))
	static properties = { options: { type: Array }, label: {}, value: {}, block: { type: Boolean }, pill: { state: true } }
	options: SegmentedOption[] = []
	/** The group's name for assistive tech. */
	label = ''
	/** The chosen option's key (the first by default). */
	value?: string
	/** Full width, the options sharing it. */
	block = false
	private pill: { l: number; r: number } | null = null
	private ro?: ResizeObserver

	private get current() {
		return this.value ?? this.options?.[0]?.key
	}
	private measure = () => {
		const tray = this.renderRoot.querySelector<HTMLElement>('[data-ds="segmented"]')
		const o = tray?.querySelector<HTMLElement>('[aria-checked="true"]')
		if (tray && o) {
			const next = { l: o.offsetLeft, r: tray.clientWidth - o.offsetLeft - o.offsetWidth }
			if (next.l !== this.pill?.l || next.r !== this.pill?.r) this.pill = next
		}
	}
	protected firstUpdated() {
		const tray = this.renderRoot.querySelector<HTMLElement>('[data-ds="segmented"]')
		this.ro = new ResizeObserver(this.measure)
		if (tray) this.ro.observe(tray)
	}
	protected updated(changed: PropertyValues) {
		if (!changed.has('pill')) this.measure()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.ro?.disconnect()
	}
	private onKey(e: KeyboardEvent) {
		const step = NEXT[e.key]
		if (!step) return
		e.preventDefault()
		const next = step(this.options.findIndex((o) => o.key === this.current), this.options.length - 1)
		this.commit(this.options[next].key)
		this.updateComplete.then(() => this.renderRoot.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus())
	}

	render() {
		const p = this.pill
		const option = `relative inline-flex h-7 cursor-pointer items-center gap-2 rounded-ds-sm border-0 bg-transparent type-ui-strong whitespace-nowrap tabular-nums text-fg-muted transition-[color] duration-160 ease-loop hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg motion-reduce:transition-none aria-checked:text-fg pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-2 pointer-coarse:after:content-[''] ${this.block ? 'flex-1 justify-center px-2' : 'px-3'}`
		return html`<div data-ds="segmented" role="radiogroup" aria-label=${this.label} @keydown=${this.onKey} class=${`relative isolate flex gap-1 rounded-control bg-surface-subtle p-1 shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-neutral-4)] ${this.block ? 'w-full' : 'w-fit'}`}>${p ? html`<span aria-hidden="true" class="pointer-events-none absolute inset-0 -z-1 bg-surface-inset transition-[clip-path] duration-160 ease-loop motion-reduce:transition-none" style=${`clip-path: inset(var(--ds-space-xs) ${p.r}px var(--ds-space-xs) ${p.l}px round var(--ds-radius-sm))`}></span>` : nothing}${(this.options ?? []).map((o) => {
			const on = o.key === this.current
			return html`<button type="button" role="radio" aria-checked=${String(on)} tabindex=${on ? 0 : -1} class=${on && !p ? `${option} bg-surface-inset` : option} @click=${() => this.commit(o.key)}>${o.label}</button>`
		})}</div>`
	}
}

define('segmented', Segmented)
