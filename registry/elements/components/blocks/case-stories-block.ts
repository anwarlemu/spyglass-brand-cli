import { html, nothing, svg } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/creative-card'
import { ASCII_TEXTURE } from '@/lib/textures'
import { caseStoriesContent, initials, storyCases, storyQuotes, type CaseStoriesContent, type StoryCase, type StoryQuote } from '@/lib/home/stories'
import styles from 'virtual:tw'

// CaseStoriesBlock.tsx as <spyglass-case-stories-block>: the head, each case as a wide picture with its panel (over the
// picture's corner from 1024, alternating sides), then the quotes in cards. `content`, `cases` and `quotes` as JSON;
// head="false" leaves the grid alone; quote-count caps the quote cards (3).

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/** @summary The home's case stories: wide pictures with their panels, then quotes in cards. */
export class CaseStoriesBlock extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="case-stories-block"]'))
	static properties = { content: { type: Object }, cases: { type: Array }, quotes: { type: Array }, head: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } }, quoteCount: { type: Number, attribute: 'quote-count' } }
	/** { headline, lead, read }. */
	content: CaseStoriesContent = caseStoriesContent
	/** The cases: { company, mark?, stat, statLabel, quote, name, role, photo?, href, picture? }. */
	cases: StoryCase[] = storyCases
	/** The quotes: { company, mark?, quote, name, role, photo? }. */
	quotes: StoryQuote[] = storyQuotes
	/** Show the headline and lead (head="false" to leave them out). */
	head = true
	/** How many quote cards at most, in whole rows of three (3 by default; quote-count). */
	quoteCount = 3

	private words(entry: StoryQuote & Partial<StoryCase>, read?: string) {
		return html`<figure class="ds-cs-figure"><p class="ds-cs-company">${entry.mark ? html`<span role="img" aria-label=${entry.company} class="ds-cs-mark" style=${`--src: url("${entry.mark.src}"); --h: ${entry.mark.h ?? 20}px; --ratio: ${entry.mark.ratio}`}></span>` : html`<span class="ds-cs-company-name">${entry.company}</span>`}</p><p class="ds-cs-stat">${entry.stat ? html`<span class="ds-cs-number">${entry.stat}</span><span class="ds-cs-stat-label">${entry.statLabel}</span>` : nothing}</p><blockquote class="ds-cs-quote"><p>${`“${entry.quote}”`}</p></blockquote><figcaption class="ds-cs-person">${entry.photo ? html`<img src=${entry.photo} alt="" width="40" height="40" class="ds-cs-avatar">` : html`<span class="ds-cs-avatar" aria-hidden="true">${initials(entry.name)}</span>`}<span class="ds-cs-who"><span class="ds-cs-name">${entry.name}</span><span class="ds-cs-role">${entry.role}</span></span></figcaption>${read ? html`<span class="ds-cs-read">${read}<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">${svg`<path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5"></path>`}</svg></span>` : nothing}</figure>`
	}

	render() {
		const c = this.content ?? caseStoriesContent
		const cases = this.cases ?? storyCases
		const quotes = this.quotes ?? storyQuotes
		const cap = Math.min(this.quoteCount, quotes.length)
		const shown = quotes.slice(0, Math.floor(cap / 3) * 3 || cap)
		return html`<section data-ds="case-stories-block" class="py-(--ds-layout-section) text-fg"><div class=${CONTAINER}>${this.head ? html`<header class="mb-16 flex flex-col items-center text-center lg:mb-20"><h2 class="type-section">${c.headline}</h2><p class="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${c.lead}</p></header>` : nothing}<ul role="list" class="ds-cs-stories">${cases.map((entry, i) => html`<li class="ds-cs-lead" data-side=${ifDefined(i % 2 ? 'right' : undefined)}><span class="ds-cs-picture"><spyglass-creative-card ratio="fill" src=${ifDefined(entry.picture?.src)} alt=${entry.picture?.alt ?? ''} fit=${ifDefined(entry.picture?.fit)} position=${ifDefined(entry.picture?.position)} tone=${entry.picture?.tone ?? 2}></spyglass-creative-card></span><a class="ds-cs-panel" href=${entry.href} aria-label=${`${c.read}: ${entry.company}`}><span class="ds-cs-panel-ascii" aria-hidden="true" style=${`background-image: url("${ASCII_TEXTURE}")`}></span>${this.words(entry, c.read)}</a></li>`)}${shown.map((entry) => html`<li class="ds-cs-cell"><div class="ds-cs-card">${this.words(entry)}</div></li>`)}</ul></div></section>`
	}
}

define('case-stories-block', CaseStoriesBlock)
