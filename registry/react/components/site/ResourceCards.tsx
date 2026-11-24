import { Badge } from '@/react/components/ui/Badge'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { codeTokens, isExternal, type ResourceCard, type ResourceCover, type ResourceRow } from '@/lib/resource-cards'
import { cn } from '@/react/lib/cn'

export type { ResourceCard, ResourceCover, ResourceCreative, ResourceRow } from '@/lib/resource-cards'

// The site's resource hub (pages/Resources/ResourceHub, Resources.module.css; UseCaseHub reuses it): cards on the
// #262626 surface, 8px in with the 8px corner, each a link with a Black cover (240px tall, 320 from 1024 with two
// columns; 24px in, the 4px corner) holding a row of creatives (4:5, 12px apart, up to 120px wide) or a few lines of
// code, then the title (Funnel Display 24/28), the line in the soft gray and the meta at the foot in the muted gray.
// One column on phones, two from 768; `columns={3}` sets the use-cases hub: three from 1024, the cover 240px at every
// width and its creatives 80px (64 at 1024, 80 at 1280, 96 at 1440). Under the cards, `rows` lists what is not ready:
// hairline rows with the name, the line in the faint gray and a badge, the line in its own column from 1024. A card's
// surface turns #363636 under a mouse and a row's name turns White (160ms, ease-out); nothing moves.
export interface ResourceCardsProps {
  cards: ResourceCard[]
  /** Rows under the cards (resources that are not ready). */
  rows?: ResourceRow[]
  /** The rows' list name. */
  rowsLabel?: string
  /** 2 (resources) or 3 (use cases, from 1024). */
  columns?: 2 | 3
  className?: string
}

function Cover({ cover, columns }: { cover: ResourceCover; columns: 2 | 3 }) {
  if (cover.kind === 'code') {
    return (
      <span className="max-w-full overflow-hidden">
        <pre className="m-0 w-max type-code text-fg"><code>{codeTokens(cover.source, cover.language).map((t, i) => (t.dim ? <span key={i} className="text-fg-muted">{t.text}</span> : t.text))}</code></pre>
      </span>
    )
  }
  return (
    <span className="flex w-full justify-center gap-3">
      {cover.items.map((c, i) => (
        <span key={i} className={cn('block aspect-4/5 min-w-0', columns === 3 ? 'shrink-0 basis-20 lg:basis-16 xl:basis-20 min-[1440px]:basis-24' : 'shrink grow-0 basis-30')}>
          <CreativeCard ratio="fill" src={c.src} alt={c.alt} brand={c.brand} caption={c.caption} tone={c.tone} />
        </span>
      ))}
    </span>
  )
}

export function ResourceCards({ cards, rows = [], rowsLabel = 'More resources', columns = 2, className }: ResourceCardsProps) {
  return (
    <div data-ds="resource-cards" className={cn('flex flex-col gap-12 text-fg', className)}>
      <ul role="list" className={cn('m-0 grid list-none grid-cols-[minmax(0,1fr)] gap-4 p-0 md:grid-cols-2', columns === 3 && 'lg:grid-cols-3')}>
        {cards.map((card) => (
          <li key={card.href}>
            <a href={card.href} target={isExternal(card.href) ? '_blank' : undefined} rel={isExternal(card.href) ? 'noreferrer' : undefined} className="flex h-full flex-col rounded-panel bg-surface-raised p-2 transition-[background-color] duration-160 ease-out hover:bg-surface-hover focus-visible:-outline-offset-2">
              <span aria-hidden="true" className={cn('grid h-60 place-items-center overflow-hidden rounded-container bg-surface p-6', columns === 2 && 'lg:h-80')}>
                {card.cover ? <Cover cover={card.cover} columns={columns} /> : null}
              </span>
              <span className="flex flex-1 flex-col gap-2 p-4 md:pt-6">
                <h2 className="type-heading-3">{card.title}</h2>
                <span className="type-body text-pretty text-fg-soft">{card.line}</span>
                {card.meta ? <span className="mt-auto pt-2 type-ui text-fg-muted">{card.meta}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {rows.length > 0 ? (
        <ul role="list" aria-label={rowsLabel} className="m-0 list-none border-t border-edge p-0">
          {rows.map((row) => {
            const body = (
              <>
                <h2 className="col-start-1 row-start-1 type-body font-medium text-fg-soft transition-[color] duration-160 ease-out group-hover:text-fg">{row.title}</h2>
                <span className="col-span-full row-start-2 type-body text-pretty text-fg-faint lg:col-span-1 lg:col-start-2 lg:row-start-1">{row.line}</span>
                {row.badge ? <span className="col-start-2 row-start-1 flex justify-self-end lg:col-start-3"><Badge variant="secondary">{row.badge}</Badge></span> : null}
              </>
            )
            const classes = 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-edge py-5 lg:grid-cols-[240px_minmax(0,1fr)_auto] lg:py-6'
            return (
              <li key={row.title}>
                {row.href ? <a href={row.href} target={isExternal(row.href) ? '_blank' : undefined} rel={isExternal(row.href) ? 'noreferrer' : undefined} className={cn('group focus-visible:-outline-offset-2', classes)}>{body}</a> : <div className={classes}>{body}</div>}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default ResourceCards
