---
name: toggle-group
title: Toggle Group
type: registry:ui
group: ui
description: "Buttons that stay pressed, side by side on one track with the brand corner. Each pressed one is a White block with Black text. On a narrow screen the track scrolls with fading edges."
use_for: "Options that are on or off together in a filter row: which formats to show, a grid size. `multiple` for several at once."
never:
  - "Views of one thing: use Tabs"
  - "Actions: use Button"
  - "A spectrum color or a glow on the pressed block"
source: "Derived from the brand guidelines (no segmented control in the brand assets): the input's hairline and corner, White as the one pressed state"
files:
  - react/components/ui/ToggleGroup.tsx
examples:
  - "Formats | Several or one | center"
---
