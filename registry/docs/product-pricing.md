---
name: product-pricing
title: Product pricing
type: registry:ui
group: site
description: "The site's product pricing section. receipt (the site's): the head, the free note and two buttons beside a receipt of three records at the rate, the free row and the total in credits with what is left of the free month; open: the rate set large beside what is free; plans: what each plan buys at the rate; rate: the rate alone in a ruled card."
use_for: "The pricing section of a product page, with the product's own rate and records."
never:
  - "A total that does not add up: the item counts it from the rate and the rows"
  - "Prices other than the plans you sell"
  - "Two White buttons"
source: "Site pages/Products/ProductPricing, ProductPricingReceipt, ProductPricingOpen, ProductPricingPlans (and their CSS modules, ProductPricing.content.ts): the receipt on --raised with --radius-m, 16px in (32 from 768), rows ruled by --line with 48px pictures (64 from 768) 4:5, the total under --line-strong in h5 (h4 from 768); copy 5fr to 7fr from 1024 with 64px between (96 at 1280); the rate in h1-alt, display-s at 768 and display-l at 1024"
files:
  - react/components/site/ProductPricing.tsx
examples:
  - "Receipt | Receipt | bleed"
  - "Open | What is free | bleed"
  - "Plans | What each plan buys | bleed"
  - "Rate | The rate alone | bleed"
---
The receipt counts its total from `value` (the leading number, one credit by default) times the rows, and what is left
from `freeMonthly`. A row without `picture` shows a neutral block; the free row without one shows the empty frame with a
plus. `plans` reads the leading number of each plan's `credits` to say how many records it buys, and shows `after`
when there is none.

Each row's `picture` takes a src or an image slot; the neutral block and the free row's empty frame carry
`data-ds-placeholder`.
