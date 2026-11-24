import { html, nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import '@/elements/components/visuals/ascii-drift'
import styles from 'virtual:tw'

// SideDrifts.tsx as <spyglass-side-drifts>: from 1440 wide, a column crop of the ASCII texture fades in from the left
// edge and a mass crop from the right, 40% of the section's height, as wide as the margin beside the content less 16px.
// `left` and `right`: top, middle, bottom or false. Put it inside a positioned section. Decoration: aria-hidden.

const SIDE = 'hidden min-[1440px]:block min-[1440px]:h-[40%] min-[1440px]:w-[calc((100vw-var(--ds-layout-content))/2-var(--ds-space-lg))]'
const PLACE: Record<string, string> = { top: 'min-[1440px]:top-[8%]', middle: 'min-[1440px]:top-[30%]', bottom: 'min-[1440px]:top-[52%]' }
const side = { fromAttribute: (v: string | null) => (v === 'false' ? false : v) }

/**
 * @summary The ASCII drifts at a wide section's sides.
 */
export class SideDrifts extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { left: { converter: side }, right: { converter: side } }
	/** top, middle, bottom or false. */
	left: string | false = 'top'
	/** top, middle, bottom or false. */
	right: string | false = 'bottom'

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		const l = this.left && PLACE[this.left] ? this.left : false
		const r = this.right && PLACE[this.right] ? this.right : false
		return html`<span data-ds="side-drifts" class="contents">${l ? html`<spyglass-ascii-drift crop="column" from="left" class=${`${SIDE} min-[1440px]:left-0 ${PLACE[l]}`}></spyglass-ascii-drift>` : nothing}${r ? html`<spyglass-ascii-drift crop="mass" from="right" class=${`${SIDE} min-[1440px]:right-0 ${PLACE[r]}`}></spyglass-ascii-drift>` : nothing}</span>`
	}
}

define('side-drifts', SideDrifts)
