---
name: features-block
title: Features block
type: registry:block
group: blocks
description: "The home's features: a centered head and four cards in two columns, each a stage that shows the product working over its title and line: the media strip, the accounts burst, the graph ring and the patterns tally."
use_for: "What the product gives, shown in four short scenes rather than listed."
never:
  - "Other companies' ads, logos or platform marks without permission: the defaults are Acme placeholders and plain names"
  - "More than four cards"
  - "The stages moving with reduced motion: each rests on one frame"
source: "Site v2/V2Features (V2Features.tsx and .module.css, MediaStrip, AccountsBurst with its data, ring and hook, PatternsTally, v2/V2Why GraphRing, v2/motion/findSimilar.ts and saveFromAnywhere.ts): two columns 32px apart from 768, 4/3 stages with the ASCII texture at their edges, titles 20/24 under them with 88px between rows (52 on phones); the strip's camera track at 30 fps, the burst's ring at 60, the ring's twist over 208 frames, the tally's reel glide 400ms and the read hold 2800ms"
files:
  - react/components/blocks/FeaturesBlock.tsx
  - lib/home/features.ts
  - lib/home/accounts-burst.ts
examples:
  - "Features | Acme placeholders | bleed"
---
