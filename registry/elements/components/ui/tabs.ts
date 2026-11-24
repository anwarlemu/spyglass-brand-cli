import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController, uid } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Tabs.tsx as <spyglass-tabs>: views of one thing, one at a time. `variant` default is the segmented control (a
// #262626 track, the current view a White block with a Black label); `line` is labels over a hairline with a 2px
// White line under the current one. Colors change over 160ms; nothing slides. Arrow keys move and select (Home, End);
// Tab moves into the panel. `options` is a JSON list; each panel is a child with slot="<value>" (React's `panels`),
// drawn under the list while its tab is current. `value` with the native `input` and `change` events.

export type TabOption = string | { value: string, label: string, disabled?: boolean }
const norm = (o: TabOption) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { disabled: false, ...o })

const LIST = {
	default: 'inline-flex h-control-md w-fit max-w-full items-center gap-1 rounded-control bg-surface-raised p-1',
	line: 'flex items-center gap-6 border-b border-edge',
} as const
const TAB = {
	default: 'inline-flex h-full flex-1 cursor-pointer items-center justify-center rounded-ds-sm px-3 type-ui-strong whitespace-nowrap transition-[background-color,color] duration-160 ease-standard disabled:cursor-not-allowed disabled:text-fg-faint',
	line: '-mb-px inline-flex h-control-md cursor-pointer items-center border-b-2 type-ui-strong whitespace-nowrap transition-[border-color,color] duration-160 ease-standard disabled:cursor-not-allowed disabled:text-fg-faint',
} as const
const ON = { default: 'bg-action-primary text-action-primary-fg', line: 'border-action-primary text-fg' } as const
const OFF = { default: 'text-fg-muted hover:not-disabled:text-fg', line: 'border-transparent text-fg-muted hover:not-disabled:text-fg' } as const
const slug = (v: string) => v.replace(/[^\w-]/g, '-')

/**
 * @summary Views of one thing: a segmented control or line tabs, with their panels.
 * @slot <value> - The panel for the tab with that value.
 * @fires input - The tab changed (read `value`).
 * @fires change - The tab changed (read `value`).
 */
export class Tabs extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="tabs"]'))
	static properties = { value: { reflect: true }, options: { type: Array }, label: {}, variant: { reflect: true } }

	/** The current tab's value (the first enabled one when empty). */
	value = ''
	/** Values, or { value, label, disabled } (a JSON attribute or the property). */
	options: TabOption[] = []
	/** The tab list's name for assistive tech. */
	label = ''
	/** default (a segmented control) or line. */
	variant: keyof typeof LIST = 'default'
	private base = uid('tabs')

	private get current() {
		const opts = this.options.map(norm)
		return this.value || opts.find((o) => !o.disabled)?.value || ''
	}

	private onKeyDown(event: KeyboardEvent) {
		const enabled = this.options.map(norm).filter((o) => !o.disabled)
		const at = enabled.findIndex((o) => o.value === this.current)
		let next: number
		if (event.key === 'ArrowRight') next = (at + 1) % enabled.length
		else if (event.key === 'ArrowLeft') next = (at - 1 + enabled.length) % enabled.length
		else if (event.key === 'Home') next = 0
		else if (event.key === 'End') next = enabled.length - 1
		else return
		event.preventDefault()
		const pick = enabled[next]
		if (!pick) return
		this.commit(pick.value)
		void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`#${this.base}-tab-${slug(pick.value)}`)?.focus())
	}

	render() {
		const v = LIST[this.variant] ? this.variant : 'default'
		const opts = this.options.map(norm)
		const current = this.current
		const has = (value: string) => this.hasSlot(value)
		return html`<div data-ds="tabs" class="flex flex-col gap-4">
			<div role="tablist" aria-label=${this.label} class=${LIST[v]} @keydown=${this.onKeyDown}>${opts.map((o) => html`<button
				id=${`${this.base}-tab-${slug(o.value)}`}
				type="button"
				role="tab"
				aria-selected=${String(current === o.value)}
				aria-controls=${ifDefined(has(o.value) ? `${this.base}-panel-${slug(o.value)}` : undefined)}
				tabindex=${current === o.value ? '0' : '-1'}
				?disabled=${o.disabled}
				class=${`${TAB[v]} ${current === o.value ? ON[v] : OFF[v]}`}
				@click=${() => this.commit(o.value)}
			>${o.label}</button>`)}</div>
			${current && has(current) ? html`<div id=${`${this.base}-panel-${slug(current)}`} role="tabpanel" tabindex="0" aria-labelledby=${`${this.base}-tab-${slug(current)}`}><slot name=${current}></slot></div>` : nothing}
		</div>`
	}
}

define('tabs', Tabs)
