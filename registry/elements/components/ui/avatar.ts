import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Avatar.tsx as <spyglass-avatar>: who or what something belongs to, in a circle. A `src` shows a picture cropped round;
// without one, or if it fails to load, the name's initials (two at most) in White DM Sans Medium on #262626. Sizes sm
// (24px), md (32px) and lg (40px). The name is read out; the picture is decoration.
export type AvatarSize = 'sm' | 'md' | 'lg'
const SIZES: Record<AvatarSize, string> = { sm: 'size-6 text-label', md: 'size-8 text-caption', lg: 'size-10 text-ui' }

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()

/**
 * @summary Who or what something belongs to: a picture or initials in a circle.
 */
export class Avatar extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="avatar"]'))
	static properties = { name: {}, src: {}, size: { reflect: true }, failed: { state: true } }

	/** Whose it is: its initials, and the name for assistive tech. */
	name?: string
	/** A picture, cropped round. */
	src?: string
	/** sm (24px), md (32px) or lg (40px). */
	size: AvatarSize = 'md'
	private failed = false

	render() {
		const classes = ['inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-action-secondary leading-none font-medium text-fg select-none', SIZES[this.size] ?? SIZES.md].join(' ')
		return html`<span data-ds="avatar" class=${classes} role=${ifDefined(this.name ? 'img' : undefined)} aria-label=${ifDefined(this.name)} aria-hidden=${ifDefined(this.name ? undefined : 'true')}>${this.src && !this.failed ? html`<img src=${this.src} alt="" class="size-full object-cover" @error=${() => { this.failed = true }}>` : initials(this.name)}</span>`
	}
}

define('avatar', Avatar)
