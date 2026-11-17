import { html, nothing } from 'lit'
import { X } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// Toast.tsx as <spyglass-toast>: one note, what just happened, in the card's #171717 fill with a hairline and the
// brand corner. The title in DM Sans Medium, a muted line under it, one small White button when there is something to
// do (`action-label`, firing `action`), and a close button when `dismissable` (firing `dismiss`). React's `title` is
// `heading`. The toaster (sonner) stacks these in a corner and times them.

/**
 * @summary One note: what just happened.
 * @fires action - The action button was pressed.
 * @fires dismiss - The close button was pressed.
 */
export class Toast extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="toast"]'))
	static properties = { heading: {}, description: {}, actionLabel: { attribute: 'action-label' }, dismissable: { type: Boolean } }

	/** What happened, in a few words (React's `title`). */
	heading = ''
	/** A line under the title. */
	description?: string
	/** The action button's label. */
	actionLabel?: string
	/** Shows the close button. */
	dismissable = false

	render() {
		return html`<div data-ds="toast" class="flex w-full items-start gap-3 rounded-container border border-edge-strong bg-surface-raised p-4">
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<p class="type-ui-strong text-fg">${this.heading}</p>
				${this.description ? html`<p class="type-ui text-fg-muted">${this.description}</p>` : nothing}
			</div>
			${this.actionLabel ? html`<spyglass-button size="sm" class="-my-1.5" @click=${() => this.emit('action')}>${this.actionLabel}</spyglass-button>` : nothing}
			${this.dismissable ? html`<button type="button" class="-my-1.5 -mr-1.5 inline-flex size-control-sm shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg" aria-label="Dismiss" @click=${() => this.emit('dismiss')}>${icon(X, 'x', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}</button>` : nothing}
		</div>`
	}
}

define('toast', Toast)
