---
name: cursor-effects
title: Cursor effects
type: registry:ui
group: visuals
description: "One cursor effect for the whole page on a fixed canvas behind it: a dashed trail of the brand light when the mouse flicks (the site's default), a soft circle of ASCII characters over empty page, or a burst of light chips where a thrown mouse stops. Clear of text, controls and pictures."
use_for: "A marketing site's layout, once, under everything; with the ASCII lens for the drifts and the button glow."
never:
  - "More than one on a page"
  - "On touch, with reduced motion or forced colours"
  - "In a product screen, where the pointer is working"
source: "Site effect/PointerEffects, CursorSwitch (a trail, b lens, c burst), CursorTrail, CursorLens, CursorBurst and their cursor-*-effect.module.css: fixed, z -1, plus-lighter, shown for (hover: hover) and (pointer: fine) without reduced motion"
files:
  - react/components/visuals/CursorEffects.tsx
  - lib/effects/cursor.ts
  - lib/effects/cursor-trail.ts
  - lib/effects/cursor-lens.ts
  - lib/effects/cursor-burst.ts
  - lib/effects/ink.ts
examples:
  - "Trail | Trail"
  - "Lens | Lens"
  - "Burst | Burst"
---
