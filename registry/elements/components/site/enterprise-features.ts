import { html, unsafeCSS, type PropertyValues } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { ASCII_TEXTURE } from '@/lib/textures'
import { CHAT_MASK, FEATURE_ORDER, LOGOMARK_MASK, REPORTS_START, enterpriseFeaturesContent, runFeature, type EnterpriseFeaturesContent } from '@/lib/enterprise-features'
import { featuresCss } from '@/lib/enterprise-features-css'
import { featureSketch } from '@/lib/enterprise-features-html'
import styles from 'virtual:tw'

// EnterpriseFeatures.tsx as <spyglass-enterprise-features>: the section head and eight cards, each a looping sketch over
// a crop of the ASCII texture with its title and line; the sketches play while seen and rest with reduced motion.
// `content` (JSON, the shape of lib/enterprise-features.ts) and `section-id`.

/**
 * @summary The enterprise features: eight cards with looping product sketches.
 */
export class EnterpriseFeatures extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(featuresCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="enterprise-features"]'))
	static properties = { content: { type: Object }, sectionId: { attribute: 'section-id' } }
	/** The headline and each card's copy, data and pictures. */
	content: EnterpriseFeaturesContent = enterpriseFeaturesContent
	/** The section's id (the heading is `<id>-heading`). */
	sectionId = 'enterprise-features'
	#stops: (() => void)[] = []

	#start() {
		this.#stop()
		const demos = [...this.renderRoot.querySelectorAll<HTMLElement>('[data-demo]')]
		this.#stops = demos.map((el, i) => runFeature(el, FEATURE_ORDER[i].key, FEATURE_ORDER[i].key === 'reports' ? REPORTS_START : FEATURE_ORDER[i].start))
	}
	#stop() {
		this.#stops.forEach((stop) => stop())
		this.#stops = []
	}
	connectedCallback() {
		super.connectedCallback()
		if (this.hasUpdated) this.updateComplete.then(() => this.#start())
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.#stop()
	}
	protected updated(changed: PropertyValues) {
		super.updated(changed)
		if (changed.has('content')) this.#start()
	}

	render() {
		const c = this.content ?? enterpriseFeaturesContent
		const id = this.sectionId
		return html`<section id=${id} aria-labelledby=${`${id}-heading`} data-ds="enterprise-features" class="py-(--ds-layout-section) text-fg" style=${`--ds-ef-logomark: ${LOGOMARK_MASK}; --ds-ef-chat: ${CHAT_MASK}`}><div class="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)"><h2 id=${`${id}-heading`} class="ds-ef-head mb-16 type-section max-md:text-center lg:mb-20">${c.headline}</h2><ul role="list" class="m-0 grid list-none grid-cols-1 gap-(--ds-ent-feat-gap) p-0 sm:grid-cols-2 lg:grid-cols-6">${FEATURE_ORDER.map(({ key, ascii }) => html`<li data-feature=${key} class="ds-ef-card flex min-w-0 flex-col overflow-clip rounded-panel bg-surface-raised"><div class="ds-ef-visual"><div aria-hidden="true" class="ds-ef-ascii" data-feature=${key} style=${`background-image: url("${ASCII_TEXTURE}"); background-position: ${ascii}`}></div><div class="ds-ef-demo" data-demo="" data-name=${c[key].title}><div class="ds-ef-canvas" aria-hidden="true" inert>${unsafeHTML(featureSketch(key, c))}</div><p class="sr-only">${c[key].summary}</p></div></div><div class="flex flex-col gap-2 px-(--ds-ent-feat-pad) pb-(--ds-ent-feat-pad)"><h3 class="m-0 type-heading-4">${c[key].title}</h3><p class="m-0 max-w-measure type-body text-pretty text-fg-soft">${c[key].line}</p></div></li>`)}</ul></div></section>`
	}
}

define('enterprise-features', EnterpriseFeatures)
