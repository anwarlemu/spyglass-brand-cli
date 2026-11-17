---
name: hero-block
title: Hero block
type: registry:block
group: blocks
description: "The top of a page as the slides, posts and ads set it: a Funnel Display headline, a line of DM Sans and one White button on Black, with the light flowing in and the media (a search bar, a row of creatives) under the copy."
use_for: "The first thing on a website page. Left with a search bar on a band of the light (the ad), centered under the light field (the offer post), or right-aligned over creatives on the curved strip (the deck cover)."
never:
  - "A headline that does not end with a period, or in title case"
  - "Two White buttons"
  - "The light boxed in the middle of the copy, recolored or moving"
  - "Text over the creatives"
source: "Figma page 8: Ad, The only creative search engine (headline at 64,168, the line at 312, the search bar on a Light band); Post, Offer and Ad, Creator plan offer (centered under the Light field); Pitch deck cover, Curved strip (headline at the top right, creatives over the curved strip)"
files:
  - react/components/blocks/HeroBlock.tsx
examples:
  - "Search | Left, with the search bar on a band | bleed"
  - "Strip | Right, over the curved strip | bleed"
  - "Centered | Centered under the light | bleed"
---
`light` sets where the light flows: `field` from the top edge, `corner` from the bottom right, `band` across the media
and `strip` above it, or `none`. `texture` adds the ASCII texture behind it. The headline takes inline nodes in React
(the deck's creatives between the words) and a `headline` slot in the web component.
