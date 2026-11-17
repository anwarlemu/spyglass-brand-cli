---
name: brand-light
title: Brand light
type: registry:ui
group: visuals
description: "The brand pattern, generated: one shape drawn three times in Red #DF0000 (0.85), Green #00FF29 (0.782) and Blue #1B1DFF (0.782), each shifted sideways, blurred and blended plus-lighter on Black. Seeded, in every variant the brand assets use."
use_for: "Behind a hero, along a section's edge, beside a photo or under a search bar: a band, a field, a corner flow, strips down the sides, a tile, a close-up or a curved strip. A main mass and a smaller counterpart elsewhere."
never:
  - "Boxed in with hard edges in the middle of a layout: it flows in from edges and corners"
  - "On any ground but Black"
  - "As a screenshot or an image file: draw it from the generator"
  - "Recolored, or animated in a loop"
source: "Brand guidelines page 33 (Brand pattern); Figma page 8: Heat map (slide 1 light), Light R, G and B layers (opacity 0.85, 0.782, 0.782; offset 1.52% of the heat map's width; blur 7.8 of 2913), and every Light band, field, strip, tile and close-up window"
files:
  - react/components/visuals/BrandLight.tsx
  - lib/light.ts
  - lib/light-master.ts
examples:
  - "Band | Band"
  - "Variants | Every variant"
  - "Generated | Generated heat maps"
---
`source="brand"` (the default) cuts its windows from the brand's own heat map: seeds 0 up to the number of brand windows
for a variant reproduce the brand assets' windows exactly, and higher seeds move and scale them a little.
`source="generated"` builds a new heat map from the seed, the same way. The same seed draws the same light everywhere:
in React, in the web component, in `spyglass-ds light` and in the image and video templates.
