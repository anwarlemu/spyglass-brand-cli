---
name: product-features
title: Product features
type: registry:ui
group: site
description: "The site's product feature rows: one row per thing the product does, the title, lead and an optional quiet button beside a 4:3 stage on the #262626 fill where the ASCII texture shows around a clear middle and the feature's picture sits; copy 5 parts to the stage's 7 from 1024, every other row flipped, stacked below."
use_for: "The body of a product page: three or four features, each with a product visual on its stage."
never:
  - "A stage without a picture"
  - "More than one button in a row"
  - "Rows that do not alternate"
source: "Site pages/Products/ProductFeatures (ProductFeatures.module.css): rows 80px apart (120 from 768), .t-h2 titles (24/28, 32/36 at 768, 40/44 at 1280, weight 450), .t-lead 16px under, a quiet button 32px under; the stage 4:3, --radius-m, --surface, the ASCII texture at --features-ascii-tile and --features-ascii-opacity (screen) masked clear in a 46% by 50% ellipse; 5fr/7fr from 1024 with a 64px gap (96 at 1280), flipped rows 7fr/5fr"
files:
  - react/components/site/ProductFeatures.tsx
examples:
  - "Rows | Two features | bleed"
---
Each feature's `visual` (React) or the slot `visual-1`, `visual-2`... (web component) fills its stage; the stage is a
size container named `stage`, so a picture can size itself with `cqi`. On a product page the visuals are the product
visual item's kinds.
