import { html, nothing, svg } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { CONNECT_ICONS, connectContent, type ConnectContent } from '@/lib/connect'
import { followGlow } from '@/lib/glow'
import styles from 'virtual:tw'

// ConnectMenu.tsx as <spyglass-connect-menu>: the White button that opens the connect panel (a row per client, a
// hairline, a row that copies a setup prompt), the #262626 pill sliding to the row under the pointer or focus. A click
// opens it with a quick fade and grow; from the keyboard it appears at once with focus on the first row. Arrows move,
// Escape closes and gives focus back, a click or focus outside closes it. `content` (JSON), `marks` (JSON list of SVG
// files), `up`; fires `copy` with detail.prompt.

const TRIGGER =
	'relative isolate inline-flex h-control-md shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-control bg-action-primary px-3 type-ui-strong whitespace-nowrap text-action-primary-fg select-none transition-[background-color,color] duration-160 ease-out before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_var(--ds-glow-radius)_at_var(--glow-x,50%)_var(--glow-y,50%),var(--ds-color-action-glow),transparent)] before:opacity-0 before:transition-opacity before:duration-240 before:ease-out hover:before:opacity-100 max-md:w-full'

const glyph = (name: keyof typeof CONNECT_ICONS, cls = '') => html`<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class=${`flex-none fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round] ${cls}`.trim()}>${svg`${unsafeSVG(CONNECT_ICONS[name])}`}</svg>`

/**
 * @summary The connect menu: a White button that opens the agents to connect to and a copy-prompt row.
 * @fires copy - After the prompt is copied; detail.prompt is the text.
 */
