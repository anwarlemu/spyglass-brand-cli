import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { proofPlaceholders, type ProofLogo } from '@/elements/components/site/proof-strip'
import '@/elements/components/site/proof-strip'
import styles from 'virtual:tw'

// ProofBlock.tsx as <spyglass-proof-block>: the White lead line centered over the proof marquee, the section's padding
// under it only. `heading` (React's `title`), `logos` (JSON: { name, src?, ratio?, height? }), `head-id`.

/** @summary The proof section: a lead line over the marquee of marks. */
export class ProofBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="proof-block"]'))
	static properties = { heading: {}, logos: { type: Array }, headId: { attribute: 'head-id' } }
	/** The line over the marks (React's `title`). */
	heading = 'Trusted by teams and agents at'
	logos: ProofLogo[] = proofPlaceholders
	/** Names the heading (React's `id`). */
	headId = 'proof'

	render() {
		return html`<section data-ds="proof-block" aria-labelledby=${`${this.headId}-title`} class="pb-(--ds-layout-section) text-fg"><div class="mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center gap-10 px-(--ds-layout-gutter) text-center"><h2 id=${`${this.headId}-title`} class="type-body-lg text-fg">${this.heading}</h2><spyglass-proof-strip .logos=${this.logos ?? proofPlaceholders}></spyglass-proof-strip></div></section>`
	}
}

define('proof-block', ProofBlock)
