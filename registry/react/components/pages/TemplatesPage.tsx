import type { ReactNode } from 'react'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { RowFan } from '@/react/components/site/RowFan'
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
// 1024, each row a link whose items fan out in perspective, the row fan), the questions, the close with a White and a quiet
// button, and the footer. `fan` replaces the row fan with your own arrangement of the rows; `content` replaces
// the copy (lib/pages/templates.ts).
export interface TemplatesPageProps {
  content?: TemplatesPageContent
  /** Your own arrangement of the rows in place of the row fan. */
  fan?: ReactNode
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function TemplatesPage({ content: c = templatesPageContent, fan, className }: TemplatesPageProps) {
  const t = c.cities
  return (
    <div data-ds="templates-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <style href="ds-templates-page" precedence="ds">{css}</style>
      <SiteHeader links={c.chrome.header.nav} secondary={c.chrome.header.secondary} cta={c.chrome.header.cta} />
      <main id="main">
        <TemplatesWall hero content={c.wall} id="templates" />
        <AutomationRun id="templates-run" />
        <section id={t.id} aria-labelledby={`${t.id}-heading`} className="ds-tpl-cities overflow-x-clip pt-(--ds-layout-section)">
          <div className={cn(WRAP, 'grid justify-items-center text-center')}>
            <h2 id={`${t.id}-heading`} className="type-section [text-box:trim-start_cap_alphabetic]">{t.headline}</h2>
            <p className="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{t.lead}</p>
          </div>
          <div className="ds-tpl-cities-rows relative">
            {fan ?? <RowFan rows={t.rows.map((r) => ({ key: r.key, name: r.name, href: r.href, cta: r.line, srLabel: `: ${t.status.toLowerCase()}. ${r.line}`, items: r.items.map((i) => ({ ...i, src: i.src ?? '' })) }))} />}
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
@media (min-width: 768px) { .ds-tpl-cities-rows { margin-top: calc(var(--ds-space-4xl) + var(--ds-space-sm)); } }
@media (min-width: 1024px) { .ds-tpl-cities { padding-bottom: var(--ds-layout-section); } }
`
