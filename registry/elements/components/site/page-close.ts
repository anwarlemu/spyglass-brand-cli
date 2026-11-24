import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { asciiDriftStyle } from '@/lib/ascii-drift'
import '@/elements/components/site/connect-menu'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// PageClose.tsx as <spyglass-page-close>: the centered closing section, its lines, the note and the actions (the
// connect menu with a quiet button by default, your own control in the `control` slot, or with connect="false" a White
// and a quiet button), and from 1024 two ASCII drifts at the corners. Nothing moves.
export interface PageAction { label: string; href: string }

/**
 * @summary The closing section: a last head, a note and the main actions.
 * @slot control - The main control in place of the connect menu.
 */
export class PageClose extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="page-close"]'))
	static properties = {
		closeId: { attribute: 'close-id' },
		lines: { type: Array },
		note: {},
		primary: { type: Object },
		secondary: { type: Object },
		connect: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
		texture: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } },
	}
	/** The section's id (React's `id`); names its heading. */
	closeId = 'close'
	lines: string[] = ['Give your agents', 'the social internet']
	note = '500 free credits every month. No card required.'
	/** The White button ({ label, href }); quiet beside a control. */
	primary: PageAction = { label: 'Get a free API key', href: '#' }
	/** The quiet button when there is no control. */
	secondary: PageAction = { label: 'Talk to us', href: '#' }
	/** The connect menu as the main control when the control slot is empty (React's default `control`). */
	connect = true
	/** The two ASCII drifts from 1024. */
	texture = true

	render() {
		const lines = this.lines ?? []
		const slotted = this.hasSlot('control')
		const control = slotted ? html`<slot name="control"></slot>` : this.connect ? html`<spyglass-connect-menu></spyglass-connect-menu>` : null
		return html`<section data-ds="page-close" id=${this.closeId} aria-labelledby=${`${this.closeId}-heading`} class="relative isolate overflow-x-clip py-(--ds-layout-section) text-fg">${this.texture ? html`<span aria-hidden="true" class="pointer-events-none absolute bottom-(--ds-layout-section) left-0 -z-1 hidden h-[64%] w-[min(calc(50%-var(--ds-page-head-drift-clear)),var(--ds-page-close-drift-w))] select-none lg:block" style=${asciiDriftStyle('mass', 'left')}></span><span aria-hidden="true" class="pointer-events-none absolute top-(--ds-layout-section) right-0 -z-1 hidden h-[48%] w-[min(20%,var(--ds-page-close-drift-high-w))] select-none lg:block" style=${asciiDriftStyle('scatter', 'right')}></span>` : nothing}<div class="mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center gap-6 px-(--ds-layout-gutter) text-center"><h2 id=${`${this.closeId}-heading`} class="type-section [text-box:trim-start_cap_alphabetic]">${lines.map((line, i) => html`<span class="block">${line}${i < lines.length - 1 ? ' ' : nothing}</span>`)}</h2>${this.note ? html`<p class="type-body text-fg-soft">${this.note}</p>` : nothing}<div class="mt-4 flex flex-wrap justify-center gap-3 max-md:flex-col max-md:self-stretch">${control ? html`<div class="contents max-md:hidden">${control}</div><div class="contents max-md:hidden"><spyglass-button href=${this.primary.href} variant="secondary">${this.primary.label}</spyglass-button></div><div class="contents md:hidden"><spyglass-button href=${this.primary.href}>${this.primary.label}</spyglass-button></div>` : html`<spyglass-button href=${this.primary.href}>${this.primary.label}</spyglass-button><spyglass-button href=${this.secondary.href} variant="secondary">${this.secondary.label}</spyglass-button>`}</div></div></section>`
	}
}

define('page-close', PageClose)
