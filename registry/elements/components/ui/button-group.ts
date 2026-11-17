import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ButtonGroup.tsx as <spyglass-button-group>: buttons that belong together, joined into one block with the brand corner
// on its outer corners only and a 1px Black seam between them. `vertical` stacks them. Give it a label for the group.
//
// React's rules reach each child's root (`.ds-btngroup > *`). A library element such as <spyglass-button> draws its
// root in its own shadow root, so the group marks each child with its place (data-group="first middle last") and gives
// that shadow root a small sheet that squares the inner corners there; a child that is its own box (a native field)
// takes the rules in button-group.css.

// For a child's shadow root: the child's root box is the shadow root's element with data-ds.
const CHILD_RULES = `
:host([data-group]) > [data-ds] { position: relative; }
:host([data-group]) > [data-ds]:is(:hover, :focus-visible, :focus-within) { z-index: 1; }
:host([data-group~="after-x"]) > [data-ds] { border-start-start-radius: 0; border-end-start-radius: 0; }
:host([data-group~="before-x"]) > [data-ds] { border-start-end-radius: 0; border-end-end-radius: 0; }
:host([data-group~="after-y"]) > [data-ds] { border-start-start-radius: 0; border-start-end-radius: 0; }
:host([data-group~="before-y"]) > [data-ds] { border-end-start-radius: 0; border-end-end-radius: 0; }
`
const childSheets = new WeakSet<ShadowRoot>()
function adoptChildRules(root: ShadowRoot) {
	if (childSheets.has(root)) return
	const sheet = new CSSStyleSheet()
	sheet.replaceSync(CHILD_RULES)
	root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
	childSheets.add(root)
}

/**
 * @summary Buttons that belong together, joined into one block.
 * @slot - The buttons (or a field with its button).
 */
export class ButtonGroup extends DsElement {
	static styles = [DsElement.styles, styles]
	// Layout classes on the element (w-full) land on the group's box, as on the React root.
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="button-group"]'))
	static properties = { label: {}, vertical: { type: Boolean } }

	/** The group's name. */
	label?: string
	/** Stacked. */
	vertical = false

	/** The box a child draws: its shadow root's root when its host lays out nothing, else the child itself. */
	private box(child: HTMLElement) {
		const root = child.shadowRoot
		if (root && getComputedStyle(child).display === 'contents') return root.querySelector<HTMLElement>('[data-ds]') ?? child
		return child
	}

	private async mark() {
		const kids = [...this.children] as HTMLElement[]
		// Library elements draw their roots once defined and rendered.
		await Promise.all(kids.filter((k) => k.localName.includes('-')).map(async (k) => {
			await customElements.whenDefined(k.localName)
			await (k as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete
		}))
		const axis = this.vertical ? 'y' : 'x'
		kids.forEach((k, i) => {
			if (k.shadowRoot && this.box(k) !== k) adoptChildRules(k.shadowRoot)
			const marks = [i > 0 ? `after-${axis}` : '', i < kids.length - 1 ? `before-${axis}` : ''].filter(Boolean)
			k.setAttribute('data-group', marks.join(' '))
		})
	}

	protected updated() {
		void this.mark()
	}

	render() {
		return html`<div data-ds="button-group" class="ds-btngroup" role="group" aria-label=${ifDefined(this.label)} ?data-vertical=${this.vertical}><slot @slotchange=${() => void this.mark()}></slot></div>`
	}
}

define('button-group', ButtonGroup)
