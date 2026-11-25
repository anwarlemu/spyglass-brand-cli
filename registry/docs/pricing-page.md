---
name: pricing-page
title: Pricing page
type: registry:block
group: pages
description: "The site's pricing page, built only from library items: the header, the centered page head, the plan cards with the billing switch, the compare table (from 768), the questions (the head on the left at every width, 5 parts to the questions' 7 from 1024), the closing section with the connect menu and the footer."
use_for: "A website's pricing. Edit lib/pages/pricing.ts or pass `content`: plans, the compare table's groups, the questions."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A price or a feature the plan does not state"
source: "Site app/pricing and pages/Pricing/PricingPage.tsx (AsciiTrail page, PageHead centre, PlanCards, CompareTable in a section #compare hidden under 768, the FAQ split #pricing-faq: Pricing.module.css .split 48px apart, 5fr/7fr and 64px from 1024, .splitHead left-aligned with 24px between and the quiet button 16px more, full width under 768, held 32px under the header from 1024; PageClose), built from ascii-trail, site-header, page-head, pricing-table, compare-table, faq-accordion, button, page-close and site-footer; copy from content/pages/pricing.ts with third-party names left out"
files:
  - react/components/pages/PricingPage.tsx
  - lib/pages/pricing.ts
examples:
  - "Page | Pricing page | bleed"
---
`sections` lists the sections to show, in order (`head`, `plans`, `compare`, `faq`, `close`); a key left out is not
shown. `menus` passes the header menus (the live card's `picture`, the use cases' `shots`).
