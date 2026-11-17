import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsFormElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Button.tsx as a web component, <spyglass-button>: a White fill with a Black DM Sans Medium label for the one main
// action, secondary (#262626) for the rest, ghost for tools in rows. Sizes sm (32px), md (40px) and lg (48px); `icon`
// makes it square. A press gives a little (scale 0.97); hover changes the fill only where a pointer hovers. `href`
// renders a link. It is form-associated: type="submit" submits its form, type="reset" resets it. aria-label,
// aria-description, aria-expanded, aria-haspopup and aria-controls on it pass to the inner button.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

// The attributes that move from the element to its inner button, by property.
const MOVED = ['aria-expanded', 'aria-haspopup', 'aria-controls']
const FIELD: Record<string, 'expanded' | 'haspopup' | 'controls'> = { 'aria-expanded': 'expanded', 'aria-haspopup': 'haspopup', 'aria-controls': 'controls' }

const VARIANTS: Record<ButtonVariant, string> = {
	primary: 'bg-action-primary text-action-primary-fg hover:not-disabled:bg-action-primary-hover',
	secondary: 'bg-action-secondary text-action-secondary-fg hover:not-disabled:bg-action-secondary-hover',
	ghost: 'bg-transparent text-fg hover:not-disabled:bg-action-ghost-hover',
}
const SIZES: Record<ButtonSize, string> = {
	sm: 'h-control-sm gap-1.5 type-ui-strong',
	md: 'h-control-md gap-2 type-ui-strong',
	lg: 'h-control-lg gap-2 type-body font-medium',
}
// One padding class per button, so a square button's 0 never competes with a label's padding in the stylesheet.
const PADDING: Record<ButtonSize, string> = { sm: 'px-3', md: 'px-4', lg: 'px-5' }
const SQUARE: Record<ButtonSize, string> = { sm: 'w-control-sm px-0', md: 'w-control-md px-0', lg: 'w-control-lg px-0' }

/**
 * @summary An action: primary (White) by default, secondary or ghost; three sizes; `icon` for a square icon button.
 * @slot - The label, with a Lucide icon beside it if any.
 * @fires click - When pressed (the native click, from the inner button).
 * @csspart control - The inner button or link.
 */
export class Button extends DsFormElement {
	static styles = [DsFormElement.styles, styles]
	// Layout classes on the element (w-full, ml-auto) land on the box it draws, as on the React root.
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[part~="control"]'))
	static properties = {
		variant: { reflect: true },
		size: { reflect: true },
		icon: { type: Boolean },
		href: {},
		type: {},
		disabled: { type: Boolean, reflect: true },
		label: { attribute: 'aria-label' },
		description: { attribute: 'aria-description' },
		expanded: { attribute: false },
		haspopup: { attribute: false },
		controls: { attribute: false },
		rootName: { attribute: false },
	}
	static get observedAttributes() {
		return [...super.observedAttributes, ...MOVED]
	}

	/** primary (White), secondary or ghost. */
	variant: ButtonVariant = 'primary'
	/** sm (32px), md (40px) or lg (48px). */
	size: ButtonSize = 'md'
	/** A square icon button (put the name in aria-label). */
	icon = false
	/** Renders a link. */
	href?: string
	type: 'button' | 'submit' | 'reset' = 'button'
	disabled = false
	/** The name for assistive tech, passed to the inner button (aria-label on the element). */
	label?: string
	/** A description for assistive tech, passed to the inner button (aria-description on the element). */
	description?: string
	/** Whether what it opens is open (the aria-expanded attribute). */
	expanded?: string
	/** What it opens: dialog, menu, listbox (the aria-haspopup attribute). */
	haspopup?: string
	/** The id of what it opens (the aria-controls attribute). */
	controls?: string
	/** The data-ds its box says: button, or the name of an item drawn as a button. */
	rootName = 'button'

	attributeChangedCallback(name: string, old: string | null, value: string | null) {
		const field = FIELD[name]
		if (!field) return super.attributeChangedCallback(name, old, value)
		if (value === null) return
		this[field] = value
		this.removeAttribute(name)
	}
	protected updated(changed: Map<PropertyKey, unknown>) {
		super.updated(changed)
		const inner = this.renderRoot.querySelector('button, a') as (HTMLElement & { ariaControlsElements?: Element[] | null }) | null
		if (inner && changed.has('controls') && 'ariaControlsElements' in inner) {
			const target = this.controls ? (this.getRootNode() as Document | ShadowRoot).getElementById?.(this.controls) : null
			inner.ariaControlsElements = target ? [target] : null
		}
	}

	private onClick() {
		if (this.inactive || this.href) return
		if (this.type === 'submit') this.form?.requestSubmit()
		else if (this.type === 'reset') this.form?.reset()
	}

	render() {
		const size = SIZES[this.size] ? this.size : 'md'
		const classes = [
			'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control whitespace-nowrap select-none',
			'transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100',
			'disabled:cursor-not-allowed disabled:bg-action-disabled disabled:text-action-disabled-fg',
			SIZES[size],
			this.icon ? SQUARE[size] : PADDING[size],
			VARIANTS[this.variant] ?? VARIANTS.primary,
		].join(' ')
		return this.href
			? html`<a data-ds="${this.rootName}" part="control" href=${this.href} class=${classes} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} aria-expanded=${ifDefined(this.expanded)} aria-haspopup=${ifDefined(this.haspopup as never)}><slot></slot></a>`
			: html`<button data-ds="${this.rootName}" part="control" type="button" ?disabled=${this.inactive} class=${classes} aria-label=${ifDefined(this.label)} aria-description=${ifDefined(this.description)} aria-expanded=${ifDefined(this.expanded)} aria-haspopup=${ifDefined(this.haspopup as never)} @click=${this.onClick}><slot></slot></button>`
	}
}

define('button', Button)
