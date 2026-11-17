---
name: separator
title: Separator
type: registry:ui
group: ui
description: "The hairline: 1px in the #262626 edge step, across or down. Spyglass separates with a fill or a hairline, never a shadow."
use_for: "Splitting a card's head from its body, or links in a row. Decorative by default; mark it semantic when it splits content a screen reader should hear as split."
never:
  - "A shadow or a thicker rule to separate"
  - "A rule where spacing already separates"
  - "A colored or glowing line: the spectrum belongs to the light"
source: "Derived from the brand guidelines (no separator in the brand assets): the neutral steps for the hairline"
files:
  - react/components/ui/Separator.tsx
examples:
  - "Profile | Across and down | center"
---
