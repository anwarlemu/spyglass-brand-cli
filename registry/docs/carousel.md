---
name: carousel
title: Carousel
type: registry:ui
group: ui
description: "Slides in a row on the Black ground, 16px apart, one to three in view, with ghost arrow buttons and the place in tabular figures. Native scroll snap: a swipe, a trackpad, the arrows and the arrow keys all move it. It never plays on its own."
use_for: "A row of saved creatives, quotes or offers that would crowd the page side by side. One slide in view on phones."
never:
  - "Autoplay"
  - "Icons that move when the arrows are hovered"
  - "Dots in spectrum colors: the place reads in figures"
  - "Hiding the only copy of something important on a later slide"
source: "Derived from the guidelines: creatives on Black with the #171717 card fill, the 10px canvas corner (8px here), DM Sans figures. shadcn's carousel (a region with slide groups and previous and next) for anatomy and ARIA."
files:
  - react/components/ui/Carousel.tsx
examples:
  - "Creatives | Saved creatives, three in view"
  - "Quotes | One at a time | center"
---
