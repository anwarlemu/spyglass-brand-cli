---
name: resizable
title: Resizable
type: registry:ui
group: ui
description: "Two panes and the #363636 hairline between them. The hairline is the handle: it turns White under the pointer, while dragged and when focused, and can carry a small grip. Arrow keys move it too. A pane that overflows scrolls with fading edges."
use_for: "A list beside the thing that is open (boards and a creative), or results over notes, where people want to choose how much room each gets."
never:
  - "A thick or colored divider: the hairline is the handle"
  - "Panes that can close to nothing: set a minimum"
  - "Easing on the drag: the split follows the hand"
source: "Derived from the brand guidelines (no split view in the brand assets): the neutral steps for the hairline, White for the active state, the plan card's fill for the grip"
files:
  - react/components/ui/Resizable.tsx
examples:
  - "Panes | Side by side, with a grip | center"
  - "Vertical | One over the other | center"
---
