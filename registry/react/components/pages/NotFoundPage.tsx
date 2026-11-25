import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { notFoundContent, type NotFoundContent, notFoundSections, type NotFoundSection } from '@/lib/pages/not-found'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'

// The site's 404 page (app/not-found.tsx): the header, the page head with its title, the plain sentence, the White way
// home and the quiet way to the docs, the ASCII drift in the right columns, and the footer. As the last section on the
// page the head keeps the site's section padding under it (56px, 76 at 768, 84 at 1024), so it sits in a box that
// takes back what the page head keeps below. `content` replaces the copy (lib/pages/not-found.ts).
export interface NotFoundPageProps {
  content?: NotFoundContent
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly NotFoundSection[]
  className?: string
}

export function NotFoundPage({ content: c = notFoundContent, sections, className }: NotFoundPageProps) {
  const parts: Record<NotFoundSection, ReactNode> = {
    head: (
      <div className="-mb-6 md:-mb-5 lg:-mb-3">
        <PageHead id="not-found" lines={c.lines} lead={c.lead} primary={c.primary} secondary={c.secondary} />
      </div>
    ),
  }
  return (
    <div data-ds="not-found-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.shell.header.nav} secondary={c.shell.header.secondary} />
      <main id="main">
        {pageSections(notFoundSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.shell.footer.columns} legal={c.shell.footer.legal} />
    </div>
  )
}

export default NotFoundPage
