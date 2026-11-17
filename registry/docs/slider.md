---
name: slider
title: Slider
type: registry:ui
group: ui
description: "A value on a range: a 4px #363636 track, White up to the value, and a White thumb with the small corner. It follows the hand without easing."
use_for: "A rough value where the range matters more than the digit: how long an ad has run, a share, a budget. Show the value beside it."
never:
  - "Exact values a person would rather type: use Input"
  - "A round, glowing or growing thumb"
  - "Animating the thumb: it follows the hand"
source: "Derived from the brand guidelines (no slider in the brand assets): White for the filled part, the neutral steps for the track, the small corner"
files:
  - react/components/ui/Slider.tsx
examples:
  - "Filter | As a filter | center"
  - "States | States | center"
---
