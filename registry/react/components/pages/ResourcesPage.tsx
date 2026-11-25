import { PageClose } from '@/react/components/site/PageClose'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageHead } from '@/react/components/site/PageHead'
import { ResourceCards } from '@/react/components/site/ResourceCards'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { resourcesContent, type ResourcesContent, resourcesSections, type ResourcesSection } from '@/lib/pages/resources'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'
import type { HeaderMenus } from '@/lib/site-header'

// The site's resources page (app/resources, pages/Resources/ResourceHub): the header, the page head with its drift,
// the hub's cards (templates, docs, case studies) and the rows of what is coming, the closing section and the footer.
// `content` replaces the copy (lib/pages/resources.ts); the covers' creatives are Acme placeholders until you pass
// your images as `src`.
export interface ResourcesPageProps {
  content?: ResourcesContent
  /** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
  menus?: HeaderMenus
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly ResourcesSection[]
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ResourcesPage({ content: c = resourcesContent, menus, sections, className }: ResourcesPageProps) {
  const parts: Record<ResourcesSection, ReactNode> = {
    head: <PageHead id={c.head.id} lines={c.head.lines} lead={c.head.lead} />,
    cards: (
      <section aria-label={c.head.lines.join(' ')}>
        <div className={CONTAINER}>
          <ResourceCards cards={c.cards} rows={c.rows} rowsLabel={c.rowsLabel} className="mb-(--ds-layout-section)" />
        </div>
      </section>
    ),
    close: <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />,
  }
  return (
    <div data-ds="resources-page" className={cn('isolate overflow-x-clip bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader menus={menus} links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        {pageSections(resourcesSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default ResourcesPage
