---
name: ascii-texture
title: ASCII texture
type: registry:ui
group: visuals
description: "The brand's ASCII texture, generated: Geist Mono characters from \" .:-=+*#\" read off a soft heat map, White at 0.35 opacity on Black. Seeded, with areas kept clear."
use_for: "A quiet grain behind the light and around the content of a hero, a post or a deck slide, where the light fades out."
never:
  - "As the main graphic"
  - "Over text, the logo or a photo: keep those areas clear"
  - "At full opacity, or in a color"
source: "Brand guidelines page 34 (ASCII texture); Figma page 8: ASCII texture (native) text layers, Geist Mono 13.333px at 1.2, opacity 0.35"
files:
  - react/components/visuals/AsciiTexture.tsx
  - lib/ascii.ts
examples:
  - "Field | A field"
  - "Clear | Clear around a headline"
---
