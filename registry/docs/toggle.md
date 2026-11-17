---
name: toggle
title: Toggle
type: registry:ui
group: ui
description: "A button that stays pressed: no fill or a hairline at rest, the primary White with Black text while it is on. Sizes match the button's."
use_for: "One option that is on or off in a row of filters or tools: video only, saved only, show captions."
never:
  - "A setting saved at once: use Switch"
  - "A pick of one from several: use Toggle Group or Tabs"
  - "A spectrum color for the pressed state"
source: "Derived from the brand guidelines (no toggle in the brand assets): the button's sizes, corner and press, White as the one pressed state"
files:
  - react/components/ui/Toggle.tsx
examples:
  - "Toolbar | Filters | center"
  - "Sizes | Sizes | center"
---
