---
name: wordmark-glow
title: Wordmark glow
type: registry:ui
group: visuals
description: "The big wordmark across an area in the footer gray over a faint 20px dot grid; a mouse lights the dots near it and the letters it crosses in the spectrum, the light easing after the pointer. The footer's other look (the site's footer uses the dispersion field's light by default)."
use_for: "A footer or a closing band ending on the wordmark, with the footer's card as its children."
never:
  - "The wordmark in a color, or the glow without the pointer: it stays the footer gray"
  - "More than once on a page"
  - "Moving with reduced motion: the letters keep a still glow"
source: "Site effect/WordmarkGlow (WordmarkGlow.tsx, WordmarkGlow.effect.module.css) and site/Footer/FooterWordmarkGlow: glow radius --footer-glow-radius 260px, centre 0.375 of the width above the word, dots --footer-dot-pitch 20px at white 0.1 fading in over 128px, strength 0.8, the spectrum swept every 90 degrees, masks easing over --dur-footer-glow 450ms on --ease-footer-glow"
files:
  - react/components/visuals/WordmarkGlow.tsx
  - lib/effects/wordmark-glow.ts
  - lib/effects/wordmark-glow-css.ts
examples:
  - "Footer | A footer | bleed"
---
