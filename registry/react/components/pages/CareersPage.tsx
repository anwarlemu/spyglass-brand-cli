import { ArrowUpRight } from 'lucide-react'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { careersContent, type CareersContent } from '@/lib/pages/careers'
import { notFoundContent } from '@/lib/pages/not-found'
import { cn } from '@/react/lib/cn'

// The careers page from library items: the header, the page head with the light, why join as three #262626 cards, and
// the open roles as rows under #363636 hairlines (the title in Funnel Display 24/28, the team and place in #A3A3A3, a
// small arrow that brightens with the row and never moves). No roles shows `none`. The footer row at the foot.
export interface CareersPageProps {
  content?: CareersContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function CareersPage({ content: c = careersContent, className }: CareersPageProps) {
  const h = notFoundContent
  return (
    <div data-ds="careers-page" className={cn('flex min-h-dvh flex-col bg-surface text-fg', className)}>
      <div className={WRAP}><SiteHeader links={h.header.nav} secondary={h.header.secondary} cta={h.header.cta} /></div>
      <main className="flex-1">
        <HeroBlock eyebrow={c.eyebrow} headline={c.headline} body={c.body} light="field" />
        <section className={cn(WRAP, 'grid gap-4 pb-16 md:grid-cols-3')}>
          {c.values.map((v) => (
            <div key={v.title} className="grid content-start gap-2 rounded-container bg-surface-raised p-6">
              <h2 className="type-heading-3">{v.title}</h2>
              <p className="type-body text-fg-soft">{v.body}</p>
            </div>
          ))}
        </section>
        <section className={cn(WRAP, 'grid gap-8 pb-24')}>
          <h2 className="type-section">{c.rolesTitle}</h2>
          {c.roles.length ? (
            <ul role="list" className="m-0 list-none border-b border-edge p-0">
              {c.roles.map((r) => (
                <li key={r.title} className="border-t border-edge">
                  <a href={r.href} className="group flex items-center gap-6 rounded-ds-sm py-6 transition-[color] duration-160 ease-out">
                    <span className="grid flex-1 gap-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                      <span className="type-heading-3 text-fg">{r.title}</span>
                      <span className="type-ui text-fg-muted">{r.team} · {r.location}</span>
                    </span>
                    <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-fg-muted transition-[color] duration-160 ease-out group-hover:text-fg" />
                  </a>
                </li>
              ))}
            </ul>
          ) : <p className="type-body text-fg-soft">{c.none}</p>}
        </section>
      </main>
      <footer className="border-t border-edge"><div className={cn(WRAP, 'py-10')}><FooterRow domain={h.footer.domain} homeHref="/" links={h.footer.links} /></div></footer>
    </div>
  )
}

export default CareersPage
