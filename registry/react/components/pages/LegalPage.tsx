import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { legalContent, type LegalContent } from '@/lib/pages/legal'
import { cn } from '@/react/lib/cn'

// A legal page (terms, privacy) from library items: the title and the date it changed, a list of the sections that
// stays in view on wide screens, and the sections in a 720px column of DM Sans. The template's text is a placeholder
// for the terms your counsel approves: `content` replaces it (lib/pages/legal.ts).
export interface LegalPageProps {
  content?: LegalContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function LegalPage({ content: c = legalContent, className }: LegalPageProps) {
  return (
    <div data-ds="legal-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <div className={cn(WRAP, 'grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8')}>
          <h1 className="type-section">{c.title}</h1>
          <p className="type-label text-fg-muted">{c.updated}</p>
        </div>
        <div className={cn(WRAP, 'grid grid-cols-4 gap-12 pt-12 pb-24 max-md:grid-cols-1 max-md:gap-8 max-sm:pb-16')}>
          <nav aria-label={c.contents} className="self-start md:sticky md:top-8">
            <p className="mb-3 type-label text-fg-faint">{c.contents}</p>
            <ul className="grid gap-2">
              {c.sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="rounded-control type-ui text-fg-muted transition-[color] duration-160 ease-standard hover:text-fg">{s.title}</a></li>)}
            </ul>
          </nav>
          <div className="col-span-3 grid max-w-180 gap-12 max-md:col-span-1">
            {c.sections.map((s) => (
              <section key={s.id} id={s.id} className="grid scroll-mt-8 gap-4">
                <h2 className="type-heading-2">{s.title}</h2>
                {s.body.map((p) => <p key={p} className="type-body text-fg-soft">{p}</p>)}
              </section>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default LegalPage
