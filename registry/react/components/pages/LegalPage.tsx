import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { legalContent, legalPrivacyContent, type LegalContent, legalSections, type LegalSection } from '@/lib/pages/legal'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'
import type { HeaderMenus } from '@/lib/site-header'

// The site's legal pages (app/terms, app/privacy): the header, the page head (the title, the lead and the ASCII drift
// in the right columns), then the text in the head's columns: the sections in the left seven at the 640px measure (a
// subhead, 20/24 and 24/28 from 768, over 16/24 paragraphs in White, 40px between sections) and, from 768, the list of
// them in the right five, staying in view as the text scrolls (above the text on phones). The section padding under it,
// then the footer. The text is a placeholder for what your counsel approves: `content` replaces it (lib/pages/legal.ts;
// `page="privacy"` takes the privacy policy's). `preparing` shows only the head, its lead saying the text is on its way,
// as the site does until the text is ready.
export interface LegalPageProps {
  /** Which page's copy to show when there is no `content`: terms or privacy. */
  page?: 'terms' | 'privacy'
  content?: LegalContent
  /** Only the page head, its lead saying the text is being prepared (the site's pages until the text is ready). */
  preparing?: boolean
  /** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
  menus?: HeaderMenus
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly LegalSection[]
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function LegalPage({ page = 'terms', content, preparing = false, menus, sections, className }: LegalPageProps) {
  const c = content ?? (page === 'privacy' ? legalPrivacyContent : legalContent)
  const parts: Record<LegalSection, ReactNode> = {
    head: <PageHead id={c.id} lines={[c.title]} lead={preparing ? c.preparing : c.lead} />,
    body: (
      preparing ? null : <div className={cn(CONTAINER, 'grid grid-cols-[minmax(0,1fr)] gap-12 pb-(--ds-layout-section) md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16')}>
        <nav aria-label={c.contents} className="self-start md:sticky md:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))] md:order-last">
          <p className="mb-4 type-label text-fg-muted">{c.contents}</p>
          <ul role="list" className="grid gap-2">
            {c.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="rounded-ds-sm type-ui text-fg-soft transition-[color] duration-160 ease-out hover:text-fg">{s.title}</a></li>)}
          </ul>
        </nav>
        <div className="grid max-w-measure gap-10">
          <p className="type-ui text-fg-muted">{c.updated}</p>
          {c.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="grid scroll-mt-[calc(var(--ds-size-header)+var(--ds-space-2xl))] gap-4">
              <h2 id={`${s.id}-title`} className="type-heading-4 text-balance md:type-heading-3">{s.title}</h2>
              {s.body.map((p) => <p key={p} className="type-body text-pretty text-fg">{p}</p>)}
            </section>
          ))}
        </div>
      </div>
    ),
  }
  return (
    <div data-ds="legal-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader menus={menus} links={c.shell.header.nav} secondary={c.shell.header.secondary} cta={c.shell.header.cta} />
      <main id="main">
        {pageSections(legalSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.shell.footer.columns} legal={c.shell.footer.legal} />
    </div>
  )
}

export default LegalPage
