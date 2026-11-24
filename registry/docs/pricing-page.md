---
name: pricing-page
title: Pricing page
type: registry:block
group: pages
description: "The site's pricing page, built only from library items: the header, the centered page head, the plan cards with the billing switch, the compare table (from 768), the questions, the closing section with the connect menu and the footer."
use_for: "A website's pricing. Edit lib/pages/pricing.ts or pass `content`: plans, the compare table's groups, the questions."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A price or a feature the plan does not state"
source: "Site app/pricing and pages/Pricing/PricingPage.tsx (PageHead centre, PlanCards, CompareTable in a section hidden under 768, the FAQ split with the demo button, PageClose), built from site-header, page-head, pricing-table, compare-table, faq-block, page-close and site-footer; copy from content/pages/pricing.ts with third-party names left out"
files:
  - react/components/pages/PricingPage.tsx
  - lib/pages/pricing.ts
examples:
  - "Page | Pricing page | bleed"
---
