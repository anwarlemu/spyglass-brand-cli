import { nothing } from 'lit'
import { DsElement, define } from '@/elements/lib/element'
import { asciiDriftStyle, type AsciiDriftCrop, type AsciiDriftFrom, type AsciiDriftStrength } from '@/lib/ascii-drift'
import styles from 'virtual:tw'

// AsciiDrift.tsx as <spyglass-ascii-drift>: a crop of the ASCII texture tile, fading out radially from one side. The
// host is the box, absolute and behind the content; the page's classes size and place it. Decoration: aria-hidden.

/**
 * @summary A crop of the ASCII texture behind a section.
 */
export class AsciiDrift extends DsElement {
	static styles = [DsElement.styles, styles]
	static properties = { crop: {}, from: {}, strength: {} }
	/** mass, column, cluster or scatter. */
	crop: AsciiDriftCrop = 'mass'
	/** centre, left, right, top or bottom. */
	from: AsciiDriftFrom = 'centre'
	/** quiet, faint or hero. */
	strength: AsciiDriftStrength = 'quiet'

	connectedCallback() {
		super.connectedCallback()
		this.setAttribute('aria-hidden', 'true')
	}

	render() {
		// The drift's own declarations go on the host (the box), one by one, so the page's own inline style stays.
		for (const part of asciiDriftStyle(this.crop, this.from, this.strength).split(/;\s(?=[a-z-]+:)/)) {
			const i = part.indexOf(':')
			this.style.setProperty(part.slice(0, i).trim(), part.slice(i + 1).trim())
		}
		return nothing
	}
}

define('ascii-drift', AsciiDrift)
