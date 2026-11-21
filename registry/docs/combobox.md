---
name: combobox
title: Combobox
type: registry:ui
group: ui
description: "A field-like trigger that opens a list to pick one option from, with a filter over it, on the #171717 overlay panel: the menus' rows, a #262626 fill on the row the arrows or the pointer are on, the pick checked at the end. The list scrolls with fading edges, so no row is cut off."
use_for: "One choice from a list long enough to filter: a category, a brand, a board. With the filter off it is a plain listbox for a handful of options."
never:
  - "Many picks at once: it holds one value"
  - "Writing your own arrow, Escape or outside-press handling"
  - "A shadow under the panel, or a spectrum color on the highlighted row"
source: "Derived from the guidelines: the input's #363636 hairline and the brand corner for the trigger, the #171717 card fill and neutral hairlines for the panel, DM Sans 14px rows. shadcn's combobox (a popover and a command list) for anatomy and keys."
files:
  - react/components/ui/Combobox.tsx
examples:
  - "Category | With a filter | center"
  - "Format | A plain listbox | center"
---

The value is `value` with `onValueChange` (React) or the `value` property with `change` (web component). `pinned`
options stay above a hairline and are never filtered ("All formats").
