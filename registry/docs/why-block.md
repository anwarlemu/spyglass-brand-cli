---
name: why-block
title: Why block
type: registry:block
group: blocks
description: "The home's reasons: a centered head and three pictures over their titles and lines, hairlines between, each picture an instrument that plays while half of it is on screen: the archive axis, the pricing meter and ten tools giving way to one."
use_for: "Saying why in three short reasons, each shown working rather than claimed."
never:
  - "More than three reasons"
  - "A real advertiser's name or ads without permission: the archive's default is Acme with placeholder creatives"
  - "The instruments moving with reduced motion: they rest on one frame"
source: "Site v2/V2Why (V2Why.tsx and .module.css, ArchiveAxis, WhyPricing, WhyCustom; content/v2/why, whyArchive, whyPricing, whyCustom; components/instrument/clock.ts as lib/home/scene.ts, V2Features Demo as lib/home/demo.ts): the 64px head margin (80 at 1024), cards 48px apart in a 640px column, three columns 40px apart at 1280 with hairlines between; 14/13 pictures, 16px in (24 from 768); the loop pacing (2600ms step, 700ms change, 1400ms flick, 500ms row fade) on the loop ease"
files:
  - react/components/blocks/WhyBlock.tsx
  - lib/home/why.ts
  - lib/home/scene.ts
  - lib/home/demo.ts
examples:
  - "Reasons | Three instruments | bleed"
---
Each picture is an image slot (`src`, `alt`, `fit`, `position`); without `src` it keeps its placeholder, which carries
`data-ds-placeholder`.
