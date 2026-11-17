---
name: creative-row
title: Creative row
type: registry:ui
group: site
description: "A row of 4/5 creatives: even, as the banners line them up 16px apart, or peak, rising to the middle and centered on one line, as the deck cover sets them."
use_for: "A strip of proof beside a headline: a banner, a deck cover, the band under a hero. The row shrinks with its box and never scrolls."
never:
  - "A row that scrolls sideways: show fewer creatives"
  - "More than seven creatives in a row"
source: "Figma page 8: X banner, Creative row (six 120x150, 16px apart); Pitch deck cover, Row of creatives (200x250, 240x300, 304x380, 240x300, 200x250, 16px apart)"
files:
  - react/components/site/CreativeRow.tsx
examples:
  - "Even | Even"
  - "Peak | Rising to the middle"
---
