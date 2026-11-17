---
name: button-group
title: Button group
type: registry:ui
group: ui
description: "Buttons that belong together, joined into one block: the brand corner on the outer corners only and a 1px Black seam between them. A field with its button, a button with its menu arrow, or a vertical stack."
use_for: "Paging, a pair of views, save with a choice of board, an email field with its Invite button."
never:
  - "Unrelated actions in one group"
  - "Two primary buttons in one group"
  - "A border around the whole group"
source: "Derived from the guidelines: the brand button (White primary, #262626 secondary, the 10px canvas corner, 8px here) on Black. shadcn's button group for anatomy."
files:
  - react/components/ui/ButtonGroup.tsx
examples:
  - "Toolbar | Toolbar | center"
  - "Field | A field and a stack | center"
---
