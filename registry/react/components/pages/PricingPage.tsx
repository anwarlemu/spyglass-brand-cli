import { Accordion } from '@/react/components/ui/Accordion'
import { AccordionItem } from '@/react/components/ui/AccordionItem'
import { Button } from '@/react/components/ui/Button'
import { CompareTable } from '@/react/components/site/CompareTable'
import { PricingTable } from '@/react/components/site/PricingTable'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { pricingContent, type PricingContent } from '@/lib/pages/pricing'
import { cn } from '@/react/lib/cn'

// The site's pricing page (app/pricing, pages/Pricing/PricingPage.tsx): the centered head ("Start free. Pay for what
// you use"), the plan cards with the billing switch, the compare table (from 768; the site leaves it out on phones),
// the questions beside their sticky head from 1024 (5 and 7 columns) with a quiet button, and the footer. `content`
// replaces the copy (lib/pages/pricing.ts).
export interface PricingPageProps {
  content?: PricingContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function PricingPage({ content: c = pricingContent, className }: PricingPageProps) {
  return (
    <div data-ds="pricing-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <header className={cn(WRAP, 'flex flex-col items-center gap-6 pt-16 pb-12 text-center md:pt-24 md:pb-16')}>
          <h1 className="m-0 type-section">{c.head.lines.map((l, i) => <span key={l} className="block">{l}{i < c.head.lines.length - 1 ? ' ' : ''}</span>)}</h1>
          <p className="m-0 max-w-(--ds-layout-measure) type-body-lg text-fg-soft">{c.head.lead}</p>
        </header>
        <section aria-label="Plans" className="pb-(--ds-layout-section)">
          <div className={WRAP}><PricingTable plans={c.plans} billing={c.billing} note={c.note} /></div>
        </section>
        <section aria-label={c.compare.label} className="py-(--ds-layout-section) max-md:hidden">
          <div className={WRAP}><CompareTable plans={c.compare.plans} groups={c.compare.groups} defaultPlan={c.compare.defaultPlan} /></div>
        </section>
        <section aria-labelledby="pricing-faq-heading" className="py-(--ds-layout-section)">
          <div className={cn(WRAP, 'grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16')}>
            <div className="flex flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]">
              <h2 id="pricing-faq-heading" className="m-0 type-section">{c.faq.title}</h2>
              <p className="m-0 type-body-lg text-fg-soft">{c.faq.lead}</p>
              <Button href={c.faq.action.href} variant="secondary" className="mt-4">{c.faq.action.label}</Button>
            </div>
            <div className="min-w-0">
              <Accordion defaultValue="faq-0">
                {c.faq.items.map((f, i) => <AccordionItem key={f.q} value={`faq-${i}`} title={f.q}>{f.a}</AccordionItem>)}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default PricingPage
