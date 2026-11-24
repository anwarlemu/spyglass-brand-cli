---
name: ascii-lens
title: ASCII lens
type: registry:ui
group: visuals
description: "A mouse lens over the page's ASCII drifts and textures: near the pointer, the texture's empty cells fill with more characters, denser where the texture is. One per page; it finds the drifts itself."
use_for: "A marketing page with ASCII drifts, next to the cursor effects in the layout."
never:
  - "More than one on a page"
  - "On touch or with reduced motion"
source: "Site effect/AsciiLens: the texture tile read at 135 by 68 cells, near and far blurs 1.5 and 4, alpha 0.3, gain 2.5, the shared lens (240px, follow 14, ease 7)"
files:
  - react/components/visuals/AsciiLens.tsx
  - lib/effects/ascii-lens.ts
examples:
  - "Drifts | Over drifts | bleed"
---
