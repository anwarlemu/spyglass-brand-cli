import { DispersionField } from '@/react/components/visuals/DispersionField'
import { PageClose } from '@/react/components/site/PageClose'
import { ProductCompare } from '@/react/components/site/ProductCompare'
import { ProductFeatures } from '@/react/components/site/ProductFeatures'
import { ProductHero } from '@/react/components/site/ProductHero'
import { ProductPricing } from '@/react/components/site/ProductPricing'
import { ProductVisual } from '@/react/components/site/ProductVisual'
import { ProofBlock } from '@/react/components/site/ProofBlock'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { productContent, type ProductContent, type ProductPageContent } from '@/lib/pages/product'
import { cn } from '@/react/lib/cn'

// The site's product page (app/products/[slug], pages/Products/ProductPage.tsx): one template for every product, from
// library items. The header, the product hero (the name, the line, the composer running the product's questions over
// their results, the works light behind), the proof row, the feature rows (each with its product visual), the
// comparison where the product has one, the pricing receipt, the questions with the docs button, the closing section
// and the footer. `product` is the product's copy (lib/pages/product.ts has Creator search, Comments and Landing
// pages); `content` the page's chrome. `live` draws the works light live (the dispersion field) over its still.
export interface ProductPageProps {
  product?: ProductPageContent
  content?: ProductContent
  /** Draw the hero's light live in WebGL over its still, as the site does. */
  live?: boolean
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ProductPage({ product, content: c = productContent, live = false, className }: ProductPageProps) {
  const p = product ?? c.product
  return (
    <div data-ds="product-page" className={cn('bg-surface text-fg', className)}>
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main>
        <ProductHero
          id={p.slug}
          name={p.name}
          line={p.line}
          primary={c.primary}
          secondary={{ label: c.docsLabel, href: p.docs }}
          sets={p.hero.sets}
          lit={p.hero.lit !== false}
          light={live ? <DispersionField composition="works" seed={7} className="absolute inset-0 size-full" /> : undefined}
        />
        <ProofBlock id={`${p.slug}-proof`} title={c.proof} />
        <ProductFeatures id={p.slug} features={p.features.map((f, i) => ({ headline: f.headline, text: f.text, link: f.link, visual: <ProductVisual kind={f.visual} texture={i % 4} /> }))} />
        {p.compare?.length ? <ProductCompare id={p.slug} rows={p.compare} /> : null}
        <ProductPricing id={p.slug} value={p.pricing.value} unit={p.pricing.unit} product={p.name} rows={p.pricing.rows} free={p.pricing.free} tally={p.pricing.tally} note={c.pricing.note} primary={c.primary} secondary={c.pricing.secondary} />
        <div className={cn(WRAP, 'py-(--ds-layout-section)')}>
          <FaqBlock id={`${p.slug}-faq`} title={c.faq.title} body={c.faq.lead} action={{ label: c.docsLabel, href: p.docs }} items={p.faq} />
        </div>
        <PageClose id={`${p.slug}-close`} lines={c.close.lines} note={c.close.note} primary={c.close.primary} />
      </main>
      <SiteFooter columns={c.footer.columns} legal={c.footer.legal} />
    </div>
  )
}

export default ProductPage
