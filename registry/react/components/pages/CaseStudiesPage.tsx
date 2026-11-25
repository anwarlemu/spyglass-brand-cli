import { CaseStoriesBlock } from '@/react/components/blocks/CaseStoriesBlock'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { caseStudiesIndexContent, type CaseStudiesIndexContent, caseStudiesSections, type CaseStudiesSection } from '@/lib/pages/case-studies'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'

// The site's case studies index (app/resources/case-studies, pages/CaseStudies/CaseStudyIndex): the header, the page
// head, the home's case stories without their head (each case's picture and panel, then every quote in cards three
// across) right under it with 96px below, the closing section and the footer. `content` replaces the copy, the cases
// and the quotes (lib/pages/case-studies.ts; Acme placeholders).
export interface CaseStudiesPageProps {
  content?: CaseStudiesIndexContent
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly CaseStudiesSection[]
  className?: string
}


export function CaseStudiesPage({ content: c = caseStudiesIndexContent, sections, className }: CaseStudiesPageProps) {
  const parts: Record<CaseStudiesSection, ReactNode> = {
    head: <PageHead id={c.head.id} lines={c.head.lines} lead={c.head.lead} />,
    stories: (
      <div aria-label={c.head.lines.join(' ')} role="region" className="-mt-(--ds-layout-section) pb-[calc(96px-var(--ds-layout-section))]">
        <CaseStoriesBlock cases={c.cases} quotes={c.quotes} quoteCount={c.quotes.length} head={false} />
      </div>
    ),
    close: <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />,
  }
  return (
    <div data-ds="case-studies-page" className={cn('isolate overflow-x-clip bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        {pageSections(caseStudiesSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default CaseStudiesPage
