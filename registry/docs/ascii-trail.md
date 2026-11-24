---
name: ascii-trail
title: ASCII trail
type: registry:ui
group: visuals
description: "A mouse leaves a short trail of ASCII characters that fades in 700ms, over one section or, fixed behind it, the whole page. Only for a fine pointer; off on touch and with reduced motion."
use_for: "A quiet response to the pointer on a page head, a 404 or a coming-soon page, behind the content."
never:
  - "Over text people read: it sits behind the content"
  - "On touch, or with reduced motion"
  - "Two on one page (a page trail and a section trail)"
source: "Site effect/AsciiTrail (AsciiTrail.tsx, trail.ts, AsciiTrail.module.css): 8 by 16 cells from \" .:-=+*#\", radius --ascii-trail-radius 72px, fade --ascii-trail-fade 700ms, opacity --ascii-trail-opacity 0.35; page mode fixed at z -1"
files:
  - react/components/visuals/AsciiTrail.tsx
  - lib/effects/ascii-trail.ts
examples:
  - "Section | Over a section"
---
