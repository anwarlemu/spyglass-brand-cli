import { type CSSProperties, Fragment, type ReactNode } from 'react'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { SideDrifts } from '@/react/components/visuals/SideDrifts'
import { comingSoonContent, type ComingSoonContent, comingSoonSections, type ComingSoonSection } from '@/lib/pages/coming-soon'
import { ASCII_TEXTURE_ALPHA } from '@/lib/plan-lights'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import type { HeaderMenus } from '@/lib/site-header'

// The site's coming soon page (app/products/coming-soon, pages/ComingSoon): the page head with a White and a quiet
// button, then the sources coming next as #262626 cards, 8px in (two side by side from 768; from 1024 two wide over
// three, the last of an odd row across): a Black cover with the source's mark in the faint gray over ASCII glyphs that
// clear in the middle (each card at its own spot of the tile), the name in Funnel Display 24/28, a line in #D4D4D4 and
// "Comes to" over the APIs it feeds as small #363636 chips; the side drifts from 1440. Then "Also on the list": small
// cards, four across from 768. The closing section and the footer. Marks come through `mark` (an image URL, tinted);
// without one a neutral rounded square stands in. Nothing moves; a chip's text turns White under the pointer.
export interface ComingSoonPageProps {
  content?: ComingSoonContent
  /** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
  menus?: HeaderMenus
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly ComingSoonSection[]
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const AT = ['0 0', 'var(--ds-coming-ascii-at-2)', 'var(--ds-coming-ascii-at-3)', 'var(--ds-coming-ascii-at-4)', 'var(--ds-coming-ascii-at-5)']

function Mark({ src, className }: { src?: string, className: string }) {
  return src
    ? <span aria-hidden="true" className={cn('block bg-current', className)} style={{ maskImage: `url("${src}")`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
    : <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" /></svg>
}

export function ComingSoonPage({ content: c = comingSoonContent, menus, sections, className }: ComingSoonPageProps) {
  const odd = c.next.length % 2 === 1
  const parts: Record<ComingSoonSection, ReactNode> = {
    head: <PageHead id="coming-soon" lines={c.head.lines} lead={c.head.lead} primary={c.head.primary} secondary={c.head.secondary} />,
    next: (
      <section aria-label={c.nextLabel} className="relative isolate pb-16 md:pb-20">
        <SideDrifts />
        <div className={WRAP}>
          <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 lg:grid-cols-6">
            {c.next.map((s, i) => {
              const last = odd && i === c.next.length - 1
              return (
                <li key={s.name} className={cn('flex flex-col rounded-panel bg-surface-raised p-2', i < 2 ? 'lg:col-span-3' : 'lg:col-span-2', last && 'md:max-lg:col-span-full')}>
                  <div className={cn('ds-coming-cover relative isolate grid h-32 place-items-center overflow-hidden rounded-ds-sm bg-surface md:h-40', i < 2 && 'lg:h-60')} style={{ '--at': AT[i % AT.length] } as CSSProperties}>
                    <Mark src={s.mark} className="size-12 text-fg-faint" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="m-0 type-heading-3">{s.name}</h2>
                    <p className="m-0 max-w-(--ds-layout-measure) type-body text-pretty text-fg-soft">{s.line}</p>
                    {s.apis.length ? (
                      <div className="mt-auto flex flex-col items-start gap-2 pt-4">
                        <span className="type-ui text-fg-muted">{c.feedsLabel}</span>
                        <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
                          {s.apis.map((a) => <li key={a.href}><a href={a.href} className="block rounded-ds-sm bg-surface-inset px-2 py-1 type-ui text-fg-soft transition-[color] duration-160 ease-out hover:text-fg focus-visible:outline-offset-2">{a.name}</a></li>)}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    ),
    also: (
      <section aria-labelledby="also-heading" className="pb-(--ds-layout-section)">
        <div className={WRAP}>
          <h2 id="also-heading" className="m-0 mb-6 type-heading-4 md:type-heading-3">{c.also.title}</h2>
          <ul role="list" className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
            {c.also.sources.map((s) => (
              <li key={s.name} className="flex min-w-0 items-center gap-3 rounded-panel bg-surface-raised p-4">
                <Mark src={s.mark} className="size-6 flex-none text-fg-faint" />
                <span className="flex min-w-0 flex-col">
                  <span className="type-body">{s.name}</span>
                  <span className="type-ui text-fg-muted">{c.also.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
    close: <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />,
  }
  return (
    <div data-ds="coming-soon-page" className={cn('isolate bg-surface text-fg', className)} style={{ '--ascii-alpha': `url("${ASCII_TEXTURE_ALPHA}")` } as CSSProperties}>
      <style href="ds-coming-soon-page" precedence="ds">{css}</style>
      <AsciiTrail mode="page" />
      <SiteHeader menus={menus} links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main id="main">
        {pageSections(comingSoonSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default ComingSoonPage

// A cover's glyphs: White through the ASCII tile's alpha at the card's spot, at the texture's quiet strength, with the
// page's Black clearing the middle around the mark.
const css = `
.ds-coming-cover::before, .ds-coming-cover::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.ds-coming-cover::before {
  background: var(--ds-color-white); opacity: var(--ds-feature-ascii-opacity); mix-blend-mode: screen;
  mask-image: var(--ascii-alpha); mask-position: var(--at, 0 0); mask-size: var(--ds-feature-ascii-tile) var(--ds-feature-ascii-tile); mask-repeat: repeat;
}
.ds-coming-cover::after { background: radial-gradient(ellipse var(--ds-feature-ascii-clear-w) var(--ds-feature-ascii-clear-h) at 50% 50%, var(--ds-color-surface) 40%, transparent 100%); }
`
