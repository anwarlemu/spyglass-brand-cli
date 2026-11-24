import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { codeRuns } from '@/lib/code'
import styles from 'virtual:tw'

// Code.tsx as <spyglass-code>: mono 14/20 in White, as wide as its longest line, comments, punctuation and string
// quotes in the muted gray. `source` and `language` (shell, ts, python or json).

/** @summary Source code with the site's muted punctuation. */
export class Code extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="code"]'))
	static properties = { source: {}, language: {} }
	source = ''
	/** shell, ts, python or json (json keeps `#` as text). */
	language = 'shell'

	render() {
		return html`<pre data-ds="code" class="m-0 w-max type-code text-fg [tab-size:2]"><code>${codeRuns(this.source ?? '', this.language).map((r) => (r.dim ? html`<span class="text-fg-muted">${r.text}</span>` : r.text))}</code></pre>`
	}
}

define('code', Code)
