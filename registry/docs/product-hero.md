---
name: product-hero
title: Product hero
type: registry:ui
group: site
description: "The site's product hero: the product's name and line centered with two buttons, then the composer typing each question at a human pace over its row of result cards turned away in perspective; a row flicks in, drifts while it is read and flicks out as the question is erased. A card under a mouse or focused turns to face you with its detail rising in. The works light behind it, or the ASCII texture in the margins."
use_for: "The top of a product page: the questions the product answers, each with the results it returns."
never:
  - "Results the product cannot return"
  - "People's photos or other brands' pictures you may not show: pass your own pictures, or figures"
  - "More than one White button"
  - "Under another hero: one per page"
source: "Site pages/Products/ProductHero, ResultsRun (ProductHero.module.css, V3Search.module.css .composer, conveyor.ts flick, humanTyping.ts): the head 120px from the top, 800px wide, .t-head and .t-lead, buttons 12px apart (stacked under 768); the composer 40px under, min(640px, 100% - gutters), --surface on --line-surface with --radius-l; the stage 48px under with 24px above the cards and 64 below; cards --ph-card-w 192 (144 under 768), turned -24deg in an 800px perspective, 8px apart, five from 768 to 1279; the flick over --dur-loop-flick 1400ms, hold --dur-ph-hold 7s, drift --search-drift 8px a second; the detail after --dur-ph-detail-intent 80ms, facts 40ms apart; the works stills public/brand/light/field fading out over --ph-light-foot 160px"
files:
  - react/components/site/ProductHero.tsx
  - lib/product-hero.ts
  - lib/works-light.ts
examples:
  - "Creators | Lit, two questions | bleed"
  - "Unlit | The texture in the margins | bleed"
---
Each set is a question and its results; a result shows a `picture` (4:5), a `pair` of pictures or a `stat` figure,
optional `notes` chips, a `mark` beside its `label`, and the `detail` that rises in on hover or focus (facts that do
not fit are dropped from the end). The light is the site's pre-drawn still of its works light; pass the dispersion
field (composition `works`) through `light` (React) or the `light` slot (web component) to make it live: it lies
over the still and covers it once it has drawn.
