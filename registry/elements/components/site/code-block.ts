import { html, nothing } from 'lit'
import { keyed } from 'lit/directives/keyed.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import { codeTabsExample, type CodeTab } from '@/lib/code'
import '@/elements/components/site/code'
import '@/elements/components/site/copy-button'
import styles from 'virtual:tw'

// CodeBlock.tsx as <spyglass-code-block>: tabs of code on a #262626 panel, the White line sliding under the chosen tab,
// the copy button for the shown tab, the code scrolling across and fading at its edges. Arrows, Home and End move
// between tabs. `tabs` (JSON: { id, label, code, language }), `label`, `copy` (JSON: { label, copiedLabel, name });
// the copy button's `copy` event bubbles out.

/** @summary Tabs of code with a copy button. */
export class CodeBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="code-block"]'))
	static properties = { tabs: { type: Array }, label: {}, copy: { type: Object }, active: { state: true }, line: { state: true } }
	tabs: CodeTab[] = codeTabsExample
	/** The tab list's accessible name. */
	label = 'Code'
	copy = { label: 'Copy', copiedLabel: 'Copied', name: 'Copy code' }
	private active = 0
	private line: { x: number; w: number } | null = null
	private blockId = uid('code')
	private observer?: ResizeObserver

	private get list() { return this.renderRoot.querySelector<HTMLElement>('[role="tablist"]') }
	private get buttons() { return [...this.renderRoot.querySelectorAll<HTMLButtonElement>('[role="tab"]')] }

	private measure = () => {
		const tab = this.buttons[this.active]
		if (!tab || !tab.offsetWidth) return
		const pad = parseFloat(getComputedStyle(tab).paddingLeft)
		const next = { x: tab.offsetLeft + pad, w: tab.offsetWidth - 2 * pad }
		if (next.x !== this.line?.x || next.w !== this.line?.w) this.line = next
	}

	protected firstUpdated(changed: Map<string, unknown>) {
		super.firstUpdated(changed as never)
		this.observer = new ResizeObserver(this.measure)
		if (this.list) this.observer.observe(this.list)
	}
	protected updated(changed: Map<string, unknown>) {
		super.updated(changed as never)
		if (changed.has('active') || changed.has('tabs')) this.measure()
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.observer?.disconnect()
	}

	private select(index: number) {
		this.active = index
		const tab = this.buttons[index]
		const list = this.list
		if (!tab || !list) return
		const t = tab.getBoundingClientRect()
		const l = list.getBoundingClientRect()
		if (t.left < l.left) list.scrollLeft += t.left - l.left
		else if (t.right > l.right) list.scrollLeft += t.right - l.right
	}

	private onKeyDown(e: KeyboardEvent) {
		const last = (this.tabs ?? []).length - 1
		const a = this.active
		const next = e.key === 'ArrowRight' ? (a === last ? 0 : a + 1) : e.key === 'ArrowLeft' ? (a === 0 ? last : a - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1
		if (next < 0) return
		e.preventDefault()
		this.select(next)
		this.updateComplete.then(() => this.buttons[next]?.focus())
	}

	render() {
		const tabs = this.tabs ?? []
		if (!tabs.length) return nothing
		const shown = tabs[this.active] ?? tabs[0]
		const id = this.blockId
		const copy = this.copy ?? { label: 'Copy', copiedLabel: 'Copied', name: 'Copy code' }
		return html`<div data-ds="code-block" class="min-w-0 rounded-control bg-surface-raised text-fg"><div class="relative flex h-control-lg items-center justify-between gap-2 px-1 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-edge-surface md:px-2"><div role="tablist" aria-label=${this.label} @keydown=${this.onKeyDown} class="fade-x relative isolate flex h-full min-w-0 overflow-x-auto [scrollbar-width:none]">${this.line ? html`<span aria-hidden="true" class="pointer-events-none absolute bottom-0 left-0 z-0 h-0.5 w-25 origin-left bg-fg transition-transform duration-160 ease-loop motion-reduce:transition-none" style=${`transform: translateX(${this.line.x}px) scaleX(${this.line.w / 100})`}></span>` : nothing}${tabs.map((tab, i) => html`<button type="button" role="tab" id=${`${id}-tab-${tab.id}`} aria-selected=${String(i === this.active)} aria-controls=${`${id}-panel-${tab.id}`} tabindex=${i === this.active ? 0 : -1} @click=${() => this.select(i)} class="relative z-1 h-full flex-none cursor-pointer rounded-ds-sm px-3 type-ui-strong text-fg-muted transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:not-aria-selected:text-fg-soft active:text-fg aria-selected:text-fg md:px-4">${tab.label}</button>`)}</div>${keyed(shown.id, html`<spyglass-copy-button .text=${shown.code} .label=${copy.label} .copiedLabel=${copy.copiedLabel} .name=${copy.name} select-id=${`${id}-panel-${shown.id}`}></spyglass-copy-button>`)}</div><div class="grid grid-cols-[minmax(0,1fr)]">${tabs.map((tab, i) => html`<div role="tabpanel" id=${`${id}-panel-${tab.id}`} aria-labelledby=${`${id}-tab-${tab.id}`} tabindex=${i === this.active ? 0 : -1} ?inert=${i !== this.active} class=${`fade-x min-w-0 overflow-x-auto rounded-b-control p-4 outline-offset-[calc(-1*var(--ds-border-focus))] [grid-area:1/1] [scrollbar-color:var(--ds-color-edge-strong)_transparent] [scrollbar-width:thin] md:p-6 ${i === this.active ? 'visible' : 'invisible'}`}><spyglass-code .source=${tab.code} .language=${tab.language ?? 'shell'}></spyglass-code></div>`)}</div></div>`
	}
}

define('code-block', CodeBlock)
