---
name: drawer
title: Drawer
type: registry:ui
group: ui
description: "A panel that slides in from an edge over a Black scrim, on the #171717 overlay surface: from the bottom with the brand corner on its top edge and a grab handle, or from the left or right at full height. The body's edges fade while there is more to scroll."
use_for: "A choice or a short list on a phone (a format, a sort, the pages), where a dropdown would be cramped. The scrim, Escape and the close button close it."
never:
  - "A long form: use a page"
  - "A shadow on its edge: the hairline sets it apart"
  - "Corners on the edge it slides from"
source: "Derived from the guidelines: the #171717 card fill on Black, neutral hairlines, the 10px canvas corner (8px here), Funnel Display titles, 44px touch rows. shadcn's drawer for anatomy and behavior (no drag to dismiss yet)."
files:
  - react/components/ui/Drawer.tsx
examples:
  - "Format | From the bottom | center"
  - "Navigation | From the left | center"
---
