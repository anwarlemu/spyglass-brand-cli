---
name: pricing-table
title: Pricing table
type: registry:ui
group: site
description: "The site's plan grid: up to four plans ruled apart by hairlines, each a #262626 tier with the name, who it is for and the price, its button, and what it includes after checks; the featured plan lit with the ice fill, the light at its edge and a badge."
use_for: "A pricing page's plans, as the site sets Free, Creator, Pro and Enterprise. For one plan in a post or a card use the plan card."
never:
  - "Two featured plans in one grid"
  - "A price without its unit where the plan is billed per period"
  - "Plans or prices the product does not offer"
source: "Site pages/Pricing (PlanCards.tsx, Pricing.module.css .plans, .tier, .benefits): hairline grid on --line, tiers in --surface with --radius-m, 24px in, names h4 32/36, amounts h3 40/44, the lit tier on --plan-ice with the tier light"
files:
  - react/components/site/PricingTable.tsx
examples:
  - "Plans | Four plans, one lit | bleed"
---
