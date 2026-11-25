import { type CSSProperties, Fragment, type ReactNode } from 'react'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { Badge } from '@/react/components/ui/Badge'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { PageClose } from '@/react/components/site/PageClose'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { asciiDriftStyleObject, type AsciiDriftCrop, type AsciiDriftFrom } from '@/lib/ascii-drift'
import { caseStudies, caseStudyContent, caseStudyMinutes, caseStudyNeighbors, type CaseStudy, type CaseStudyContent, caseStudyPageSections, type CaseStudyPageSection } from '@/lib/pages/case-studies'
import { cn } from '@/react/lib/cn'
import { pageSections, groupSections, imageFit } from '@/lib/image'

// The site's case study (app/resources/case-studies/[slug], pages/CaseStudies/CaseStudyArticle): the header, then a
// centered head (the breadcrumb, the headline at the section head's size, the kind and the read time as badges), the
// facts in four columns (two on phones) with the products it uses linked, the lead picture (16:9, 4:5 on phones), the
// opening line over three figures, the pull quote on the #262626 surface, the sections with a second quote after the
// second, and the pager to the other studies between hairlines; the closing section and the footer follow. From 1024
// crops of the ASCII texture sit in the margins beside each band. Links change color under a mouse; nothing moves.
// `study` picks the study (lib/pages/case-studies.ts); `content.studies` sets the pager's neighbors.
export interface CaseStudyPageProps {
  study?: CaseStudy
  content?: CaseStudyContent
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly CaseStudyPageSection[]
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const MEASURE = 'mx-auto w-full max-w-[calc(var(--ds-layout-measure)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
// The margins beside the head (its 880px title) and beside the 640px measure, less 64px.
const HEAD_SIDE = 'w-[calc((100%-880px)/2-64px)]'
const BODY_SIDE = 'w-[calc((100%-var(--ds-layout-measure))/2-64px)]'

function Drift({ crop, from, hero, className }: { crop: AsciiDriftCrop; from: AsciiDriftFrom; hero?: boolean; className: string }) {
  return <span aria-hidden="true" className={cn('pointer-events-none absolute -z-1 hidden select-none lg:block', className)} style={asciiDriftStyleObject(crop, from, hero ? 'hero' : 'quiet') as CSSProperties} />
}

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" focusable="false" className="size-4 transition-[color] duration-160 ease-out group-hover:text-fg group-focus-visible:text-fg">
      <path d={back ? 'M13 8H4M7.5 4.5 4 8l3.5 3.5' : 'M3 8h9M8.5 4.5 12 8l-3.5 3.5'} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const ARTICLE: readonly CaseStudyPageSection[] = ['head', 'facts', 'cover', 'lead', 'body', 'more']
const LABEL = 'type-ui text-fg-muted transition-[color] duration-160 ease-out group-hover:text-fg group-focus-visible:text-fg'

export function CaseStudyPage({ study: s = caseStudies[0], content: c = caseStudyContent, sections, className }: CaseStudyPageProps) {
  const { previous, next } = caseStudyNeighbors(c.studies, s.slug)
  const id = `${s.slug}-heading`
  const parts: Record<CaseStudyPageSection, ReactNode> = {
    head: (
      <div className="relative">
        <Drift crop="column" from="left" hero className={cn(HEAD_SIDE, 'top-[8%] left-0 h-[84%]')} />
        <Drift crop="scatter" from="right" hero className={cn(HEAD_SIDE, 'top-0 right-0 h-[72%]')} />
        <header className={cn(CONTAINER, 'flex flex-col items-center gap-6 pt-20 pb-12 text-center lg:gap-8 lg:pt-40 lg:pb-16')}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 type-ui text-fg-muted">
            <a href={c.labels.all.href} className="transition-[color] duration-160 ease-out hover:text-fg">{c.labels.all.label}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-fg">{s.company}</span>
          </nav>
          <h1 id={id} className="max-w-[880px] type-section text-balance">{s.headline}</h1>
          <p className="flex items-center gap-1">
            <Badge variant="secondary">{s.kind}</Badge>
            <Badge variant="secondary">{c.labels.read(caseStudyMinutes(s))}</Badge>
          </p>
        </header>
      </div>
    ),
    facts: (
      <div className="relative">
        <Drift crop="mass" from="right" className={cn(BODY_SIDE, '-top-8 right-0 h-40')} />
        <div className={MEASURE}>
          <dl className="m-0 mb-12 grid grid-cols-2 gap-x-5 gap-y-6 md:mb-16 md:grid-cols-4">
            {s.facts.map((f) => (
              <div key={f.label} className="flex min-w-0 flex-col gap-1">
                <dt className="type-ui-strong text-fg">{f.label}</dt>
                <dd className="m-0 type-ui text-fg-soft">{f.value}</dd>
              </div>
            ))}
            <div className="flex min-w-0 flex-col gap-1">
              <dt className="type-ui-strong text-fg">{c.labels.uses}</dt>
              <dd className="m-0 type-ui text-fg-soft">
                {s.uses.map((u, i) => (
                  <span key={u.href}>
                    <a href={u.href} className="text-fg-soft underline decoration-edge-strong underline-offset-4 transition-[color,text-decoration-color] duration-160 ease-out hover:text-fg hover:decoration-fg">{u.label}</a>
                    {i < s.uses.length - 1 ? ', ' : null}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    ),
    cover: (
      <div className={CONTAINER}>
        <div className="relative aspect-4/5 overflow-hidden rounded-panel bg-surface-raised md:aspect-video">
          {s.cover?.src ? <img src={s.cover.src} alt={s.cover.alt ?? ''} className="absolute inset-0 block size-full object-cover" style={imageFit(s.cover)} /> : <div className="absolute inset-0"><CreativeCard ratio="fill" brand={s.cover?.brand} tone={2} /></div>}
        </div>
      </div>
    ),
    lead: (
      <div className="relative">
        <Drift crop="cluster" from="left" className={cn(BODY_SIDE, 'top-0 left-0 h-full')} />
        <div className={MEASURE}>
          <p className="m-0 mt-16 type-body-lg text-pretty text-fg">{s.lead}</p>
          <ul role="list" className="m-0 mt-12 grid list-none grid-cols-[minmax(0,1fr)] gap-6 border-t border-edge p-0 pt-8 md:grid-cols-3 md:gap-5">
            {s.figures.map((f) => (
              <li key={f.label} className="flex flex-col gap-2">
                <span className="type-heading-2 text-fg tabular-nums">{f.value}</span>
                <span className="type-ui text-balance text-fg-muted">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
    body: (
      <div className="relative">
        <Drift crop="scatter" from="right" className={cn(BODY_SIDE, 'top-[8%] right-0 h-[28%]')} />
        <Drift crop="column" from="left" className={cn(BODY_SIDE, 'top-[52%] left-0 h-[30%]')} />
        <div className={cn(MEASURE, 'pt-16 pb-24')}>
          <blockquote className="m-0 flex flex-col gap-4 rounded-panel bg-surface-raised p-8">
            <p className="m-0 type-heading-4 text-pretty md:type-heading-3 md:text-pretty">&ldquo;{s.quote.text}&rdquo;</p>
            <footer className="type-ui text-fg-muted">{s.quote.role ? `${s.quote.name}, ${s.quote.role}` : s.quote.name}</footer>
          </blockquote>
          {s.sections.map((section, i) => (
            <section key={section.title} aria-labelledby={`${s.slug}-s${i}`} className="mt-24">
              <h2 id={`${s.slug}-s${i}`} className="m-0 type-heading-2 text-balance lg:type-heading-1">{section.title}</h2>
              {section.paragraphs.map((p) => <p key={p} className="m-0 mt-6 type-body text-pretty text-fg-soft">{p}</p>)}
              {i === 1 && s.aside ? (
                <blockquote className="m-0 mt-10 flex flex-col gap-4 border-l border-edge-strong pl-6">
                  <p className="m-0 type-heading-4 text-pretty md:type-heading-3 md:text-pretty">&ldquo;{s.aside.text}&rdquo;</p>
                  <footer className="type-ui text-fg-muted">{s.aside.name}</footer>
                </blockquote>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    ),
    more: (
      next ? (
        <nav aria-label={c.labels.more} className={MEASURE}>
          <div className="flex justify-between gap-6 border-y border-edge py-10">
            {previous ? (
              <a href={c.href(previous.slug)} className="group grid min-w-0 grid-cols-[16px_auto] items-center gap-x-3 gap-y-2 text-fg-muted">
                <Arrow back />
                <span className={LABEL}>{c.labels.previous}</span>
                <span className="col-start-2 justify-self-end type-body font-medium text-fg">{previous.company}</span>
              </a>
            ) : <span />}
            <a href={c.href(next.slug)} className="group grid min-w-0 grid-cols-[auto_16px] items-center gap-x-3 gap-y-2 text-left text-fg-muted">
              <span className={LABEL}>{c.labels.next}</span>
              <Arrow />
              <span className="col-start-1 justify-self-start type-body font-medium text-fg">{next.company}</span>
            </a>
          </div>
        </nav>
      ) : null
    ),
    close: <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />,
  }
  return (
    <div data-ds="case-study-page" className={cn('isolate overflow-x-clip bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        {groupSections(pageSections(caseStudyPageSections, sections), ARTICLE).map((k) => (Array.isArray(k) ? <article key="article" aria-labelledby={id} className="relative isolate overflow-x-clip">{k.map((a) => <Fragment key={a}>{parts[a]}</Fragment>)}</article> : <Fragment key={k}>{parts[k]}</Fragment>))}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default CaseStudyPage
