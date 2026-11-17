---
name: creative-card
title: Creative card
type: registry:ui
group: site
description: "A creative as the brand shows it: an ad, a product shot or a UGC frame in the brand corner, its color exactly as posted. Without an image it draws a neutral placeholder, so no layout needs a third-party photo."
use_for: "Every creative on a page or in a view: search results, boards, the hero's row, a ring or a corridor. Pass the image as `src` (the user's own creative); the placeholder stands in until there is one."
never:
  - "A filter, a tint, a grade or neon over the image: color as posted"
  - "A border, a shadow or a glow around it"
  - "Another brand's photo in a template or an example: use the placeholder or the user's image"
  - "Moving or zooming on hover"
source: "Brand guidelines page 36 (Brand imagery: real creative, color as posted, on Black); Figma page 8: every Creative rounded rectangle (ads 4/5, the post's 200 squares, the ad's 296x400 three up, the ring's 160x114 and 112x146)"
files:
  - react/components/site/CreativeCard.tsx
  - lib/creative-layouts.ts
examples:
  - "Placeholder | Placeholders"
  - "Shapes | Shapes"
---
`src` is used exactly as given: object-fit cover, no filter. Without `src` the card is a neutral gradient from two
neutral steps (`tone` 1 to 4) with the advertiser in capitals (from 112px wide) and a headline (from 192px wide), named
for assistive tech by `alt` or by those two. The arrangements (creative grid, row, ring and corridor) take the same
fields as a list.
