import type { CSSProperties } from 'react'
import { storiesContent, storiesCss, storyInitials, type Story, type StoryCustomer, type StoryMark } from '@/lib/stories'
import { cn } from '@/react/lib/cn'

// The site's stories section (v3/V3Stories): the section head centered over cards of quotes, #262626 with 8px corners.
// Each card has the company (its mark in the soft gray, or its name), the quote in Funnel Display 20/24 and the person
// at the foot (a 40px avatar ringed by the strong hairline, the name, the role in capitals). One column up to 640px wide
// on phones; from 1024 three columns whose cards line up row by row; two cards sit in the middle. Under them, with
// `customers`, a row of customer marks over a hairline. Quotes come through `stories`: Acme placeholders by default,
// never a real person or customer without their consent.
export interface StoriesBlockProps {
  /** The section's id (its heading is `<id>-heading`). */
  id?: string
  headline?: string
  lead?: string
  /** The stories, in order: { company, logo?, quote, name, role, photo? }. */
  stories?: Story[]
  /** Show the row of customer marks under the stories. */
  customers?: boolean
  /** The customer marks: { name, src?, ratio?, height? }. */
  logos?: StoryCustomer[]
  /** The customer row's name for assistive tech. */
  customersLabel?: string
  className?: string
}

function Mark({ logo, label, className, at = 'left center' }: { logo: StoryMark; label: string; className: string; at?: string }) {
  return <span role="img" aria-label={label} className={className} style={{ height: logo.height, aspectRatio: String(logo.ratio), mask: `url("${logo.src}") ${at} / contain no-repeat` } as CSSProperties} />
}

export function StoriesBlock({ id = 'stories', headline = storiesContent.headline, lead = storiesContent.lead, stories = storiesContent.stories, customers = true, logos = storiesContent.customers, customersLabel = storiesContent.customersLabel, className }: StoriesBlockProps) {
  return (
    <section data-ds="stories-block" id={id} aria-labelledby={`${id}-heading`} className={cn('py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-stories-block" precedence="ds">{storiesCss}</style>
      <div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">
        <header className="mb-16 flex flex-col items-center text-center lg:mb-20">
          <h2 id={`${id}-heading`} className="type-section [text-box:trim-start_cap_alphabetic]">{headline}</h2>
          <p className="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">{lead}</p>
        </header>
        <ul role="list" className="ds-stories mx-auto grid max-w-measure grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-6">
          {stories.map((story) => (
            <li key={`${story.company}-${story.name}`} className="min-w-0 rounded-panel bg-surface-raised p-6 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-0 lg:p-8">
              <figure className="flex h-full flex-col lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-0">
                <p className="flex min-h-8 items-center">
                  {story.logo
                    ? <Mark logo={story.logo} label={story.company} className="block bg-fg-soft" />
                    : <span className="type-body font-medium text-fg-soft">{story.company}</span>}
                </p>
                <blockquote className="mt-8 type-heading-4 text-pretty text-fg lg:self-start">
                  <p>&ldquo;{story.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-8">
                  <span className={cn('relative grid size-10 flex-none place-items-center overflow-hidden rounded-full border border-edge-strong type-ui font-medium text-fg-soft', story.photo ? 'bg-edge-strong' : 'bg-surface-inset')}>
                    <span aria-hidden="true">{storyInitials(story.name)}</span>
                    {story.photo ? <img src={story.photo} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full rounded-full object-cover" /> : null}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="type-ui font-medium text-fg">{story.name}</span>
                    <span className="mt-1 type-label text-fg-muted">{story.role}, {story.company}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        {customers && logos.length ? (
          <ul role="list" aria-label={customersLabel} className="mx-auto mt-16 grid max-w-measure grid-cols-2 items-center justify-items-center gap-x-4 gap-y-8 border-t border-edge pt-12 md:grid-cols-3 lg:mt-20 lg:flex lg:max-w-none lg:flex-wrap lg:justify-between lg:px-12">
            {logos.map((logo) => (
              <li key={logo.name}>
                {logo.src
                  ? <Mark logo={{ src: logo.src, ratio: logo.ratio ?? 4, height: logo.height ?? 24 }} label={logo.name} className="block bg-fg-muted" at="center" />
                  : <span className="type-heading-4 whitespace-nowrap text-fg-muted">{logo.name}</span>}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

export default StoriesBlock
