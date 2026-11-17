import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Toggle.tsx as <spyglass-toggle>: a button that stays pressed: no fill at rest (or, as `outline`, a #363636
// hairline); pressed it takes the primary White with Black text. Sizes sm (32px), md (40px), lg (48px); `icon` makes it
// square (put its name in aria-label). A press gives a little (scale 0.97); colors change over 150ms. `pressed` (an
// attribute) with `pressed-change`.

const VARIANTS = {
	default: 'bg-transparent',
	outline: 'border border-edge-strong bg-surface aria-pressed:border-action-primary not-aria-pressed:hover:not-disabled:border-action-secondary-edge-hover',
} as const
const SIZES = { sm: 'h-control-sm gap-1.5 type-ui-strong', md: 'h-control-md gap-2 type-ui-strong', lg: 'h-control-lg gap-2 type-body font-medium' } as const
const PADDING = { sm: 'px-2.5', md: 'px-3', lg: 'px-4' } as const
const SQUARE = { sm: 'w-control-sm px-0', md: 'w-control-md px-0', lg: 'w-control-lg px-0' } as const
export type ToggleVariant = keyof typeof VARIANTS
export type ToggleSize = keyof typeof SIZES

/**
 * @summary A button that stays pressed.
 * @slot - The label, with a Lucide icon before it if any.
 * @fires pressed-change - It was pressed; detail.value is the new state.
 */
export class Toggle extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('button'))
	static properties = {
		pressed: { type: Boolean, reflect: true },
		disabled: { type: Boolean, reflect: true },
		variant: { reflect: true },
		size: { reflect: true },
		icon: { type: Boolean },
		label: { attribute: 'aria-label' },
	}

	pressed = false
	disabled = false
	/** default (no fill at rest) or outline (a hairline). */
	variant: ToggleVariant = 'default'
	/** sm (32px), md (40px) or lg (48px). */
	size: ToggleSize = 'md'
	/** A square icon toggle (put its name in aria-label). */
	icon = false
	/** The name for assistive tech, passed to the inner button. */
	label?: string

	render() {
		const size = SIZES[this.size] ? this.size : 'md'
		const classes = [
			'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control whitespace-nowrap select-none text-fg-soft',
			'transition-[background-color,color,border-color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100',
			'not-aria-pressed:hover:not-disabled:bg-action-ghost-hover not-aria-pressed:hover:not-disabled:text-fg aria-pressed:bg-action-primary aria-pressed:text-action-primary-fg aria-pressed:hover:not-disabled:bg-action-primary-hover',
			'disabled:cursor-not-allowed disabled:text-action-disabled-fg disabled:aria-pressed:bg-action-disabled',
			SIZES[size],
			this.icon ? SQUARE[size] : PADDING[size],
			VARIANTS[this.variant] ?? VARIANTS.default,
		].join(' ')
		return html`<button data-ds="toggle" type="button" class=${classes} aria-pressed=${String(this.pressed)} aria-label=${ifDefined(this.label)} ?disabled=${this.disabled} @click=${() => this.commit(!this.pressed, 'pressed')}><slot></slot></button>`
	}
}

define('toggle', Toggle)
