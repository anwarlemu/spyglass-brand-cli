import { CreativeCard } from '@/react/components/site/CreativeCard'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { changelogContent, type ChangelogContent } from '@/lib/pages/changelog'
import { cn } from '@/react/lib/cn'

// The changelog from library items: the title, then every release newest first under a hairline, its date in
// capitals on the left (it stays in view while the entry scrolls on wide screens), the change as a Funnel Display
// sentence, a line, the details and a picture when there is one. `content` replaces the entries
// (lib/pages/changelog.ts).
export interface ChangelogPageProps {
  content?: ChangelogContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function ChangelogPage({ content: c = changelogContent, className }: ChangelogPageProps) {
  return (
    <div data-ds="changelog-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <div className={cn(WRAP, 'grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8')}>
          <h1 className="type-display max-md:type-hero max-sm:type-heading-1">{c.title}</h1>
          <p className="max-w-140 type-body-lg text-fg-soft">{c.body}</p>
        </div>
        <ol className={cn(WRAP, 'grid pb-24 max-sm:pb-16')}>
          {c.entries.map((e) => (
            <li key={e.title} className="grid grid-cols-4 gap-12 border-t border-edge py-12 max-md:grid-cols-1 max-md:gap-4 max-sm:py-8">
              <p className="self-start type-label text-fg-muted md:sticky md:top-8"><time>{e.date}</time></p>
              <div className="col-span-3 grid max-w-180 gap-4 max-md:col-span-1">
                <h2 className="type-heading-2 text-balance">{e.title}</h2>
                <p className="type-body text-fg-soft">{e.body}</p>
                {e.items.length > 0 && <ul className="grid list-disc gap-2 pl-5 type-body text-fg-soft marker:text-fg-faint">{e.items.map((i) => <li key={i}>{i}</li>)}</ul>}
                {e.image && <CreativeCard {...e.image} alt={e.title} ratio="16/9" className="mt-2" />}
              </div>
            </li>
          ))}
        </ol>
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default ChangelogPage
