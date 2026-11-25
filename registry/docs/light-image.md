---
name: light-image
title: Light image
type: registry:ui
group: visuals
description: "One of the site's pre-made light pictures (or your own) with the ASCII grain drawn where its light falls off into Black; with a mask, a mouse brings a lens that magnifies the light and widens its Blue, Green and Red split."
use_for: "The light behind a hero or a pricing run, placed at an edge and behind the content, where the grain carries it into the page."
never:
  - "Under text people read: the lens and the grain sit behind the content, at the edges"
  - "A photo, a screenshot or a third party's picture as the light: it is for light art"
  - "Boxed in a card: the light bleeds off an edge"
  - "The lens on touch or with reduced motion: it stays the picture"
source: "Site effect/LightImage (LightImage.tsx, grain.ts, lens-gl.ts, LightImage.module.css) and effect/lens.ts: grain cells 8 by 16 from \" .:-=+*#\" at --ascii-trail-opacity 0.35, reach --light-grain-reach 64px, lens --light-grain-lens 192px; lens radius 240, magnify 0.12, widen 0.5, follow 14, ease 7; the art public/brand/light/hero-band.webp (2800 by 696) and pricing-light.webp with its mask (2640 by 1400, split 24); data-offscreen on the box while it is off screen when there is no lens (LightImage.tsx's IntersectionObserver)"
files:
  - react/components/visuals/LightImage.tsx
  - lib/effects/grain.ts
  - lib/effects/lens-gl.ts
  - lib/effects/lens.ts
  - lib/effects/pointer.ts
  - lib/effects/light-image.ts
  - lib/effects/light-art.ts
examples:
  - "Band | The hero band | bleed"
  - "Lens | With its lens | bleed"
---
