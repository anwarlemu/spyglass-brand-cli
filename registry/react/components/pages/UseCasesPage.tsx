import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageHead } from '@/react/components/site/PageHead'
import { ResourceCards } from '@/react/components/site/ResourceCards'
import { PageClose } from '@/react/components/site/PageClose'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { useCasesContent, type UseCasesContent, useCasesSections, type UseCasesSection } from '@/lib/pages/use-cases'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'

// The site's use-cases hub (app/use-cases, pages/UseCasesPage/UseCaseHub): the header, the page head (the title, the
// lead and the ASCII drift in the right columns), the use cases as linked cards (three across from 1024, two from 768,
// each with three creatives on its Black cover, Acme placeholders until you pass `src`), the section padding under
// them, the closing section with the connect menu, then the footer. `content` replaces the copy (lib/pages/use-cases.ts).
export interface UseCasesPageProps {
  content?: UseCasesContent
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly UseCasesSection[]
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function UseCasesPage({ content: c = useCasesContent, sections, className }: UseCasesPageProps) {
  const parts: Record<UseCasesSection, ReactNode> = {
    head: <PageHead id={c.id} lines={c.head.lines} lead={c.head.lead} />,
    cards: (
      <section aria-label={c.head.lines.join(' ')}>
        <div className={cn(CONTAINER, 'pb-(--ds-layout-section)')}>
          <ResourceCards cards={c.cards} columns={3} />
        </div>
      </section>
    ),
    close: <PageClose />,
  }
  return (
    <div data-ds="use-cases-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.chrome.header.nav} secondary={c.chrome.header.secondary} cta={c.chrome.header.cta} />
      <main id="main">
        {pageSections(useCasesSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.chrome.footer.columns} legal={c.chrome.footer.legal} />
    </div>
  )
}

export default UseCasesPage
