---
name: ascii-drift
title: ASCII drift
type: registry:ui
group: visuals
description: "A crop of the site's ASCII texture tile behind a section, fading out radially from one side: quiet at 0.5, faint at 0.32, or the hero's full strength with a wider core."
use_for: "A quiet grain at the edge of a hero, a page head or a closing band, behind the content; the classes size and place it inside a positioned section."
never:
  - "Over text or a photo: put it at an edge, behind the content"
  - "As the main graphic"
  - "Moving: the drift is still"
source: "Site ui/AsciiDrift (AsciiDrift.module.css): public/brand/textures/ascii-texture@2x.webp at 1080px, crops mass (-120, -592), column (0, -16), cluster (-336, -248), scatter (-808, -560); a radial mask from 24% (56% for the hero), opacity --ascii-quiet 0.5 or --ascii-faint 0.32"
files:
  - react/components/visuals/AsciiDrift.tsx
  - lib/ascii-drift.ts
  - lib/textures.ts
examples:
  - "Section | Behind a section | bleed"
  - "Hero | Hero strength | bleed"
---
