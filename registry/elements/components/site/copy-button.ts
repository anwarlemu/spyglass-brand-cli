import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { copyText } from '@/lib/code'
import styles from 'virtual:tw'

// CopyButton.tsx as <spyglass-copy-button>: the quiet 40px copy button whose label crosses over to "Copied" for 2s.
// `text`, `label`, `copied-label`, `name` (its accessible name), `select-id` (selected when copying is refused, looked up
// in the same document or shadow root); fires `copy` with detail.text.
export const COPY_BUTTON =
	'ds-copy relative inline-flex h-control-md min-w-20 flex-none cursor-pointer items-center justify-center rounded-ds-sm bg-action-secondary px-4 type-ui-strong whitespace-nowrap text-fg-soft shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-action-secondary-edge)] transition-[background-color,color] duration-160 ease-out select-none before:absolute before:-inset-y-2 before:inset-x-0 hover:bg-action-secondary-hover hover:text-fg data-copied:text-fg'

/**
 * @summary A quiet button that copies text and says so.
 * @fires copy - After copying; detail.text.
 */
export class CopyButton extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('button'))
	static properties = { text: {}, label: {}, copiedLabel: { attribute: 'copied-label' }, name: {}, selectId: { attribute: 'select-id' }, copied: { state: true } }
	text = ''
	label = 'Copy'
	copiedLabel = 'Copied'
	/** Its accessible name. */
	name = 'Copy code'
	selectId?: string
	private copied = false
	private timer = 0

	disconnectedCallback() {
		super.disconnectedCallback()
		clearTimeout(this.timer)
	}

	private async copy() {
		const ok = await copyText(this.text)
		if (!ok) {
			const root = this.getRootNode() as Document | ShadowRoot
			const target = this.selectId ? root.getElementById?.(this.selectId) : null
			if (target) window.getSelection()?.selectAllChildren(target)
			return
		}
		this.copied = true
		this.emit('copy', { text: this.text })
		clearTimeout(this.timer)
		this.timer = window.setTimeout(() => (this.copied = false), 2000)
	}

	render() {
		return html`<span data-ds="copy-button" class="contents"><button type="button" aria-label=${this.name} data-copied=${ifDefined(this.copied ? '' : undefined)} class=${COPY_BUTTON} @click=${this.copy}><span aria-hidden="true" class="grid justify-items-center"><span class="ds-copy-idle [grid-area:1/1]">${this.label}</span><span class="ds-copy-done [grid-area:1/1]">${this.copiedLabel}</span></span></button><span role="status" class="sr-only">${this.copied ? this.copiedLabel : ''}</span></span>`
	}
}

define('copy-button', CopyButton)
