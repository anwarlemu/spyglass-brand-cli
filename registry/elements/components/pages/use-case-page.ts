import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import type { ChatContent, BuildContent } from '@/lib/use-case-hero'
import { useCaseContent, type UseCaseContent } from '@/lib/pages/use-case'
import '@/elements/components/site/site-header'
import '@/elements/components/site/use-case-hero'
import '@/elements/components/site/connect-menu'
import '@/elements/components/site/proof-block'
import '@/elements/components/blocks/scroll-story'
import '@/elements/components/blocks/stories-block'
import '@/elements/components/blocks/use-case-wheel'
import '@/elements/components/blocks/faq-block'
import '@/elements/components/site/page-close'
import '@/elements/components/blocks/site-footer'
import '@/elements/components/visuals/dispersion-field'
import styles from 'virtual:tw'

// UseCasePage.tsx as <spyglass-use-case-page>: the header, the hero (with the connect menu), the proof line, the scroll
// story, the stories, the wheel with the light around its ring (the field takes the wheel's ripple), the FAQ, the
// closing section and the footer. `content`, `visual`, `chat` and `build` as in React; `still` holds the wheel and its
// light.
const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary A use case's page.
 */
export class UseCasePage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="use-case-page"]'))
	static properties = { content: { type: Object }, visual: {}, chat: { type: Object }, build: { type: Object }, still: { type: Boolean } }
	/** The copy as JSON (lib/pages/use-case.ts by default). */
	content: UseCaseContent = useCaseContent
	/** The hero's visual: chat or build. */
	visual: 'chat' | 'build' = 'chat'
	/** The hero chat's session. */
	chat?: ChatContent
	/** The hero's build library. */
	build?: BuildContent
	/** Hold the wheel and its light still. */
	still = false

	updated() {
		const wheel = this.renderRoot.querySelector<HTMLElement & { ripple?: unknown }>('spyglass-use-case-wheel')
		const field = this.renderRoot.querySelector<HTMLElement & { ripple?: unknown }>('spyglass-dispersion-field')
		if (wheel && field && field.ripple !== wheel.ripple) field.ripple = wheel.ripple
	}

	render() {
		const c = this.content ?? useCaseContent
		return html`<div data-ds="use-case-page" class="isolate bg-surface text-fg"><div class=${`${CONTAINER} relative z-10`}><spyglass-site-header .links=${c.chrome.header.nav} .secondary=${c.chrome.header.secondary} .cta=${c.chrome.header.cta}></spyglass-site-header></div><main id="main"><spyglass-use-case-hero .content=${c.hero} visual=${this.visual} .chat=${this.chat} .build=${this.build}>${c.control === 'mcp' ? html`<spyglass-connect-menu slot="control"></spyglass-connect-menu>` : nothing}</spyglass-use-case-hero><spyglass-proof-block head-id=${`${c.slug}-proof`} heading=${c.proof}></spyglass-proof-block><spyglass-scroll-story preset=${c.story.preset} .actions=${c.story.actions}></spyglass-scroll-story><spyglass-stories-block section-id=${`${c.slug}-stories`} headline=${c.stories.headline} lead=${c.stories.lead} .stories=${c.stories.items} customers="false"></spyglass-stories-block><spyglass-use-case-wheel section-id="v2-use-cases" .autoplay=${!this.still}><spyglass-dispersion-field slot="light" class="relative block size-full" composition="ring" seed="5" ?still=${this.still}></spyglass-dispersion-field></spyglass-use-case-wheel><div class=${`${CONTAINER} py-(--ds-layout-section)`}><spyglass-faq-block head-id=${`${c.slug}-faq`} heading=${c.faq.headline} body=${c.faq.lead} .action=${c.faq.docs} .items=${c.faq.items}></spyglass-faq-block></div><spyglass-page-close></spyglass-page-close></main><spyglass-site-footer .columns=${c.chrome.footer.columns} legal=${c.chrome.footer.legal}></spyglass-site-footer></div>`
	}
}

define('use-case-page', UseCasePage)
