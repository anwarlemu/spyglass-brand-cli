---
name: progress
title: Progress
type: registry:ui
group: ui
description: "How far a task has got: a White bar on a 6px #262626 track with round ends, sliding to each new value on transform. Without a value, a short bar sweeps across at a steady pace."
use_for: "An import, an upload or a scan that can be counted, with the number in text beside it; a long search with no known end."
never:
  - "Percentages with no label or number beside the bar"
  - "A striped, glowing or spectrum-colored bar"
  - "Work that ends in under a second: show nothing"
source: "Derived from the brand guidelines (no progress bar in the brand assets): White on Black, the neutral steps for the track"
files:
  - react/components/ui/Progress.tsx
examples:
  - "Import | Counted and open-ended | center"
---
