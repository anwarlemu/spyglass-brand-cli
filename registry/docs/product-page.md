---
name: product-page
title: Product page
type: registry:block
group: pages
description: "The site's product page, one template for every product: the header, the product hero running the product's questions over their results with the works light behind, the proof row, the feature rows with their product visuals, the comparison where the product has one, the pricing receipt, the questions with the docs button, the closing section and the footer."
use_for: "A product's own page. Pass the product's copy (name, line, questions and results, features with a visual kind each, comparison rows, the rate and its receipt, the questions); the chrome stays the same across products."
never:
  - "Features without a visual: each row has a product visual kind"
  - "Results, people or brands you may not show in the hero or the receipt"
  - "A second hero or a second White button in a section"
source: "Site app/products/[slug] and pages/Products/ProductPage.tsx (FeaturePage): Header, ProductHero, V3Proof, ProductFeatures, ProductCompare, ProductPricing (receipt), V3Faq, PageClose, Footer; content/pages/products.ts, productPages, productHeroes and productCompare; built from the library's site header, product hero, proof block, product features, product visual, product compare, product pricing, FAQ block, page close and site footer"
files:
  - react/components/pages/ProductPage.tsx
  - lib/pages/product.ts
examples:
  - "CreatorSearch | Creator search | bleed"
  - "Comments | Comments | bleed"
  - "LandingPages | Landing pages | bleed"
---
`lib/pages/product.ts` holds three products, one per kind of page: Creator search (filters and records, with the
comparison), Comments (threads and themes, no comparison) and Landing pages (pages and the links board). The site's
products, features, rates and questions are its own; the results in the hero and the receipt are Acme, shown as
figures. `live` puts the dispersion field over the hero's still, as the site draws it.
