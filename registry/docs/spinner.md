---
name: spinner
title: Spinner
type: registry:ui
group: ui
description: "Work with no known end: a quarter arc in the color around it, White on Black, turning on a #363636 ring at a constant speed. With reduced motion it breathes instead of turning."
use_for: "A search, a save or a load that takes more than a moment, beside the words that say what is happening or inside the busy button."
never:
  - "A spinner where the shape of the content is known: use Skeleton"
  - "Progress that can be counted: use Progress"
  - "A colored, glowing or spectrum spinner"
  - "A blank screen with only a spinner"
source: "Derived from the brand guidelines (no loading state in the brand assets): White on Black, the neutral steps for the ring"
files:
  - react/components/ui/Spinner.tsx
examples:
  - "States | Where it goes | center"
---
