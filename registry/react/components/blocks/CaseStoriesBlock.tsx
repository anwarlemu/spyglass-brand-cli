import type { CSSProperties } from 'react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { ASCII_TEXTURE } from '@/lib/textures'
import { caseStoriesContent, initials, storyCases, storyQuotes, type CaseStoriesContent, type StoryCase, type StoryQuote } from '@/lib/home/stories'
import { cn } from '@/react/lib/cn'

// The home's case stories (site v3/V3CaseStories): a centered head, then each case as a wide picture with its panel
// (the company, the headline figure, the quote, the person and "Read the case study"; from 1024 the panel floats over
// the picture's lower corner, alternating sides, the ASCII texture fading in from its top right), then the quotes in
// cards, three across from 1024 with their rows aligned. Under a mouse a case's panel lightens and its link turns
// White (color only; the arrow stays). Acme placeholders by default: pass your customers through `cases` and
// `quotes` (marks are drawn in the soft gray, photos at 40px, initials without one). `head={false}` leaves the grid.
export interface CaseStoriesBlockProps {
  content?: CaseStoriesContent
  cases?: StoryCase[]
  quotes?: StoryQuote[]
  /** Show the headline and lead. */
  head?: boolean
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

function Words({ entry, read }: { entry: StoryQuote & Partial<StoryCase>; read?: string }) {
  return (
    <figure className="ds-cs-figure">
      <p className="ds-cs-company">
        {entry.mark
          ? <span role="img" aria-label={entry.company} className="ds-cs-mark" style={{ '--src': `url("${entry.mark.src}")`, '--h': `${entry.mark.h ?? 20}px`, '--ratio': entry.mark.ratio } as CSSProperties} />
          : <span className="ds-cs-company-name">{entry.company}</span>}
      </p>
      <p className="ds-cs-stat">
        {entry.stat ? <><span className="ds-cs-number">{entry.stat}</span><span className="ds-cs-stat-label">{entry.statLabel}</span></> : null}
      </p>
      <blockquote className="ds-cs-quote"><p>{`“${entry.quote}”`}</p></blockquote>
      <figcaption className="ds-cs-person">
        {entry.photo ? <img src={entry.photo} alt="" width={40} height={40} className="ds-cs-avatar" /> : <span className="ds-cs-avatar" aria-hidden="true">{initials(entry.name)}</span>}
        <span className="ds-cs-who"><span className="ds-cs-name">{entry.name}</span><span className="ds-cs-role">{entry.role}</span></span>
      </figcaption>
      {read ? (
        <span className="ds-cs-read">
          {read}
          <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" focusable="false"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
      ) : null}
    </figure>
  )
}

export function CaseStoriesBlock({ content: c = caseStoriesContent, cases = storyCases, quotes = storyQuotes, head = true, className }: CaseStoriesBlockProps) {
  const shown = quotes.slice(0, Math.floor(quotes.length / 3) * 3 || quotes.length)
  return (
    <section data-ds="case-stories-block" className={cn('py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-case-stories-block" precedence="ds">{css}</style>
      <div className={CONTAINER}>
        {head ? (
          <header className="mb-16 flex flex-col items-center text-center lg:mb-20">
            <h2 className="type-section">{c.headline}</h2>
            <p className="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{c.lead}</p>
          </header>
        ) : null}
        <ul role="list" className="ds-cs-stories">
          {cases.map((entry, i) => (
            <li key={entry.href} className="ds-cs-lead" data-side={i % 2 ? 'right' : undefined}>
              <span className="ds-cs-picture"><CreativeCard ratio="fill" src={entry.picture?.src} tone={entry.picture?.tone ?? 2} /></span>
              <a className="ds-cs-panel" href={entry.href} aria-label={`${c.read}: ${entry.company}`}>
                <span className="ds-cs-panel-ascii" aria-hidden="true" style={{ backgroundImage: `url("${ASCII_TEXTURE}")` }} />
                <Words entry={entry} read={c.read} />
              </a>
            </li>
          ))}
          {shown.map((entry) => (
            <li key={entry.name} className="ds-cs-cell">
              <div className="ds-cs-card"><Words entry={entry} /></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default CaseStoriesBlock

const css = `
.ds-cs-stories { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; max-width: var(--ds-layout-measure); margin-inline: auto; }
.ds-cs-lead { position: relative; display: grid; min-width: 0; overflow: clip; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); }
.ds-cs-picture { position: relative; display: block; aspect-ratio: 4 / 3; background: var(--ds-color-surface-raised); }
.ds-cs-panel { display: block; padding: 24px; color: inherit; transition: background-color var(--ds-duration-enter) var(--ds-easing-out); }
.ds-cs-panel:focus-visible { outline-offset: calc(var(--ds-border-focus) * -1); background: var(--ds-color-surface-hover); }
.ds-cs-cell { display: grid; min-width: 0; }
.ds-cs-card { display: block; min-width: 0; padding: 24px; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); color: inherit; }
.ds-cs-company-name { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg-soft); }
.ds-cs-read { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg-soft); transition: color var(--ds-duration-enter) var(--ds-easing-out); }
@media (hover: hover) and (pointer: fine) {
  .ds-cs-panel:hover { background: var(--ds-color-surface-hover); }
  .ds-cs-panel:hover .ds-cs-read { color: var(--ds-color-fg); }
}
.ds-cs-panel:focus-visible .ds-cs-read { color: var(--ds-color-fg); }
.ds-cs-panel-ascii { display: none; }
@media (prefers-reduced-motion: reduce) { .ds-cs-panel, .ds-cs-read { transition: none; } }
.ds-cs-figure { display: flex; flex-direction: column; height: 100%; }
.ds-cs-company { display: flex; align-items: center; min-height: 32px; }
.ds-cs-mark { display: block; height: var(--h); aspect-ratio: var(--ratio); background-color: var(--ds-color-fg-soft); mask: var(--src) left center / contain no-repeat; }
.ds-cs-stat { display: flex; flex-direction: column; gap: 8px; margin-top: 32px; }
.ds-cs-number { font-family: var(--ds-font-heading); font-size: var(--ds-text-figure); line-height: var(--ds-text-figure-leading); font-weight: var(--ds-font-weight-regular); font-variant-numeric: tabular-nums; color: var(--ds-color-fg); }
.ds-cs-stat-label { font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); color: var(--ds-color-fg-soft); text-wrap: pretty; }
.ds-cs-quote { margin-top: 32px; font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-4); line-height: var(--ds-text-heading-4-leading); font-weight: var(--ds-font-weight-regular); color: var(--ds-color-fg); text-wrap: pretty; }
.ds-cs-person { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 32px; }
.ds-cs-avatar { display: grid; flex: none; place-items: center; width: 40px; height: 40px; border-radius: var(--ds-radius-full); background: var(--ds-color-surface-inset); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg-soft); object-fit: cover; }
.ds-cs-who { display: flex; flex-direction: column; min-width: 0; }
.ds-cs-name { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg); }
.ds-cs-role { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg-muted); }
@media (min-width: 1024px) {
  .ds-cs-stories { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; max-width: none; }
  .ds-cs-lead { grid-column: 1 / -1; display: block; min-height: var(--ds-stories-lead-min-h); }
  .ds-cs-picture { position: absolute; inset: 0; aspect-ratio: auto; }
  .ds-cs-panel { position: absolute; left: 24px; bottom: 24px; width: min(var(--ds-stories-panel-w), calc(100% - 48px)); isolation: isolate; overflow: clip; padding: 32px; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); }
  .ds-cs-lead[data-side="right"] .ds-cs-panel { right: 24px; left: auto; }
  .ds-cs-panel-ascii { position: absolute; inset: 0; z-index: -1; display: block; pointer-events: none; background-position: 0 0; background-size: var(--ds-ascii-tile) var(--ds-ascii-tile); opacity: var(--ds-ascii-quiet); mix-blend-mode: screen; mask-image: radial-gradient(ellipse 56% 52% at 100% 0%, var(--ds-color-black) 30%, transparent 100%); }
  .ds-cs-panel .ds-cs-quote { font-size: var(--ds-text-heading-3); line-height: var(--ds-text-heading-3-leading); }
  .ds-cs-panel .ds-cs-avatar { background: var(--ds-color-surface-hover); }
  .ds-cs-cell, .ds-cs-card { display: grid; grid-row: span 5; grid-template-rows: subgrid; row-gap: 0; }
  .ds-cs-card { padding: 32px; }
  .ds-cs-card .ds-cs-figure { display: grid; grid-row: span 5; grid-template-rows: subgrid; row-gap: 0; }
  .ds-cs-card .ds-cs-quote { align-self: start; }
}
`
