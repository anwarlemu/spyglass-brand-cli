---
name: dispersion-field
title: Dispersion field
type: registry:ui
group: visuals
description: "The brand light drawn live in WebGL: soft blobs of light bent by slow waves, split into Blue, Green and Red, with the ASCII ghost of the light around them, in one of the site's compositions. It drifts while on screen and brings a lens under a mouse; with reduced motion it is one still frame."
use_for: "The light behind a hero, a closing band, the footer's wordmark or a product run, filling a positioned section behind the content; seeded so a page always draws the same field."
never:
  - "Under text people read: it sits behind the content, which keeps clear of its brightest parts"
  - "Boxed into a small card as an illustration"
  - "More than one live field in view"
  - "Moving with reduced motion, or the lens on touch"
source: "Site effect/DispersionField with engine.ts, layout.ts, shader.ts, drag.ts, stills.ts and lens.ts: 8 by 16 glyph cells from \" .:-=+*#\" at 0.35, blur step min(6, max(4, 0.3125vw)), 30 frames a second idle, lens radius 240, zoom 0.12, widen 0.5; compositions hero, close, band, frame, logo, crown, works, ring, horizon, wordmark, run; the works stills public/brand/light/field/works-*.webp from 1024; the per-width values the site's tokens set (the horizon's tilt 0.04 and cross 0.5 from 1024, the run's card, rise, offset, stage and depth from 768) read from the -md, -lg and -xl tokens"
files:
  - react/components/visuals/DispersionField.tsx
  - lib/effects/field.ts
  - lib/effects/field-engine.ts
  - lib/effects/field-layout.ts
  - lib/effects/field-shader.ts
  - lib/effects/field-drag.ts
  - lib/effects/field-stills.ts
examples:
  - "Hero | Behind a hero | bleed"
  - "Compositions | Compositions"
---
