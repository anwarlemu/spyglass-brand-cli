import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// Alert.tsx as <spyglass-alert>: a #262626 box on Black with the brand corner and no border or shadow, a 16px Lucide
// icon (the `icon` slot), the subject in DM Sans Medium (`heading`, React's `title`) and a line of muted DM Sans under
// it (the default slot), and a button at the end (the `action` slot). `variant="destructive"` turns the icon and the
// subject red. role="alert" so it is read out; `role="status"` for a note that was there from the start.
export type AlertVariant = 'default' | 'destructive'
const VARIANTS: Record<AlertVariant, string> = {
	default: 'text-fg',
	destructive: 'text-fg-danger',
}

/**
 * @summary A note or a problem in a #262626 box: an icon, the subject and a line.
 * @slot - The line under the subject.
 * @slot icon - A 16px Lucide icon.
 * @slot action - A button at the end.
 */
export class Alert extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="alert"]'))
	static properties = { heading: {}, variant: { reflect: true }, alertRole: { attribute: 'alert-role' } }

	/** The subject (React's `title`). */
	heading = ''
	/** default, or destructive (red) for what broke. */
	variant: AlertVariant = 'default'
	/** alert (read out at once) or status (polite): React's `role`. */
	alertRole: 'alert' | 'status' = 'alert'

	render() {
		const tone = VARIANTS[this.variant] ?? VARIANTS.default
		return html`<div data-ds="alert" role=${this.alertRole} class="flex w-full items-start gap-3 rounded-container bg-surface-raised p-4 max-sm:flex-wrap">${this.hasSlot('icon') ? html`<span class=${['mt-0.5 flex shrink-0', tone].join(' ')} aria-hidden="true"><slot name="icon"></slot></span>` : nothing}<div class="flex min-w-0 flex-1 flex-col gap-1"><p class=${['type-ui-strong', tone].join(' ')}>${this.heading}</p>${this.hasSlot() ? html`<div class="type-ui text-fg-muted"><slot></slot></div>` : nothing}</div>${this.hasSlot('action') ? html`<div class="shrink-0 self-center max-sm:basis-full max-sm:pl-7"><slot name="action"></slot></div>` : nothing}</div>`
	}
}

define('alert', Alert)
