---
name: tooltip
title: Tooltip
type: registry:ui
group: ui
description: "A control's name, for icon buttons: a White fill with Black caption text and the small corner. It waits 300ms under the pointer, shows at once on keyboard focus, and the next one in a row shows at once."
use_for: "Naming icon buttons in a row of tools: save, copy link, download. The button still carries its aria-label."
never:
  - "Anything someone needs to read or act on: put it on the page"
  - "A tooltip on a button that already shows its label"
  - "Showing on touch: a tap presses the button"
source: "Derived from the brand guidelines (no tooltip in the brand assets): White on Black as the brand's type, DM Sans caption size, the small corner"
files:
  - react/components/ui/Tooltip.tsx
examples:
  - "Tools | Icon buttons in a row | center"
---
