---
name: dropdown-menu
title: Dropdown menu
type: registry:ui
group: ui
description: "A button that opens a short list of actions or choices on the #262626 overlay surface: a neutral hairline, the brand corner, rows that take a #262626 fill under the pointer. Arrows, Home, End, Escape and Tab are handled."
use_for: "A creative's actions, a sort order, account actions: a handful of choices that don't need to stay on screen. Radio rows for one choice from a few."
never:
  - "Writing your own outside-click or arrow handling"
  - "A shadow under the panel: the hairline and the #262626 fill set it apart"
  - "A spectrum color for a row or its marker"
  - "Two or three views of one thing (use tabs)"
source: "Derived from the guidelines: the #262626 card fill on Black, neutral hairlines, the 10px canvas corner (8px here), DM Sans 14px rows and capital labels at 6%. shadcn's dropdown menu for anatomy and keys."
files:
  - react/components/ui/DropdownMenu.tsx
  - react/components/ui/MenuItem.tsx
  - react/components/ui/MenuLabel.tsx
  - react/components/ui/MenuSeparator.tsx
examples:
  - "Actions | A creative's actions | center"
  - "Sort | Radio rows | center"
---

`MenuItem`, `MenuLabel` and `MenuSeparator` are the rows of every menu here (the context menu uses them too); they are
also exported under shadcn's names (`DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`).
