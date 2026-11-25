import { PageClose } from '@/react/components/site/PageClose'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageHead } from '@/react/components/site/PageHead'
import { ResourceCards } from '@/react/components/site/ResourceCards'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { resourcesContent, type ResourcesContent } from '@/lib/pages/resources'
import { cn } from '@/react/lib/cn'

// The site's resources page (app/resources, pages/Resources/ResourceHub): the header, the page head with its drift,
// the hub's cards (templates, docs, case studies) and the rows of what is coming, the closing section and the footer.
// `content` replaces the copy (lib/pages/resources.ts); the covers' creatives are Acme placeholders until you pass
// your images as `src`.
export interface ResourcesPageProps {
  content?: ResourcesContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ResourcesPage({ content: c = resourcesContent, className }: ResourcesPageProps) {
  return (
    <div data-ds="resources-page" className={cn('isolate overflow-x-clip bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        <PageHead id={c.head.id} lines={c.head.lines} lead={c.head.lead} />
        <section aria-label={c.head.lines.join(' ')}>
          <div className={CONTAINER}>
            <ResourceCards cards={c.cards} rows={c.rows} rowsLabel={c.rowsLabel} className="mb-(--ds-layout-section)" />
          </div>
        </section>
        <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default ResourcesPage
