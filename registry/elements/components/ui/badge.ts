import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Badge.tsx as <spyglass-badge>: a short label for a state or a kind, DM Sans Medium 12/16 in sentence case, 24px tall
// with a 4px corner. default is White with a Black label; secondary the #363636 inset fill; outline a #666666 hairline on
// Black; destructive a red wash with a red label. `dot` leads it with a small spectrum color; the word still carries
// the meaning.
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'
export type BadgeDot = 'magenta' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue'
const VARIANTS: Record<BadgeVariant, string> = {
	default: 'border-transparent bg-action-primary text-action-primary-fg',
	secondary: 'border-transparent bg-surface-inset text-fg-soft',
	outline: 'border-edge-strong bg-transparent text-fg',
	destructive: 'border-transparent bg-surface-danger text-fg-danger',
}
const DOTS: Record<BadgeDot, string> = {
	magenta: 'bg-magenta',
	red: 'bg-red',
	orange: 'bg-orange',
	yellow: 'bg-yellow',
	green: 'bg-green',
	cyan: 'bg-cyan',
	blue: 'bg-blue',
}

/**
 * @summary A short label for a state or a kind, in capitals.
 * @slot - The word.
 */
export class Badge extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { variant: { reflect: true }, dot: {} }

	/** default (White), secondary, outline or destructive. */
	variant: BadgeVariant = 'default'
	/** A small spectrum color before the word. */
	dot?: BadgeDot

	render() {
		const dot = this.dot && DOTS[this.dot]
		return html`<span data-ds="badge" class=${['inline-flex h-6 shrink-0 items-center gap-1.5 rounded-ds-sm border px-2 type-caption font-medium whitespace-nowrap', VARIANTS[this.variant] ?? VARIANTS.default].join(' ')}>${dot ? html`<span class=${['size-1.5 shrink-0 rounded-full', dot].join(' ')} aria-hidden="true"></span>` : nothing}<slot></slot></span>`
	}
}

define('badge', Badge)
