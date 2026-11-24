---
name: pricing-table
title: Pricing table
type: registry:ui
group: site
description: "The site's plan cards: the Monthly or Yearly switch over a note, then up to four plans ruled apart by hairlines, each a #262626 tier with the name, who it is for and the price, its button and what it includes after checks. One plan is lit with its own tier light, Black type and a ring; a resting pointer lights another; one plan can carry the running rim light."
use_for: "A pricing page's plans, as the site sets Free, Creator, Pro and Enterprise. For one plan in a post or a card use the plan card; to compare plans line by line add the compare table under it."
never:
  - "Two featured plans in one grid"
  - "A price without its unit where the plan is billed per period"
  - "Plans or prices the product does not offer"
  - "The rim light on more than one plan"
source: "Site pages/Pricing (PlanCards.tsx, PlanRim.tsx, PlanRim.effect.module.css, Segmented.tsx, Pricing.module.css .plans, .tier, .benefits, .segmented; controls.css --seg-*): hairline grid on --line with subgrid rows, tiers in --surface with --radius-m, 24px in, names h4 32/36, amounts h3 40/44, the lit tier on --plan-ice with the plan's tier light (public/brand/light/tier-light-*.webp, embedded in lib/plan-lights.ts), the --lit hover handoff over --dur-move, the rim's glide and the glyph drift"
files:
  - react/components/site/PricingTable.tsx
  - react/components/site/Segmented.tsx
  - lib/plan-lights.ts
examples:
  - "Plans | Four plans, one lit, with the billing switch | bleed"
---
`Segmented` (React) and `<spyglass-segmented>` are the switch: one choice out of a few as radios, the pill gliding to
the chosen option; the compare table uses it as its plan picker on phones. Give a plan a `yearly` price to show the
switch; `tag` is the small Black tag after the monthly price. `onBillingChange` (React) and the `billing-change` event
fire when the switch moves. The lights drift only while the cards are on screen, and stay still with reduced motion.
