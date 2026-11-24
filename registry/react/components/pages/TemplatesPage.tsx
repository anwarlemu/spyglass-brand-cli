import type { ReactNode } from 'react'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AutomationRun } from '@/react/components/site/AutomationRun'
import { PageClose } from '@/react/components/site/PageClose'
import { TemplatesWall } from '@/react/components/blocks/TemplatesWall'
import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { templatesPageContent, type TemplatesPageContent } from '@/lib/pages/templates'
import { cn } from '@/react/lib/cn'

// The site's templates page (app/templates): the header, the templates wall as the hero (an h1 filling the window under
// the header), the automation run (a quote over the batch drifting by), what each template brings back
// (pages/TemplatesPage/TemplateCities: a centered head and a row per template, its name 32/36, 44/48 at 768, 64/68 at
// 1024, each row a link with room under it for its items to fan out), the questions, the close with a White and a quiet
// button, and the footer. `fan` replaces the rows with your own arrangement of them (the row fan); `content` replaces
// the copy (lib/pages/templates.ts).
export interface TemplatesPageProps {
  content?: TemplatesPageContent
  /** The cities' rows as an arrangement of your own (the row fan); the plain rows by default. */
  fan?: ReactNode
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function TemplatesPage({ content: c = templatesPageContent, fan, className }: TemplatesPageProps) {
  const t = c.cities
  return (
    <div data-ds="templates-page" className={cn('bg-surface text-fg', className)}>
      <style href="ds-templates-page" precedence="ds">{css}</style>
      <div className={cn(WRAP, 'relative z-10')}>
        <SiteHeader links={c.chrome.header.nav} secondary={c.chrome.header.secondary} cta={c.chrome.header.cta} />
      </div>
      <main id="main">
        <TemplatesWall hero content={c.wall} id="templates" />
        <AutomationRun id="templates-run" />
        <section id={t.id} aria-labelledby={`${t.id}-heading`} className="ds-tpl-cities overflow-x-clip pt-(--ds-layout-section)">
          <div className={cn(WRAP, 'grid justify-items-center text-center')}>
            <h2 id={`${t.id}-heading`} className="type-section [text-box:trim-start_cap_alphabetic]">{t.headline}</h2>
            <p className="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{t.lead}</p>
          </div>
          <div className="ds-tpl-cities-rows relative">
            {fan ?? (
              <ul role="list" className="ds-tpl-cities-list m-0 flex list-none flex-col p-0">
                {t.rows.map((r) => (
                  <li key={r.key}>
                    <a href={r.href} className="ds-tpl-cities-row flex justify-center text-fg no-underline outline-none">
                      <span className="ds-tpl-cities-name inline-block whitespace-nowrap">{r.name}</span>
                      <span className="sr-only">{`: ${t.status.toLowerCase()}. ${r.line}`}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <div className={cn(WRAP, 'py-(--ds-layout-section)')}>
          <FaqBlock id={c.faq.id} title={c.faq.headline} body={c.faq.lead} action={c.faq.docs} items={c.faq.items} />
        </div>
        <PageClose id="templates-close" lines={c.close.lines} note={c.close.note} primary={c.close.primary} secondary={c.close.secondary} control={null} />
      </main>
      <SiteFooter columns={c.chrome.footer.columns} legal={c.chrome.footer.legal} />
    </div>
  )
}

export default TemplatesPage

const css = `
.ds-tpl-cities { padding-bottom: calc(var(--ds-layout-section) - var(--ds-space-lg)); }
.ds-tpl-cities-rows { margin-top: var(--ds-space-3xl); }
.ds-tpl-cities-row { padding-top: var(--ds-space-lg); padding-bottom: var(--ds-space-7xl); }
.ds-tpl-cities-name {
  font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular);
  font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading);
}
.ds-tpl-cities-row:focus-visible .ds-tpl-cities-name { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-space-sm); }
@media (min-width: 768px) {
  .ds-tpl-cities-rows { margin-top: calc(var(--ds-space-4xl) + var(--ds-space-sm)); }
  .ds-tpl-cities-row { padding-bottom: calc(var(--ds-space-lg) + var(--ds-space-xl) + var(--ds-space-6xl)); }
  .ds-tpl-cities-name { font-size: var(--ds-text-heading-1); line-height: var(--ds-text-heading-1-leading); }
}
@media (min-width: 1024px) {
  .ds-tpl-cities { padding-bottom: var(--ds-layout-section); }
  .ds-tpl-cities-list { gap: calc(var(--ds-space-xl) + var(--ds-space-lg)); }
  .ds-tpl-cities-row { padding-bottom: var(--ds-space-lg); }
  .ds-tpl-cities-name { font-size: var(--ds-text-display-s); line-height: var(--ds-text-display-s-leading); }
}
`
