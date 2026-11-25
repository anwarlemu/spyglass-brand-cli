import { CompareTable } from '@/react/components/site/CompareTable'
import { PageClose } from '@/react/components/site/PageClose'
import { PageHead } from '@/react/components/site/PageHead'
import { PricingTable } from '@/react/components/site/PricingTable'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { FaqAccordion } from '@/react/components/blocks/FaqAccordion'
import { Button } from '@/react/components/ui/Button'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { pricingContent, type PricingContent, pricingSections, type PricingSection } from '@/lib/pages/pricing'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'

// The site's pricing page (app/pricing, pages/Pricing/PricingPage.tsx), from library items: the header, the centered
// page head ("Start free. Pay for what you use"), the plan cards with the billing switch, the compare table (from 768;
// the site leaves it out on phones), the questions, the closing section with the connect menu and the footer.
// `content` replaces the copy (lib/pages/pricing.ts).
export interface PricingPageProps {
  content?: PricingContent
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly PricingSection[]
  className?: string
}

// The questions as the pricing page sets them (Pricing.module.css .split): the head on the left at every width (title,
// lead and the quiet button, 24px apart and 16 more above the button, full width on phones), the questions under it,
// and from 1024 5 parts to 7, 64px apart, the head held 32px under the header.
const FAQ_SPLIT = 'grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16'
const FAQ_HEAD = 'flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]'
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function PricingPage({ content: c = pricingContent, sections, className }: PricingPageProps) {
  const parts: Record<PricingSection, ReactNode> = {
    head: <PageHead id="pricing" lines={c.head.lines} lead={c.head.lead} align="centre" />,
    plans: (
      <section aria-label="Plans" className="pb-[calc(var(--ds-layout-section)-var(--ds-space-xs))] md:pb-(--ds-layout-section)">
        <div className={WRAP}><PricingTable plans={c.plans} billing={c.billing} note={c.note} /></div>
      </section>
    ),
    compare: (
      <section id={c.compare.id} aria-label={c.compare.label} className="py-(--ds-layout-section) max-md:hidden">
        <div className={WRAP}><CompareTable plans={c.compare.plans} groups={c.compare.groups} defaultPlan={c.compare.defaultPlan} /></div>
      </section>
    ),
    faq: (
      <section id={c.faq.id} aria-labelledby={`${c.faq.id}-heading`} className="py-(--ds-layout-section)">
        <div className={cn(WRAP, FAQ_SPLIT)}>
          <div className={FAQ_HEAD}>
            <h2 id={`${c.faq.id}-heading`} className="type-section [text-box:trim-start_cap_alphabetic]">{c.faq.title}</h2>
            <p className="type-body-lg text-pretty text-fg-soft">{c.faq.lead}</p>
            <Button href={c.faq.action.href} variant="secondary" className="mt-4 max-md:w-full">{c.faq.action.label}</Button>
          </div>
          <div className="min-w-0"><FaqAccordion items={c.faq.items} /></div>
        </div>
      </section>
    ),
    close: <PageClose lines={c.close.lines} note={c.close.note} primary={c.close.primary} />,
  }
  return (
    <div data-ds="pricing-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main id="main">
        {pageSections(pricingSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default PricingPage
