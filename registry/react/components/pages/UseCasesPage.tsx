import { SiteHeader } from '@/react/components/site/SiteHeader'
import { PageHead } from '@/react/components/site/PageHead'
import { ResourceCards } from '@/react/components/site/ResourceCards'
import { PageClose } from '@/react/components/site/PageClose'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { useCasesContent, type UseCasesContent } from '@/lib/pages/use-cases'
import { cn } from '@/react/lib/cn'

// The site's use-cases hub (app/use-cases, pages/UseCasesPage/UseCaseHub): the header, the page head (the title, the
// lead and the ASCII drift in the right columns), the use cases as linked cards (three across from 1024, two from 768,
// each with three creatives on its Black cover, Acme placeholders until you pass `src`), the section padding under
// them, the closing section with the connect menu, then the footer. `content` replaces the copy (lib/pages/use-cases.ts).
export interface UseCasesPageProps {
  content?: UseCasesContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function UseCasesPage({ content: c = useCasesContent, className }: UseCasesPageProps) {
  return (
    <div data-ds="use-cases-page" className={cn('bg-surface text-fg', className)}>
      <div className={cn(CONTAINER, 'relative z-10')}>
        <SiteHeader links={c.chrome.header.nav} secondary={c.chrome.header.secondary} cta={c.chrome.header.cta} />
      </div>
      <main id="main">
        <PageHead id={c.id} lines={c.head.lines} lead={c.head.lead} />
        <section aria-label={c.head.lines.join(' ')}>
          <div className={cn(CONTAINER, 'pb-(--ds-layout-section)')}>
            <ResourceCards cards={c.cards} columns={3} />
          </div>
        </section>
        <PageClose />
      </main>
      <SiteFooter columns={c.chrome.footer.columns} legal={c.chrome.footer.legal} />
    </div>
  )
}

export default UseCasesPage
