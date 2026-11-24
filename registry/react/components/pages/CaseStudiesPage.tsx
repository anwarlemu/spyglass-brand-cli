import { CaseStoriesBlock } from '@/react/components/blocks/CaseStoriesBlock'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { caseStudiesIndexContent, type CaseStudiesIndexContent } from '@/lib/pages/case-studies'
import { cn } from '@/react/lib/cn'

// The site's case studies index (app/resources/case-studies, pages/CaseStudies/CaseStudyIndex): the header, the page
// head, the home's case stories without their head (each case's picture and panel, then every quote in cards three
// across) right under it with 96px below, the closing section and the footer. `content` replaces the copy, the cases
// and the quotes (lib/pages/case-studies.ts; Acme placeholders).
export interface CaseStudiesPageProps {
  content?: CaseStudiesIndexContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function CaseStudiesPage({ content: c = caseStudiesIndexContent, className }: CaseStudiesPageProps) {
  return (
    <div data-ds="case-studies-page" className={cn('overflow-x-clip bg-surface text-fg', className)}>
      <div className={CONTAINER}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <PageHead id={c.head.id} lines={c.head.lines} lead={c.head.lead} />
        <div aria-label={c.head.lines.join(' ')} role="region" className="-mt-(--ds-layout-section) pb-[calc(96px-var(--ds-layout-section))]">
          <CaseStoriesBlock cases={c.cases} quotes={c.quotes} head={false} />
        </div>
        <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default CaseStudiesPage
