---
name: pricing-page
title: Pricing page
type: registry:block
group: pages
description: "The pricing page template, built only from library items: the Creator plan ad as the top (the offer headline under the light field, the plan card) and the questions, answered with what the plan says."
use_for: "A website's pricing. Each plan is a plan card; edit lib/pages/pricing.ts or pass `content`."
never:
  - "New colors, shadows or type sizes added to a section: use the items' props"
  - "More than one White button in a section"
  - "A price or a feature the plan does not state"
source: "Built from the library (site header, offer block, plan card, footer row); Figma page 8: Ad, Creator plan offer; the plan's copy is the ad's own"
files:
  - react/components/pages/PricingPage.tsx
  - lib/pages/pricing.ts
examples:
  - "Page | Pricing page | bleed"
---
