import { html, type PropertyValues } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController, tagName } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Table.tsx as <spyglass-table>: it wraps the page's own <table> (rows stay in the page, where table markup works),
// styling it with the same rules as React, scoped to tables inside the element. It draws React's root div and the
// scroll box inside it around its slot: it scrolls sideways on its own with its edges fading (fade-x); `framed` gives
// the root the hairline box and the brand corner, and with a `label` the scroll box is a named region a keyboard can
// reach. Layout classes on the element land on the root.

/** Table.tsx's styles, scoped to tables inside the element. */
const RULES = `
.ds-table { width: 100%; border-collapse: collapse; caption-side: bottom; color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-table th { height: var(--ds-size-row); padding: 0 var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; text-align: left; white-space: nowrap; vertical-align: middle; }
.ds-table td { padding: var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); vertical-align: middle; }
.ds-table :is(th, td).text-right { text-align: right; font-variant-numeric: tabular-nums; }
.ds-table tbody tr:last-child td { border-bottom: 0; }
.ds-table tbody tr { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-table tbody tr:hover { background: var(--ds-color-action-ghost-hover); } }
.ds-table tbody tr[data-state="selected"] { background: var(--ds-color-surface-subtle); }
.ds-table tfoot td { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); border-bottom: 0; background: var(--ds-color-surface-raised); font-weight: var(--ds-font-weight-medium); }
.ds-table caption { margin-top: var(--ds-space-lg); color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); text-align: left; }
.ds-table[data-framed] :is(th, td):first-child { padding-left: var(--ds-space-lg); }
.ds-table[data-framed] :is(th, td):last-child { padding-right: var(--ds-space-lg); }
.ds-table[data-framed] caption { padding: 0 var(--ds-space-lg) var(--ds-space-lg); }
`
const sheets = new WeakSet<Document | ShadowRoot>()
function adoptRules(root: Node) {
	if (!(root instanceof Document || root instanceof ShadowRoot) || sheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(`@scope (${tagName('table')}) { ${RULES} }`)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	sheets.add(root)
}

/**
 * @summary Rows of one kind of thing: wraps the page's own <table>.
 * @slot - A <table> with its caption, thead, tbody and tfoot.
 */
export class Table extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="table"]'))
	static properties = { framed: { type: Boolean, reflect: true }, label: {} }

	/** In a hairline box with the brand corner. */
	framed = false
	/** Names the scroll box (a region a keyboard can reach). */
	label?: string

	connectedCallback() {
		super.connectedCallback()
		adoptRules(this.getRootNode())
	}

	private mark() {
		const table = this.querySelector(':scope > table')
		if (!table) return
		table.classList.add('ds-table')
		table.toggleAttribute('data-framed', this.framed)
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		this.mark()
	}

	render() {
		return html`<div data-ds="table" class=${this.framed ? 'relative w-full overflow-hidden rounded-container border border-edge' : 'relative w-full'}><div class="w-full overflow-x-auto -outline-offset-2 fade-x" role=${ifDefined(this.label ? 'region' : undefined)} aria-label=${ifDefined(this.label)} tabindex=${ifDefined(this.label ? '0' : undefined)}><slot @slotchange=${() => this.mark()}></slot></div></div>`
	}
}

define('table', Table)