export class ConnectMenu extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="connect-menu"]'))
	static properties = { content: { type: Object }, marks: { type: Array }, up: { type: Boolean }, open: { state: true }, instant: { state: true }, copied: { state: true }, active: { state: true }, pill: { state: true } }
	/** The copy, the rows and the prompt (lib/connect.ts). */
	content: ConnectContent = connectContent
	/** Marks before the label (SVG files, drawn White in 16px squares). */
	marks: string[] = []
	/** Open the panel above the button. */
	up = false
	private open = false
	private instant = false
	private copied = false
	private active = 0
	private pill: { y: number; h: number } | null = null
	private panelId = uid('connect')
	private timer = 0

	private onDown = (e: PointerEvent) => { if (!e.composedPath().includes(this)) this.open = false }
	private onKey = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !this.open) return
		this.open = false
		this.button?.focus({ preventScroll: true })
	}
	private get button() { return this.renderRoot.querySelector<HTMLButtonElement>('[data-trigger]') }
	private rows() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[data-row]')] }

	connectedCallback() {
		super.connectedCallback()
		document.addEventListener('pointerdown', this.onDown)
		document.addEventListener('keydown', this.onKey)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		document.removeEventListener('pointerdown', this.onDown)
		document.removeEventListener('keydown', this.onKey)
		clearTimeout(this.timer)
	}

	protected updated(changed: Map<string, unknown>) {
		super.updated(changed as never)
		if (changed.has('active') || changed.has('open')) {
			const row = this.rows()[this.active]
			if (row && row.offsetHeight && (this.pill?.y !== row.offsetTop || this.pill?.h !== row.offsetHeight)) this.pill = { y: row.offsetTop, h: row.offsetHeight }
		}
	}

	private toggle(e: MouseEvent) {
		const next = !this.open
		const keyboard = e.detail === 0
		this.instant = keyboard
		this.open = next
		if (next) this.active = 0
		if (next && keyboard) requestAnimationFrame(() => this.rows()[0]?.focus({ preventScroll: true }))
	}

	private onPanelKey(e: KeyboardEvent) {
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
		e.preventDefault()
		const list = this.rows()
		const at = list.indexOf((this.renderRoot as ShadowRoot).activeElement as HTMLElement)
		const next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : (at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
		list[next]?.focus()
	}

	private async copy() {
		const c = this.content ?? connectContent
		try {
			await navigator.clipboard.writeText(c.prompt)
		} catch {}
		this.copied = true
		clearTimeout(this.timer)
		this.timer = window.setTimeout(() => (this.copied = false), 2000)
		this.emit('copy', { prompt: c.prompt })
	}

	render() {
		const c = this.content ?? connectContent
		const marks = this.marks ?? []
		const copyIndex = c.clients.length
		return html`<div data-ds="connect-menu" data-open=${ifDefined(this.open ? '' : undefined)} data-up=${ifDefined(this.up ? '' : undefined)} data-instant=${ifDefined(this.instant ? '' : undefined)} class="ds-connect relative max-md:w-full" @focusout=${(e: FocusEvent) => { const root = e.currentTarget as HTMLElement; if (this.open && e.relatedTarget && !root.contains(e.relatedTarget as Node)) this.open = false }}><button data-trigger type="button" class=${TRIGGER} aria-expanded=${String(this.open)} aria-controls=${this.panelId} @click=${this.toggle} @pointermove=${(e: PointerEvent) => followGlow(e.currentTarget as HTMLElement, e)}>${marks.length ? html`<span aria-hidden="true" class="mr-1 flex items-center gap-1">${marks.map((src) => html`<span class="size-4 bg-current" style=${`mask: url("${src}") center / contain no-repeat`}></span>`)}</span>` : nothing}${c.label}${glyph('chevron', 'ds-connect-chevron stroke-[1.75]')}</button><div id=${this.panelId} ?inert=${!this.open} @keydown=${this.onPanelKey} class=${`ds-connect-panel absolute left-0 z-10 isolate grid w-84 rounded-control border border-edge bg-surface-subtle p-1 text-left max-md:w-full ${this.up ? 'bottom-[calc(100%+var(--ds-space-sm))]' : 'top-[calc(100%+var(--ds-space-sm))]'}`}>${this.pill ? html`<span aria-hidden="true" class="ds-connect-pill pointer-events-none absolute top-0 left-1 -z-1 w-[calc(100%-2*var(--ds-space-xs))] rounded-ds-sm bg-surface-raised" style=${`height: ${this.pill.h}px; transform: translateY(${this.pill.y}px)`}></span>` : nothing}<ul class="grid" aria-label=${c.menuLabel}>${c.clients.map((client, i) => html`<li><a data-row data-active=${ifDefined(i === this.active ? '' : undefined)} href=${client.href} target=${ifDefined(client.web ? '_blank' : undefined)} rel=${ifDefined(client.web ? 'noopener noreferrer' : undefined)} class="group/row flex items-center gap-3 rounded-ds-sm p-2 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus" @pointerenter=${() => (this.active = i)} @focus=${() => (this.active = i)} @click=${() => (this.open = false)}><span aria-hidden="true" class="grid size-8 flex-none place-items-center rounded-ds-sm bg-surface-raised transition-[background-color] duration-160 ease-loop group-data-active/row:bg-surface-inset">${client.mark ? html`<span class="size-4 bg-fg" style=${`mask: url("${client.mark}") center / contain no-repeat`}></span>` : html`<span class="type-caption font-medium text-fg">${client.name.slice(0, 1)}</span>`}</span><span class="grid min-w-0 flex-1"><span class="type-ui font-medium text-fg">${client.name}</span><span class="type-caption text-pretty text-fg-muted">${client.description}</span></span><span class="flex flex-none items-center gap-1 type-caption text-fg-muted transition-[color] duration-160 ease-loop group-data-active/row:text-fg"><span class="max-md:hidden">${c.open}</span>${glyph('arrow')}</span></a></li>`)}</ul><span aria-hidden="true" class="-mx-1 my-1 h-px bg-edge"></span><button type="button" data-row data-active=${ifDefined(this.active === copyIndex ? '' : undefined)} data-copied=${ifDefined(this.copied ? '' : undefined)} class="ds-connect-copy flex h-control-md cursor-pointer items-center gap-3 rounded-ds-sm px-2 text-left type-ui font-medium text-fg-soft outline-none transition-[color] duration-160 ease-loop focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus data-active:text-fg data-copied:text-fg max-md:h-control-form" @pointerenter=${() => (this.active = copyIndex)} @focus=${() => (this.active = copyIndex)} @click=${this.copy}><span aria-hidden="true" class="grid w-8 flex-none place-items-center">${glyph('copy', 'ds-connect-swap [grid-area:1/1]')}${glyph('check', 'ds-connect-swap [grid-area:1/1]')}</span><span class="grid"><span class="ds-connect-label [grid-area:1/1]" data-on=${ifDefined(this.copied ? undefined : '')}>${c.copy.label}</span><span class="ds-connect-label [grid-area:1/1]" data-on=${ifDefined(this.copied ? '' : undefined)} aria-hidden=${String(!this.copied)}>${c.copy.done}</span></span></button><p class="sr-only" role="status">${this.copied ? c.copy.done : ''}</p></div></div>`
	}
}

define('connect-menu', ConnectMenu)
