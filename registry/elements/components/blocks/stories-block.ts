import { html, unsafeCSS } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { storiesContent, storiesCss, storyInitials, type Story, type StoryCustomer, type StoryMark } from '@/lib/stories'
import styles from 'virtual:tw'

// StoriesBlock.tsx as <spyglass-stories-block>: the section head centered over cards of quotes (company, quote, person),
// three columns from 1024 that line up row by row, two cards in the middle, and with `customers` a row of marks over a
// hairline. `stories` and `logos` as JSON; `section-id` names the section (React's `id`); `customers="false"` hides the row.

const mark = (logo: StoryMark, label: string, className: string, at = 'left center') => html`<span role="img" aria-label=${label} class=${className} style=${`height: ${logo.height}px; aspect-ratio: ${logo.ratio}; mask: url("${logo.src}") ${at} / contain no-repeat`}></span>`

/** @summary The stories section: quotes in cards, with an optional row of customer marks. */
export class StoriesBlock extends DsElement {
	static styles = [DsElement.styles, styles, unsafeCSS(storiesCss)]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="stories-block"]'))
	static properties = { sectionId: { attribute: 'section-id' }, headline: {}, lead: {}, stories: { type: Array }, customers: { type: Boolean, converter: { fromAttribute: (v: string | null) => v !== 'false' } }, logos: { type: Array }, customersLabel: { attribute: 'customers-label' } }
	/** The section's id (React's `id`); its heading is `<id>-heading`. */
	sectionId = 'stories'
	headline = storiesContent.headline
	lead = storiesContent.lead
	/** The stories: { company, logo?, quote, name, role, photo? }. */
	stories: Story[] = storiesContent.stories
	/** Show the row of customer marks ("false" hides it). */
	customers = true
	/** The customer marks: { name, src?, ratio?, height? }. */
	logos: StoryCustomer[] = storiesContent.customers
	/** The customer row's name for assistive tech. */
	customersLabel = storiesContent.customersLabel

	render() {
		const id = this.sectionId
		const stories = this.stories ?? storiesContent.stories
		const logos = this.logos ?? storiesContent.customers
		return html`<section data-ds="stories-block" id=${id} aria-labelledby=${`${id}-heading`} class="py-(--ds-layout-section) text-fg"><div class="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)"><header class="mb-16 flex flex-col items-center text-center lg:mb-20"><h2 id=${`${id}-heading`} class="type-section [text-box:trim-start_cap_alphabetic]">${this.headline}</h2><p class="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">${this.lead}</p></header><ul role="list" class="ds-stories mx-auto grid max-w-measure grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-6">${stories.map((story) => html`<li class="min-w-0 rounded-panel bg-surface-raised p-6 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-0 lg:p-8"><figure class="flex h-full flex-col lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-0"><p class="flex min-h-8 items-center">${story.logo ? mark(story.logo, story.company, 'block bg-fg-soft') : html`<span class="type-body font-medium text-fg-soft">${story.company}</span>`}</p><blockquote class="mt-8 type-heading-4 text-pretty text-fg lg:self-start"><p>&ldquo;${story.quote}&rdquo;</p></blockquote><figcaption class="mt-auto flex items-center gap-3 pt-8"><span class=${`relative grid size-10 flex-none place-items-center overflow-hidden rounded-full border border-edge-strong type-ui font-medium text-fg-soft ${story.photo ? 'bg-edge-strong' : 'bg-surface-inset'}`}><span aria-hidden="true">${storyInitials(story.name)}</span>${story.photo ? html`<img src=${story.photo} alt="" loading="lazy" decoding="async" class="absolute inset-0 size-full rounded-full object-cover">` : ''}</span><span class="flex min-w-0 flex-col"><span class="type-ui font-medium text-fg">${story.name}</span><span class="mt-1 type-label text-fg-muted">${story.role}, ${story.company}</span></span></figcaption></figure></li>`)}</ul>${this.customers && logos.length ? html`<ul role="list" aria-label=${this.customersLabel} class="mx-auto mt-16 grid max-w-measure grid-cols-2 items-center justify-items-center gap-x-4 gap-y-8 border-t border-edge pt-12 md:grid-cols-3 lg:mt-20 lg:flex lg:max-w-none lg:flex-wrap lg:justify-between lg:px-12">${logos.map((logo) => html`<li>${logo.src ? mark({ src: logo.src, ratio: logo.ratio ?? 4, height: logo.height ?? 24 }, logo.name, 'block bg-fg-muted', 'center') : html`<span class="type-heading-4 whitespace-nowrap text-fg-muted">${logo.name}</span>`}</li>`)}</ul>` : ''}</div></section>`
	}
}

define('stories-block', StoriesBlock)
