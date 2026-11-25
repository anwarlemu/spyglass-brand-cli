import { Button } from '@/react/components/ui/Button'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { formatResourceDate, resourceListContent, type ResourceList, type ResourceListContent } from '@/lib/pages/resources'
import { cn } from '@/react/lib/cn'

// The site's list of posts or guides (app/resources/[slug], pages/Resources/ResourceList): the header, the page head
// with the list's title and line, then the entries newest first as hairline rows (the date in the muted gray, the
// title at 20/28 and its line in the soft gray; the date in a 160px column from 768; an entry with a `thumb` puts
// its 16:9 picture in a 96px column, 160 from 768, with the three lines stacked beside it), or, with no entries yet, a
// #1A1A1A panel with the empty note and a quiet way back. The closing section and the footer follow. `list` sets
// the list (lib/pages/resources.ts has the blog, empty, and articles); `content` the rest of the copy.
export interface ResourceListPageProps {
  list?: ResourceList
  content?: ResourceListContent
  className?: string
}

/** A row's grid: date, title and line stacked; with a thumbnail, the picture in a 96px column (160 from 768) beside them. */
const resourceRowClass = (thumb: boolean) =>
	thumb
		? 'group grid grid-cols-[--spacing(24)_minmax(0,1fr)] items-start gap-x-5 gap-y-1 border-b border-edge py-6 focus-visible:-outline-offset-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8'
		: 'group grid gap-1 border-b border-edge py-6 focus-visible:-outline-offset-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-x-8'
/** The thumbnail's cell: the first column, across the three lines. */
const RESOURCE_THUMB = 'col-start-1 row-span-3 row-start-1'

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ResourceListPage({ list, content: c = resourceListContent, className }: ResourceListPageProps) {
  const l = list ?? c.list
  const entries = [...l.entries].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div data-ds="resource-list-page" className={cn('isolate overflow-x-clip bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        <PageHead id={l.key} lines={[l.title]} lead={l.line} />
        <section aria-label={l.title} className="pb-(--ds-layout-section)">
          <div className={CONTAINER}>
            {entries.length ? (
              <ul role="list" className="m-0 list-none border-t border-edge p-0">
                {entries.map((e) => (
                  <li key={e.href}>
                    <a href={e.href} className={resourceRowClass(!!e.thumb)}>
                      {e.thumb ? <CreativeCard ratio="16/9" src={e.thumb.src} alt={e.thumb.alt} tone={e.thumb.tone} className={RESOURCE_THUMB} /> : null}
                      <time dateTime={e.date} className={cn('type-ui text-fg-muted', e.thumb && 'col-start-2')}>{formatResourceDate(e.date)}</time>
                      <span className={cn('type-body-lg text-fg', e.thumb && 'col-start-2')}>{e.title}</span>
                      <span className={cn('type-body text-pretty text-fg-soft md:col-start-2', e.thumb && 'col-start-2')}>{e.line}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center gap-6 rounded-panel bg-surface-subtle p-8 text-center text-fg-soft">
                <p className="type-body-lg">{l.empty}</p>
                <Button href={c.back.href} variant="secondary" className="max-md:w-full">{c.back.label}</Button>
              </div>
            )}
          </div>
        </section>
        <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default ResourceListPage
