---
name: use-case-wheel
title: Use case wheel
type: registry:block
group: blocks
description: "The site's use cases wheel: the headline inside an ellipse of creatives over a drum of audiences. The pill holds the current audience beside a White arrow link; every 2.4s on screen it turns, a new pair of creatives scaling up at the foot while the others climb the ring (50ms apart, turning away as they rise) and the top pair leaves into the distance."
use_for: "Showing who a product is for, one audience at a time, linking each to its use case page. `items` takes { key, label, line, href, linkLabel, pairs } with three pairs of creatives each (Acme placeholders by default, or `src` images); `light` puts a light layer behind it and can take the ring's ripple."
never:
  - "Another brand's ads shipped in the library: placeholders, or the user's own creatives through `src`"
  - "Turning by itself with reduced motion (it crossfades and stays put)"
  - "Turning while the pointer or keyboard focus is in the drum"
  - "More than one White button in the section"
source: "Site v2/V2UseCases (UseCaseWheel.tsx, skillsMotion.ts, ringLight.ts, V2UseCases.module.css) and tokens.css 355-393 and 659-700: ring 152x216 (300x240 at 768, 384x292 at 1024, 440x332 at 1280; 140 tall under 768), cards 48x64 to 108x144, 3 to 5 slots, 96px below; the drum's 52px rows, a 312px pill 12px in with the 36px arrow; turns every 2400ms over 600ms on cubic-bezier(0.85, 0, 0.15, 1), 50ms stagger, new pair from 0.4 fading in over 500ms after 100ms, crossfade 360ms with reduced motion; the ring hidden under 768"
files:
  - react/components/blocks/UseCaseWheel.tsx
  - lib/use-case-wheel.ts
examples:
  - "Wheel | Use case wheel | bleed"
---
With `autoplay` it turns on its own once half the window has reached it, and stops when the tab is hidden. A pointer
resting on another label turns to it; a click queues a turn behind one in progress. The heading is the site's `.t-h1`
(32, 44 at 768, 56 only from 1280: `type-section` held at 44 until then), centered on the ring's middle and at most 480px wide.
