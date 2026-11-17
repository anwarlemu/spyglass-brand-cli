import { html, unsafeStatic } from 'lit/static-html.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Text.tsx as <spyglass-text>: the brand's type scale as one part, every variant one of the theme's type utilities
// (Funnel Display titles, DM Sans text, capital labels with 6% tracking, Geist Mono code). It draws the variant's tag
// in its shadow root with the same classes as React; `as` overrides the tag. Layout classes on the element (a margin,
// a width) land on the tag it draws.
export type TextVariant = 'display' | 'hero' | 'h1' | 'h2' | 'h3' | 'h4' | 'lead' | 'large' | 'p' | 'ui' | 'small' | 'muted' | 'caption' | 'label' | 'blockquote' | 'code'

const TAGS: Record<TextVariant, string> = {
	display: 'h1', hero: 'h1', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4',
	lead: 'p', large: 'p', p: 'p', ui: 'p', small: 'p', muted: 'p', caption: 'p', label: 'p', blockquote: 'blockquote', code: 'code',
}
const CLASSES: Record<TextVariant, string> = {
	display: 'type-display text-fg',
	hero: 'type-hero text-fg',
	h1: 'type-heading-1 text-fg',
	h2: 'type-heading-2 text-fg',
	h3: 'type-heading-3 text-fg',
	h4: 'type-heading-4 text-fg',
	lead: 'type-body-lg text-fg-muted',
	large: 'type-body-lg text-fg',
	p: 'type-body text-fg',
	ui: 'type-ui text-fg',
	small: 'type-ui-strong text-fg',
	muted: 'type-ui text-fg-muted',
	caption: 'type-caption text-fg-muted',
	label: 'type-label text-fg-soft',
	blockquote: 'border-l-2 border-edge-strong pl-6 type-body-lg text-fg-soft',
	code: 'rounded-ds-sm bg-surface-subtle px-1 py-0.5 type-code text-fg',
}
// The tags a page may ask for.
const ALLOWED = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'blockquote', 'code', 'strong', 'em', 'small', 'label', 'li', 'figcaption'])

/**
 * @summary The brand's type scale: Funnel Display titles, DM Sans text, capital labels, Geist Mono code.
 * @slot - The text.
 */
export class Text extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="text"]'))
	static properties = { variant: { reflect: true }, as: {} }

	/** The step of the scale: display, hero, h1 to h4, lead, large, p, ui, small, muted, caption, label, blockquote or code. */
	variant: TextVariant = 'p'
	/** The tag, in place of the variant's own. */
	as?: string

	private get tag() {
		const v = CLASSES[this.variant] ? this.variant : 'p'
		const t = (this.as ?? TAGS[v]).toLowerCase()
		return ALLOWED.has(t) ? t : TAGS[v]
	}

	render() {
		const v = CLASSES[this.variant] ? this.variant : 'p'
		const t = unsafeStatic(this.tag)
		return html`<${t} data-ds="text" class=${CLASSES[v]}><slot></slot></${t}>`
	}
}

define('text', Text)
