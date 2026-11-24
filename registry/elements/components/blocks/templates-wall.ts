import { html, type PropertyValues } from 'lit'
import { unsafeStatic, html as shtml } from 'lit/static-html.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { createTemplatesWall, TEMPLATES_WALL_TILES, type TemplatesWall as Wall } from '@/lib/templates-wall'
import { templatesWallContent, type TemplatesWallContent } from '@/lib/pages/templates'
import styles from 'virtual:tw'

// TemplatesWall.tsx as <spyglass-templates-wall>: the helix of tiles drifting and turning around the words
// (lib/templates-wall.ts), the headline over the chip rolling through the template names, the lead and the status.
// `content`, `pictures` (JSON list of image URLs; none draws neutral tones), `hero` (h1, the window's height under
// the header), `at` (draw that moment and hold it) and `section-id`. Reduced motion holds one still frame.

const TILES = Array.from({ length: TEMPLATES_WALL_TILES }, (_, j) => j)

/**
 * @summary The templates wall: a turning tunnel of tiles around the headline and the rolling names.
 */
export class TemplatesWall extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="templates-wall"]'))
	static properties = { content: { type: Object }, pictures: { type: Array }, hero: { type: Boolean }, at: { type: Number }, sectionId: { attribute: 'section-id' } }
	/** The copy (lib/pages/templates.ts by default). */
	content: TemplatesWallContent = templatesWallContent
	/** Pictures for the tiles, used in turn. */
	pictures?: string[]
	/** The page's first section: an h1 and the window's height less the header. */
	hero = false
	/** Draw the frame at this time (ms) and hold it. */
	at?: number
	/** The section's id (React's `id`); its heading is `<id>-heading`. */
	sectionId = 'templates'
	private wall?: Wall
	private key = ''

	protected updated(changed: PropertyValues) {
		super.updated(changed)
		const c = this.content ?? templatesWallContent
		const key = `${(this.pictures ?? []).join('|')}|${this.at ?? ''}|${c.names.join('|')}`
		if (key === this.key && this.wall) return
		this.key = key
		this.wall?.destroy()
		const root = this.renderRoot.querySelector<HTMLElement>('.ds-tpl-scene')
		if (!root) return
		const one = (name: string) => root.querySelector<HTMLElement>(`[data-tpl="${name}"]`)!
		const all = (name: string) => [...root.querySelectorAll<HTMLElement>(`[data-tpl="${name}"]`)]
		this.wall = createTemplatesWall({ root, tunnel: one('tunnel'), box: one('box'), tiles: all('tile'), rows: all('row'), names: all('name'), chip: one('chip'), capL: one('cap-l'), capR: one('cap-r'), bar: one('bar') }, { pictures: this.pictures, at: this.at })
	}

	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated && !this.wall) this.requestUpdate()
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		this.wall?.destroy()
		this.wall = undefined
		this.key = ''
	}

	render() {
		const c = this.content ?? templatesWallContent
		const heading = unsafeStatic(this.hero ? 'h1' : 'h2')
		const headingId = `${this.sectionId}-heading`
		return html`<section data-ds="templates-wall" id=${this.sectionId} aria-labelledby=${headingId} ?data-hero=${this.hero} class="ds-tpl relative isolate z-1 overflow-hidden bg-surface text-fg"><div class="ds-tpl-scene relative grid place-items-center"><div aria-hidden="true" data-tpl="tunnel" class="pointer-events-none absolute inset-0"><div data-tpl="box" class="ds-tpl-box">${TILES.map(() => html`<span data-tpl="tile" class="ds-tpl-tile"></span>`)}</div></div><div class="relative z-1 mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center px-(--ds-layout-gutter) text-center"><div class="ds-tpl-line flex flex-col items-center gap-y-2 type-section text-fg">${shtml`<${heading} id=${headingId} data-tpl="row" class="ds-tpl-headline whitespace-nowrap">${c.headline}</${heading}>`}<span aria-hidden="true" data-tpl="chip" class="ds-tpl-chip relative inline-grid px-3 md:px-4"><span class="ds-tpl-surface absolute inset-0"><span data-tpl="cap-l" class="ds-tpl-cap"></span><span data-tpl="bar" class="ds-tpl-bar"></span><span data-tpl="cap-r" class="ds-tpl-cap"></span></span><span class="ds-tpl-window relative grid justify-items-center overflow-hidden py-2">${c.names.map((name) => html`<span data-tpl="name" class="ds-tpl-name whitespace-nowrap">${name}</span>`)}</span></span></div><ul class="sr-only">${c.names.map((name) => html`<li>${name}</li>`)}</ul><div class="mt-8 flex flex-col items-center gap-4"><p data-tpl="row" class="ds-tpl-lead max-w-(--ds-layout-measure) type-body-xl text-fg-soft">${c.lead}</p><p data-tpl="row" class="type-ui text-fg-faint">${c.status}</p></div></div></div></section>`
	}
}

define('templates-wall', TemplatesWall)
